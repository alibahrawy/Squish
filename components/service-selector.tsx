"use client";

import * as React from "react";
import {
  Database,
  Server,
  Shield,
  Mail,
  CreditCard,
  BarChart3,
  HardDrive,
  Cog,
  Info,
  Star,
  Package,
  Zap,
  ChevronRight,
  Gift,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CATEGORIES,
  SERVICES,
  Service,
  ServiceCategory,
  getServicesByCategory,
  getServiceById,
} from "@/lib/services-data";
import { SelectedService } from "@/lib/business-calculations";
import { formatCurrency } from "@/lib/business-calculations";

// Services that have free tiers not suitable for commercial use
// These will show a tier toggle to switch to a paid commercial tier
const COMMERCIAL_TIER_SERVICES: Record<string, { freeTierIndex: number; commercialTierIndex: number; warning: string }> = {
  vercel: {
    freeTierIndex: 0, // Hobby
    commercialTierIndex: 1, // Pro
    warning: "Hobby tier is not for commercial use",
  },
  netlify: {
    freeTierIndex: 0, // Starter
    commercialTierIndex: 1, // Pro
    warning: "Starter tier has limited commercial rights",
  },
};

// Icon mapping for categories
const categoryIcons: Record<ServiceCategory, React.ReactNode> = {
  database: <Database className="h-3.5 w-3.5" />,
  hosting: <Server className="h-3.5 w-3.5" />,
  auth: <Shield className="h-3.5 w-3.5" />,
  email: <Mail className="h-3.5 w-3.5" />,
  payments: <CreditCard className="h-3.5 w-3.5" />,
  analytics: <BarChart3 className="h-3.5 w-3.5" />,
  storage: <HardDrive className="h-3.5 w-3.5" />,
  jobs: <Cog className="h-3.5 w-3.5" />,
};

const categoryNames: Record<ServiceCategory, string> = {
  database: "Database",
  hosting: "Hosting",
  auth: "Auth",
  email: "Email",
  payments: "Payments",
  analytics: "Analytics",
  storage: "Storage",
  jobs: "Jobs",
};

interface ServiceSelectorProps {
  selectedServices: SelectedService[];
  onServicesChange: (services: SelectedService[]) => void;
  users: number;
}

