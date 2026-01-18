/**
 * Business Calculator Logic
 * All calculations for pricing, costs, and profitability analysis
 */

export interface BusinessInputs {
  users: number;
  conversionRate: number; // percentage (e.g., 3 for 3%)
  proUsageRate: number; // percentage (e.g., 60 for 60%)
  proPrice: number; // dollars per month
  freeCredits: number;
  proCredits: number;
  claudeCost: number; // monthly cost
  domainCost: number; // yearly cost
  costPerCredit: number; // cost per credit (default 0.001)
}

export interface InfrastructureBreakdown {
  neon: number;
  vercel: number;
  resend: number;
  supadata: number;
  railway: number;
  total: number;
}

export interface ServiceUpgrade {
  service: string;
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
}

export interface BusinessResults {
  // User counts
  proUsers: number;
  freeUsers: number;

  // Revenue
  revenue: number;

  // Costs breakdown
  freeAICost: number;
  proAICost: number;
  totalAICost: number;
  infrastructureCost: number;
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
 * Calculate infrastructure costs based on user count
 */
export function calculateInfrastructure(users: number): InfrastructureBreakdown {
  let neon = 0;
  let vercel = 0;
  let resend = 0;
  let supadata = 0;
  let railway = 0;

  // Neon: Free < 500, $19 Launch 500-10000, $69 Scale 10000+
  if (users >= 500 && users < 10000) {
    neon = 19;
  } else if (users >= 10000) {
    neon = 69;
  }

  // Resend: Free < 1000, $20 Pro 1000+
  if (users >= 1000) {
    resend = 20;
  }

  // Vercel: Free < 2000, $20 Pro 2000+
  if (users >= 2000) {
    vercel = 20;
  }

  // Supadata: Free < 3000, $9 Starter 3000-7000, $49 Pro 7000+
  if (users >= 3000 && users < 7000) {
    supadata = 9;
  } else if (users >= 7000) {
    supadata = 49;
  }

  // Railway: Free < 5000, $5 Hobby 5000+
  if (users >= 5000) {
    railway = 5;
  }

  return {
    neon,
    vercel,
    resend,
    supadata,
    railway,
    total: neon + vercel + resend + supadata + railway,
  };
}

/**
 * Get service upgrade milestones
 */
export function getServiceUpgrades(currentUsers: number): ServiceUpgrade[] {
  return [
    {
      service: "Neon",
      from: "Free",
      to: "Launch ($19)",
      cost: 19,
      triggerUsers: 500,
      isActive: currentUsers >= 500,
    },
    {
      service: "Resend",
      from: "Free",
      to: "Pro ($20)",
      cost: 20,
      triggerUsers: 1000,
      isActive: currentUsers >= 1000,
    },
    {
      service: "Vercel",
      from: "Hobby",
      to: "Pro ($20)",
      cost: 20,
      triggerUsers: 2000,
      isActive: currentUsers >= 2000,
    },
    {
      service: "Supadata",
      from: "Free",
      to: "Starter ($9)",
      cost: 9,
      triggerUsers: 3000,
      isActive: currentUsers >= 3000 && currentUsers < 7000,
    },
    {
      service: "Railway",
      from: "Free",
      to: "Hobby ($5)",
      cost: 5,
      triggerUsers: 5000,
      isActive: currentUsers >= 5000,
    },
    {
      service: "Supadata",
      from: "Starter",
      to: "Pro ($49)",
      cost: 49,
      triggerUsers: 7000,
      isActive: currentUsers >= 7000,
    },
    {
      service: "Neon",
      from: "Launch",
      to: "Scale ($69)",
      cost: 69,
      triggerUsers: 10000,
      isActive: currentUsers >= 10000,
    },
  ];
}

/**
 * Generate projection rows for different user counts
 */
export function generateProjections(inputs: BusinessInputs): ProjectionRow[] {
  const userCounts = [100, 500, 1000, 2000, 5000, 10000, 25000, 50000];

  return userCounts.map((users) => {
    const proUsers = Math.floor(users * (inputs.conversionRate / 100));
    const freeUsers = users - proUsers;

    const revenue = proUsers * inputs.proPrice;

    // AI costs
    const freeAICost = freeUsers * inputs.freeCredits * inputs.costPerCredit; // Free users use 100%
    const proAICost =
      proUsers *
      inputs.proCredits *
      (inputs.proUsageRate / 100) *
      inputs.costPerCredit;
    const totalAICost = freeAICost + proAICost;

    // Infrastructure
    const infrastructure = calculateInfrastructure(users);

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

  // Revenue
  const revenue = proUsers * inputs.proPrice;

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

  // Infrastructure costs
  const infrastructureBreakdown = calculateInfrastructure(inputs.users);
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
  const costPerFree = inputs.freeCredits * inputs.costPerCredit; // Cost per free user
  const proAICostPerUser =
    inputs.proCredits * (inputs.proUsageRate / 100) * inputs.costPerCredit;
  const profitPerPro = inputs.proPrice - proAICostPerUser;
  const revenuePerUser = inputs.users > 0 ? revenue / inputs.users : 0;

  // Break-even analysis
  // How many pro users needed to cover all costs?
  const breakEvenProUsers =
    profitPerPro > 0
      ? Math.ceil(
          (freeAICost + infrastructureCost + fixedCosts) / profitPerPro
        )
      : Infinity;

  // What conversion rate needed at current user count?
  const breakEvenConversion =
    inputs.users > 0 && profitPerPro > 0
      ? (breakEvenProUsers / inputs.users) * 100
      : Infinity;

  // How many total users needed at current conversion rate?
  const breakEvenUsers =
    inputs.conversionRate > 0 && profitPerPro > 0
      ? Math.ceil(breakEvenProUsers / (inputs.conversionRate / 100))
      : Infinity;

  // Service upgrades
  const serviceUpgrades = getServiceUpgrades(inputs.users);

  // Projections
  const projections = generateProjections(inputs);

  return {
    proUsers,
    freeUsers,
    revenue,
    freeAICost,
    proAICost,
    totalAICost,
    infrastructureCost,
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
