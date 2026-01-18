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
import { Label } from "@/components/ui/label";
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
      onServicesChange([...selectedServices, { serviceId }]);
    }
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
    const sortedTiers = [...service.tiers].sort(
      (a, b) => b.triggerAt - a.triggerAt
    );
    const activeTier =
      sortedTiers.find((tier) => users >= tier.triggerAt) || service.tiers[0];
    return sum + activeTier.baseCost;
  }, 0);

  // Get service price display
  const getServicePriceDisplay = (service: Service) => {
    if (service.category === "payments") {
      return `${service.feePercent}% + $${service.perTransaction}/txn`;
    }
    const sortedTiers = [...service.tiers].sort(
      (a, b) => b.triggerAt - a.triggerAt
    );
    const activeTier =
      sortedTiers.find((tier) => users >= tier.triggerAt) || service.tiers[0];
    return `${formatCurrency(activeTier.baseCost)}/mo`;
  };

  // Get active tier name
  const getActiveTierName = (service: Service) => {
    if (service.category === "payments") return "";
    const sortedTiers = [...service.tiers].sort(
      (a, b) => b.triggerAt - a.triggerAt
    );
    const activeTier =
      sortedTiers.find((tier) => users >= tier.triggerAt) || service.tiers[0];
    return activeTier.name;
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
        {/* Category Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ServiceCategory)}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-4 sm:grid-cols-8 h-auto gap-1 p-1 mb-4">
            {CATEGORIES.map((category) => {
              const count = getCategoryCount(category.id);
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
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Service Lists */}
          {CATEGORIES.map((category) => (
            <TabsContent
              key={category.id}
              value={category.id}
              className="mt-0 space-y-1"
            >
              <p className="text-xs text-muted-foreground mb-3">
                {category.description}
              </p>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                {getServicesByCategory(category.id).map((service) => (
                  <ServiceRow
                    key={service.id}
                    service={service}
                    isSelected={isSelected(service.id)}
                    onToggle={() => toggleService(service.id)}
                    priceDisplay={getServicePriceDisplay(service)}
                    tierName={getActiveTierName(service)}
                    expandedInfo={expandedInfo}
                    onToggleInfo={() =>
                      setExpandedInfo(
                        expandedInfo === service.id ? null : service.id
                      )
                    }
                  />
                ))}
              </div>
            </TabsContent>
          ))}
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
  tierName: string;
  expandedInfo: string | null;
  onToggleInfo: () => void;
}

function ServiceRow({
  service,
  isSelected,
  onToggle,
  priceDisplay,
  tierName,
  expandedInfo,
  onToggleInfo,
}: ServiceRowProps) {
  const isExpanded = expandedInfo === service.id;

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
        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle()}
          onClick={(e) => e.stopPropagation()}
        />

        {/* Service Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{service.name}</span>
            {service.recommended && (
              <span className="badge-terminal badge-orange flex items-center gap-1">
                <Star className="h-2.5 w-2.5" />
                <span>Recommended</span>
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {service.description}
          </p>
        </div>

        {/* Pricing */}
        <div className="text-right shrink-0">
          <div className="text-sm font-mono font-medium text-primary">
            {priceDisplay}
          </div>
          {tierName && (
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {tierName}
            </div>
          )}
        </div>

        {/* Info Toggle */}
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

      {/* Expanded Info */}
      <CollapsibleContent className="px-3 pb-2">
        <div className="mt-2 p-3 rounded-sm bg-muted/30 border border-border/30 space-y-2">
          {/* Tier Breakdown */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
              Pricing Tiers
            </div>
            <div className="flex flex-wrap gap-2">
              {service.tiers.map((tier, i) => (
                <div
                  key={i}
                  className="text-xs px-2 py-1 rounded bg-background border border-border/50"
                >
                  <span className="font-medium">{tier.name}</span>
                  <span className="text-muted-foreground ml-1">
                    ${tier.baseCost}
                    {tier.triggerAt > 0 && (
                      <span className="text-[10px]"> @ {tier.triggerAt}+ users</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Gotchas */}
          {service.gotchas && service.gotchas.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                Things to Know
              </div>
              <ul className="space-y-1">
                {service.gotchas.map((gotcha, i) => (
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

          {/* Cost Estimates */}
          {service.costPer1kUsers && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                Est. Cost @ 1K Users
              </div>
              <div className="flex gap-3 text-xs">
                <span>
                  Low: <span className="text-green-500 font-mono">${service.costPer1kUsers.low}</span>
                </span>
                <span>
                  Med: <span className="text-orange-500 font-mono">${service.costPer1kUsers.medium}</span>
                </span>
                <span>
                  High: <span className="text-red-500 font-mono">${service.costPer1kUsers.high}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
