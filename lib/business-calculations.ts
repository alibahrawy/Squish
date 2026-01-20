/**
 * Business Calculator Logic
 * All calculations for pricing, costs, and profitability analysis
 * Now supports dynamic service selection
 */

import {
  Service,
  ServiceTier,
  calculateServiceCost,
  getServiceById,
  SERVICES,
} from "./services-data";

// Selected service with optional custom tier pricing
export interface SelectedService {
  serviceId: string;
  customTiers?: ServiceTier[]; // Override default pricing
  forceTierIndex?: number; // Force a specific tier (e.g., Pro instead of Hobby for commercial use)
}

export interface BusinessInputs {
  users: number;
  conversionRate: number; // percentage (e.g., 3 for 3%)
  proUsageRate: number; // percentage (e.g., 60 for 60%)
  proPrice: number; // dollars per month
  freeCredits: number;
  proCredits: number;
  claudeCost: number; // monthly cost (fixed dev tools)
  domainCost: number; // yearly cost
  costPerCredit: number; // cost per credit (default 0.001)
  selectedServices: SelectedService[]; // Dynamic services
  // For payment processor calculation
  averageTransactionValue?: number; // Optional for percentage-based payment services
}

// Dynamic infrastructure breakdown - service ID to cost mapping
export interface InfrastructureBreakdown {
  [serviceId: string]: number;
  total: number;
}

export interface ServiceUpgrade {
  service: string;
  serviceId: string;
  from: string;
  to: string;
  cost: number;
  triggerUsers: number;
  isActive: boolean;
}

export interface ProjectionRow {
  users: number;
  freeUsers: number;
  proUsers: number;
  revenue: number;
  totalCosts: number;
  profit: number;
  cashReserve: number;
  infrastructure: number;
  paymentFees: number;
}

export interface BusinessResults {
  // User counts
  proUsers: number;
  freeUsers: number;

  // Revenue
  revenue: number;
  grossRevenue: number; // Before payment fees

  // Costs breakdown
  freeAICost: number;
  proAICost: number;
  totalAICost: number;
  infrastructureCost: number;
  paymentProcessingCost: number;
  fixedCosts: number;
  totalCosts: number;

  // Profit
  profit: number;
  profitMargin: number;

  // Cash flow
  cashReserve: number;
  openRouterBuffer: number;

  // Per-user metrics
  profitPerPro: number;
  costPerFree: number;
  revenuePerUser: number;

  // Break-even analysis
  breakEvenProUsers: number;
  breakEvenConversion: number;
  breakEvenUsers: number;

  // Infrastructure
  infrastructureBreakdown: InfrastructureBreakdown;

  // Service upgrades
  serviceUpgrades: ServiceUpgrade[];

  // Projections
  projections: ProjectionRow[];
}

/**
 * Calculate infrastructure costs based on selected services and user count
 */
export function calculateInfrastructure(
  selectedServices: SelectedService[],
  users: number
): InfrastructureBreakdown {
  const breakdown: InfrastructureBreakdown = { total: 0 };

  for (const selected of selectedServices) {
    const service = getServiceById(selected.serviceId);
    if (!service) continue;

    // Skip payment services - they're calculated separately
    if (service.category === "payments") continue;

    // Use custom tiers if provided, otherwise use default
    const tiers = selected.customTiers || service.tiers;

    // Use forced tier index if set, otherwise find active tier based on user count
    let activeTier;
    if (selected.forceTierIndex !== undefined && tiers[selected.forceTierIndex]) {
      activeTier = tiers[selected.forceTierIndex];
    } else {
      const sortedTiers = [...tiers].sort((a, b) => b.triggerAt - a.triggerAt);
      activeTier = sortedTiers.find((tier) => users >= tier.triggerAt) || tiers[0];
    }

    breakdown[selected.serviceId] = activeTier.baseCost;
    breakdown.total += activeTier.baseCost;
  }

  return breakdown;
}

/**
 * Calculate payment processing costs
 * Handles both payment services and auth services with tier-specific transaction fees (like Memberstack)
 */