export function ServiceSelector({
  selectedServices,
  onServicesChange,
  users,
}: ServiceSelectorProps) {
  const [activeTab, setActiveTab] = React.useState<ServiceCategory>("database");
  const [expandedInfo, setExpandedInfo] = React.useState<string | null>(null);

  // Check if a service is selected
  const isSelected = (serviceId: string) =>
    selectedServices.some((s) => s.serviceId === serviceId);

  // Toggle service selection
  const toggleService = (serviceId: string) => {
    if (isSelected(serviceId)) {
      onServicesChange(
        selectedServices.filter((s) => s.serviceId !== serviceId)
      );
    } else {
      // If this service has commercial tier requirements, default to commercial tier
      const commercialConfig = COMMERCIAL_TIER_SERVICES[serviceId];
      const newService: SelectedService = { serviceId };
      if (commercialConfig) {
        newService.forceTierIndex = commercialConfig.commercialTierIndex;
      }
      onServicesChange([...selectedServices, newService]);
    }
  };

  // Change the forced tier for a service
  const setForcedTier = (serviceId: string, tierIndex: number | undefined) => {
    onServicesChange(
      selectedServices.map((s) =>
        s.serviceId === serviceId ? { ...s, forceTierIndex: tierIndex } : s
      )
    );
  };

  // Get the forced tier index for a service
  const getForcedTierIndex = (serviceId: string): number | undefined => {
    const selected = selectedServices.find((s) => s.serviceId === serviceId);
    return selected?.forceTierIndex;
  };

  // Get services that bundle the current category (shows "included free" message)
  const getBundledByServices = (category: ServiceCategory): Service[] => {
    return selectedServices
      .map((s) => getServiceById(s.serviceId))
      .filter((s): s is Service =>
        s !== undefined &&
        s.bundledCategories?.includes(category) === true
      );
  };

  // Get count of selected services per category
  const getCategoryCount = (category: ServiceCategory) =>
    selectedServices.filter((s) => {
      const service = getServiceById(s.serviceId);
      return service?.category === category;
    }).length;

  // Get total estimated base cost
  const totalBaseCost = selectedServices.reduce((sum, selected) => {
    const service = getServiceById(selected.serviceId);
    if (!service || service.category === "payments") return sum;

    // Use forced tier if set
    if (selected.forceTierIndex !== undefined && service.tiers[selected.forceTierIndex]) {
      return sum + service.tiers[selected.forceTierIndex].baseCost;
    }

    const sortedTiers = [...service.tiers].sort(
      (a, b) => b.triggerAt - a.triggerAt
    );
    const activeTier =
      sortedTiers.find((tier) => users >= tier.triggerAt) || service.tiers[0];
    return sum + activeTier.baseCost;
  }, 0);

  // Get service price display
  const getServicePriceDisplay = (service: Service, forcedTierIndex?: number) => {
    if (service.category === "payments" && service.pricingModel === "percentage") {
      return `${service.feePercent}% + $${service.perTransaction}/txn`;
    }

    let activeTier;
    if (forcedTierIndex !== undefined && service.tiers[forcedTierIndex]) {
      activeTier = service.tiers[forcedTierIndex];
    } else {
      const sortedTiers = [...service.tiers].sort(
        (a, b) => b.triggerAt - a.triggerAt
      );
      activeTier = sortedTiers.find((tier) => users >= tier.triggerAt) || service.tiers[0];
    }

    if (activeTier.feePercent !== undefined && activeTier.feePercent !== null) {
      return `${formatCurrency(activeTier.baseCost)}/mo + ${activeTier.feePercent}%`;
    }
    return `${formatCurrency(activeTier.baseCost)}/mo`;
  };

  // Get active tier (with fallback for services with no tiers)
  const getActiveTier = (service: Service, forcedTierIndex?: number) => {
    if (!service.tiers || service.tiers.length === 0) {
      return { name: "N/A", baseCost: 0, triggerAt: 0 };
    }

    // Use forced tier if set
    if (forcedTierIndex !== undefined && service.tiers[forcedTierIndex]) {
      return service.tiers[forcedTierIndex];
    }

    const sortedTiers = [...service.tiers].sort(
      (a, b) => b.triggerAt - a.triggerAt
    );
    return sortedTiers.find((tier) => users >= tier.triggerAt) || service.tiers[0];
  };

  return (
    <Card>
      <CardHeader className="!flex !flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <Server className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Select Your Stack</CardTitle>
            <CardDescription>Choose the services for your SaaS</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-sm bg-muted border border-border">
            <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Services</span>
            <span className="font-mono font-semibold text-lg tabular-nums transition-all duration-300">{selectedServices.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-sm bg-primary/10 border border-primary/30">
            <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Est. Cost</span>
            <span className="font-mono font-semibold text-lg tabular-nums text-primary transition-all duration-300">
              {formatCurrency(totalBaseCost)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ServiceCategory)}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-4 sm:grid-cols-8 h-auto gap-1 p-1 mb-4">
            {CATEGORIES.map((category) => {
              const count = getCategoryCount(category.id);
              const bundledBy = getBundledByServices(category.id);
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="gap-1.5 text-[10px] py-2 px-2 relative"
                >
                  {categoryIcons[category.id]}
                  <span className="hidden sm:inline">{category.name}</span>
                  {count > 0 && (
                    <span className="min-w-[18px] h-4 px-1 rounded-sm bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                      {count}
                    </span>
                  )}
                  {bundledBy.length > 0 && count === 0 && (
                    <Gift className="h-3 w-3 text-green-500" />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {CATEGORIES.map((category) => {
            const bundledBy = getBundledByServices(category.id);

            return (
              <TabsContent
                key={category.id}
                value={category.id}
                className="mt-0 space-y-1"
              >
                <p className="text-xs text-muted-foreground mb-3">
                  {category.description}
                </p>

                {/* Show "Included with" banner if another service bundles this */}
                {bundledBy.length > 0 && (
                  <div className="mb-3 p-3 rounded-sm bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Gift className="h-4 w-4" />
                      <span className="font-medium">
                        {category.name} included free with:
                      </span>
                      {bundledBy.map((s) => (
                        <Badge key={s.id} variant="outline" className="bg-green-500/20 border-green-500/40">
                          {s.name}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-6">
                      You may not need a separate {category.name.toLowerCase()} service
                    </p>
                  </div>
                )}

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {getServicesByCategory(category.id).map((service) => {
                    const forcedTierIndex = getForcedTierIndex(service.id);
                    return (
                    <ServiceRow
                      key={service.id}
                      service={service}
                      isSelected={isSelected(service.id)}
                      onToggle={() => toggleService(service.id)}
                      priceDisplay={getServicePriceDisplay(service, forcedTierIndex)}
                      activeTier={getActiveTier(service, forcedTierIndex)}
                      forcedTierIndex={forcedTierIndex}
                      onTierChange={(tierIndex) => setForcedTier(service.id, tierIndex)}
                      commercialConfig={COMMERCIAL_TIER_SERVICES[service.id]}
                      expandedInfo={expandedInfo}
                      onToggleInfo={() =>
                        setExpandedInfo(
                          expandedInfo === service.id ? null : service.id
                        )
                      }
                      users={users}
                    />
                  );
                  })}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Individual service row component
interface ServiceRowProps {
  service: Service;
  isSelected: boolean;
  onToggle: () => void;
  priceDisplay: string;
  activeTier: Service["tiers"][0];
  expandedInfo: string | null;
  onToggleInfo: () => void;
  users: number;
  forcedTierIndex?: number;
  onTierChange?: (tierIndex: number | undefined) => void;
  commercialConfig?: { freeTierIndex: number; commercialTierIndex: number; warning: string };
}

function ServiceRow({
  service,
  isSelected,
  onToggle,
  priceDisplay,
  activeTier,
  expandedInfo,
  onToggleInfo,
  users,
  forcedTierIndex,
  onTierChange,
  commercialConfig,
}: ServiceRowProps) {
  const isExpanded = expandedInfo === service.id;
  const hasBundles = service.bundledCategories && service.bundledCategories.length > 0;
  const hasCommercialToggle = commercialConfig && service.tiers.length > 1;
  const isCommercialTier = forcedTierIndex === commercialConfig?.commercialTierIndex;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleInfo}>
      <div
        className={`
          group flex items-center gap-4 p-4 rounded-sm border transition-all duration-200 cursor-pointer
          ${
            isSelected
              ? "border-primary/40 bg-primary/5 dark:bg-primary/10"
              : "border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-border"
          }
        `}
        onClick={onToggle}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle()}
          onClick={(e) => e.stopPropagation()}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{service.name}</span>
            {service.recommended && (
              <span className="badge-terminal badge-orange flex items-center gap-1">
                <Star className="h-2.5 w-2.5" />
                <span>Recommended</span>
              </span>
            )}
            {hasBundles && (
              <span className="badge-terminal badge-green flex items-center gap-1">
                <Package className="h-2.5 w-2.5" />
                <span>+{service.bundledCategories!.length} included</span>
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {service.description}
          </p>
          {/* Show bundled categories */}
          {hasBundles && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-muted-foreground">Also includes:</span>
              {service.bundledCategories!.map((cat) => (
                <span key={cat} className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-600 dark:text-green-400">
                  {categoryNames[cat as ServiceCategory] || cat}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="text-right shrink-0">
          {/* Tier Toggle for Commercial Services */}
          {hasCommercialToggle && isSelected && (
            <div
              className="flex items-center gap-1 mb-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={`text-[10px] px-2 py-0.5 rounded-l border transition-colors ${
                  !isCommercialTier
                    ? "bg-muted border-border text-muted-foreground"
                    : "bg-primary/10 border-primary/40 text-primary font-medium"
                }`}
                onClick={() => onTierChange?.(commercialConfig!.freeTierIndex)}
              >
                {service.tiers[commercialConfig!.freeTierIndex]?.name || "Free"}
              </button>
              <button
                className={`text-[10px] px-2 py-0.5 rounded-r border transition-colors ${
                  isCommercialTier
                    ? "bg-primary/10 border-primary/40 text-primary font-medium"
                    : "bg-muted border-border text-muted-foreground"
                }`}
                onClick={() => onTierChange?.(commercialConfig!.commercialTierIndex)}
              >
                {service.tiers[commercialConfig!.commercialTierIndex]?.name || "Pro"}
              </button>
            </div>
          )}
          <div className="text-sm font-mono font-medium text-primary">
            {priceDisplay}
          </div>
          {activeTier.name && (
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {activeTier.name}
              {hasCommercialToggle && !isCommercialTier && isSelected && (
                <span className="text-orange-500 ml-1">(non-commercial)</span>
              )}
            </div>
          )}
        </div>

        <CollapsibleTrigger asChild>
          <button
            className={`
              p-1.5 rounded transition-colors
              ${isExpanded ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"}
            `}
            onClick={(e) => {
              e.stopPropagation();
              onToggleInfo();
            }}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </CollapsibleTrigger>
      </div>

      {/* Expanded Info Panel */}
      <CollapsibleContent className="px-3 pb-2">
        <div className="mt-2 p-4 rounded-sm bg-muted/30 border border-border/30 space-y-4">

          {/* Capabilities */}
          {service.capabilities && service.capabilities.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Capabilities
              </div>
              <div className="flex flex-wrap gap-1.5">
                {service.capabilities.slice(0, 12).map((cap, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-background border border-border/50"
                  >
                    {cap}
                  </span>
                ))}
                {service.capabilities.length > 12 && (
                  <span className="text-[11px] px-2 py-0.5 text-muted-foreground">
                    +{service.capabilities.length - 12} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Current Tier Features */}
          {activeTier.features && activeTier.features.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                {activeTier.name} Tier Features ({users.toLocaleString()} users)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {activeTier.features.slice(0, 8).map((feature, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <ChevronRight className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
                {activeTier.features.length > 8 && (
                  <div className="text-xs text-muted-foreground col-span-2">
                    +{activeTier.features.length - 8} more features
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Tiers */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              All Pricing Tiers
            </div>
            <div className="flex flex-wrap gap-2">
              {service.tiers.map((tier, i) => {
                const isActive = tier.name === activeTier.name;
                return (
                  <div
                    key={i}
                    className={`text-xs px-2 py-1.5 rounded border ${
                      isActive
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "bg-background border-border/50"
                    }`}
                  >
                    <span className="font-medium">{tier.name}</span>
                    <span className="text-muted-foreground ml-1">
                      ${tier.baseCost}
                      {tier.feePercent !== undefined && tier.feePercent !== null && (
                        <span className="text-orange-500"> +{tier.feePercent}%</span>
                      )}
                    </span>
                    {tier.triggerAt > 0 && (
                      <span className="text-[10px] text-muted-foreground ml-1">
                        @ {tier.triggerAt.toLocaleString()}+ users
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gotchas */}
          {service.gotchas && service.gotchas.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                Things to Know
              </div>
              <ul className="space-y-1">
                {service.gotchas.slice(0, 4).map((gotcha, i) => (
                  <li
                    key={i}
                    className="text-xs text-muted-foreground flex items-start gap-1.5"
                  >
                    <span className="text-orange-500 mt-0.5">*</span>
                    {gotcha}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Alternatives */}
          {service.alternatives && service.alternatives.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                Alternatives
              </div>
              <div className="flex flex-wrap gap-1.5">
                {service.alternatives.map((alt, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded bg-muted border border-border/50"
                  >
                    {alt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cost Estimates */}
          {service.costPer1kUsers && (
            <div className="pt-2 border-t border-border/30">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                Est. Monthly Cost @ 1K Users
              </div>
              <div className="flex gap-4 text-xs">
                <span>
                  Light: <span className="text-green-500 font-mono">${service.costPer1kUsers.low}</span>
                </span>
                <span>
                  Medium: <span className="text-orange-500 font-mono">${service.costPer1kUsers.medium}</span>
                </span>
                <span>
                  Heavy: <span className="text-red-500 font-mono">${service.costPer1kUsers.high}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