export function calculatePaymentCosts(
  selectedServices: SelectedService[],
  revenue: number,
  transactionCount: number,
  users: number = 0
): number {
  let totalFees = 0;

  for (const selected of selectedServices) {
    const service = getServiceById(selected.serviceId);
    if (!service) continue;

    // Handle standard payment services with percentage-based pricing
    if (service.category === "payments" && service.pricingModel === "percentage") {
      const feePercent = typeof service.feePercent === 'number' ? service.feePercent : 0;
      const perTransaction = typeof service.perTransaction === 'number' ? service.perTransaction : 0;
      const percentFee = revenue * (feePercent / 100);
      const transactionFee = transactionCount * perTransaction;
      totalFees += percentFee + transactionFee;
    }

    // Handle auth services with tier-specific transaction fees (like Memberstack)
    if (service.category === "auth") {
      const tiers = selected.customTiers || service.tiers;
      const sortedTiers = [...tiers].sort((a, b) => b.triggerAt - a.triggerAt);
      const activeTier = sortedTiers.find((tier) => users >= tier.triggerAt) || tiers[0];

      // If this tier has a transaction fee percentage, apply it
      if (activeTier.feePercent != null && activeTier.feePercent > 0) {
        const tierFee = revenue * (activeTier.feePercent / 100);
        totalFees += tierFee;
      }
    }
  }

  return totalFees;
}

/**
 * Get service upgrade milestones for all selected services
 */
export function getServiceUpgrades(
  selectedServices: SelectedService[],
  currentUsers: number
): ServiceUpgrade[] {
  const upgrades: ServiceUpgrade[] = [];

  for (const selected of selectedServices) {
    const service = getServiceById(selected.serviceId);
    if (!service) continue;

    // Skip payment services - they don't have tier upgrades
    if (service.category === "payments") continue;

    const tiers = selected.customTiers || service.tiers;

    // Sort tiers by trigger point
    const sortedTiers = [...tiers].sort((a, b) => a.triggerAt - b.triggerAt);

    for (let i = 1; i < sortedTiers.length; i++) {
      const fromTier = sortedTiers[i - 1];
      const toTier = sortedTiers[i];

      // Determine if this upgrade is currently active
      const isActive =
        currentUsers >= toTier.triggerAt &&
        (i === sortedTiers.length - 1 ||
          currentUsers < sortedTiers[i + 1]?.triggerAt);

      upgrades.push({
        service: service.name,
        serviceId: service.id,
        from: `${fromTier.name} ($${fromTier.baseCost})`,
        to: `${toTier.name} ($${toTier.baseCost})`,
        cost: toTier.baseCost,
        triggerUsers: toTier.triggerAt,
        isActive,
      });
    }
  }

  // Sort by trigger users
  return upgrades.sort((a, b) => a.triggerUsers - b.triggerUsers);
}

/**
 * Generate projection rows for different user counts
 */
export function generateProjections(inputs: BusinessInputs): ProjectionRow[] {
  const userCounts = [100, 500, 1000, 2000, 5000, 10000, 25000, 50000];

  return userCounts.map((users) => {
    const proUsers = Math.floor(users * (inputs.conversionRate / 100));
    const freeUsers = users - proUsers;

    const grossRevenue = proUsers * inputs.proPrice;

    // Payment processing fees
    const avgTransactionValue = inputs.averageTransactionValue || inputs.proPrice;
    const estimatedTransactions = proUsers; // Assume 1 transaction per pro user/month
    const paymentFees = calculatePaymentCosts(
      inputs.selectedServices,
      grossRevenue,
      estimatedTransactions,
      users
    );

    const revenue = grossRevenue - paymentFees;

    // AI costs
    const freeAICost = freeUsers * inputs.freeCredits * inputs.costPerCredit;
    const proAICost =
      proUsers *
      inputs.proCredits *
      (inputs.proUsageRate / 100) *
      inputs.costPerCredit;
    const totalAICost = freeAICost + proAICost;

    // Infrastructure
    const infrastructure = calculateInfrastructure(
      inputs.selectedServices,
      users
    );

    // Fixed costs
    const fixedCosts = inputs.claudeCost + inputs.domainCost / 12;

    // Total
    const totalCosts = totalAICost + infrastructure.total + fixedCosts;
    const profit = revenue - totalCosts;

    // Cash reserve (1.2x AI costs + 1 month burn)
    const cashReserve = totalAICost * 1.2 + totalCosts;

    return {
      users,
      freeUsers,
      proUsers,
      revenue,
      totalCosts,
      profit,
      cashReserve,
      infrastructure: infrastructure.total,
      paymentFees,
    };
  });
}

/**
 * Main calculation function
 */
export function calculateBusiness(inputs: BusinessInputs): BusinessResults {
  // User counts
  const proUsers = Math.floor(inputs.users * (inputs.conversionRate / 100));
  const freeUsers = inputs.users - proUsers;

  // Revenue (gross, before payment fees)
  const grossRevenue = proUsers * inputs.proPrice;

  // Payment processing costs
  const avgTransactionValue = inputs.averageTransactionValue || inputs.proPrice;
  const estimatedTransactions = proUsers;
  const paymentProcessingCost = calculatePaymentCosts(
    inputs.selectedServices,
    grossRevenue,
    estimatedTransactions,
    inputs.users
  );

  // Net revenue after payment fees
  const revenue = grossRevenue - paymentProcessingCost;

  // AI costs
  // Free users use 100% of their credits (it's too little not to)
  const freeAICost = freeUsers * inputs.freeCredits * inputs.costPerCredit;
  // Pro users use proUsageRate% of their credits
  const proAICost =
    proUsers *
    inputs.proCredits *
    (inputs.proUsageRate / 100) *
    inputs.costPerCredit;
  const totalAICost = freeAICost + proAICost;

  // Infrastructure costs (dynamic based on selected services)
  const infrastructureBreakdown = calculateInfrastructure(
    inputs.selectedServices,
    inputs.users
  );
  const infrastructureCost = infrastructureBreakdown.total;

  // Fixed costs (Claude Code monthly + domain yearly converted to monthly)
  const fixedCosts = inputs.claudeCost + inputs.domainCost / 12;

  // Total costs
  const totalCosts = totalAICost + infrastructureCost + fixedCosts;

  // Profit
  const profit = revenue - totalCosts;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

  // Cash reserve needed
  const openRouterBuffer = totalAICost * 1.2; // Keep 1.2x monthly AI spend
  const cashReserve = totalCosts + openRouterBuffer;

  // Per-user metrics
  const costPerFree = inputs.freeCredits * inputs.costPerCredit;
  const proAICostPerUser =
    inputs.proCredits * (inputs.proUsageRate / 100) * inputs.costPerCredit;
  const profitPerPro = inputs.proPrice - proAICostPerUser - (paymentProcessingCost / proUsers || 0);
  const revenuePerUser = inputs.users > 0 ? revenue / inputs.users : 0;

  // Break-even analysis
  // How many pro users needed to cover all costs?
  const effectiveProfitPerPro = profitPerPro > 0 ? profitPerPro : 0.01;
  const breakEvenProUsers =
    effectiveProfitPerPro > 0
      ? Math.ceil(
          (freeAICost + infrastructureCost + fixedCosts) / effectiveProfitPerPro
        )
      : Infinity;

  // What conversion rate needed at current user count?
  const breakEvenConversion =
    inputs.users > 0 && effectiveProfitPerPro > 0
      ? (breakEvenProUsers / inputs.users) * 100
      : Infinity;

  // How many total users needed at current conversion rate?
  const breakEvenUsers =
    inputs.conversionRate > 0 && effectiveProfitPerPro > 0
      ? Math.ceil(breakEvenProUsers / (inputs.conversionRate / 100))
      : Infinity;

  // Service upgrades (dynamic)
  const serviceUpgrades = getServiceUpgrades(
    inputs.selectedServices,
    inputs.users
  );

  // Projections
  const projections = generateProjections(inputs);

  return {
    proUsers,
    freeUsers,
    revenue,
    grossRevenue,
    freeAICost,
    proAICost,
    totalAICost,
    infrastructureCost,
    paymentProcessingCost,
    fixedCosts,
    totalCosts,
    profit,
    profitMargin,
    cashReserve,
    openRouterBuffer,
    profitPerPro,
    costPerFree,
    revenuePerUser,
    breakEvenProUsers,
    breakEvenConversion,
    breakEvenUsers,
    infrastructureBreakdown,
    serviceUpgrades,
    projections,
  };
}

/**
 * Format currency
 */
export function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  const prefix = value < 0 ? "-" : "";

  if (absValue >= 1000) {
    return `${prefix}$${absValue.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }

  return `${prefix}$${absValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  if (!isFinite(value)) return "N/A";
  return `${value.toFixed(1)}%`;
}

/**
 * Format number with commas
 */
export function formatNumber(value: number): string {
  if (!isFinite(value)) return "N/A";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// ============================================
// LEGACY SUPPORT (for backward compatibility)
// ============================================

// Default services for backward compatibility
export const DEFAULT_SERVICES: SelectedService[] = [
  { serviceId: "neon" },
  { serviceId: "vercel" },
  { serviceId: "resend" },
  { serviceId: "railway" },
];

/**
 * Legacy function - calculates with default services
 * @deprecated Use calculateBusiness with selectedServices instead
 */
export function calculateInfrastructureLegacy(users: number): {
  neon: number;
  vercel: number;
  resend: number;
  supadata: number;
  railway: number;
  total: number;
} {
  const breakdown = calculateInfrastructure(DEFAULT_SERVICES, users);

  return {
    neon: breakdown["neon"] || 0,
    vercel: breakdown["vercel"] || 0,
    resend: breakdown["resend"] || 0,
    supadata: 0, // Removed from default, can be added back
    railway: breakdown["railway"] || 0,
    total: breakdown.total,
  };
}
