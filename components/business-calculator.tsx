"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  calculateBusiness,
  formatCurrency,
  formatPercent,
  formatNumber,
  type BusinessInputs,
} from "@/lib/business-calculations";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Calculator,
  ChevronDown,
  CheckCircle2,
  Circle,
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Target,
} from "lucide-react";

// Bloomberg Terminal Chart Colors
const COLORS = {
  profit: "#00d26a",      // Bright green
  loss: "#ff3b30",        // Bright red
  revenue: "#ff9500",     // Bloomberg amber/orange
  costs: "#00b8d4",       // Cyan
  ai: "#a855f7",          // Purple
  infrastructure: "#06b6d4", // Teal
  fixed: "#6366f1",       // Indigo
  optimistic: "#00d26a",  // Green
  pessimistic: "#ff3b30", // Red
  realistic: "#ff9500",   // Amber
};

const PIE_COLORS = ["#ff9500", "#00b8d4", "#a855f7", "#6366f1", "#00d26a"];

export function BusinessCalculator() {
  // Input state
  const [users, setUsers] = useState(5000);
  const [conversionRate, setConversionRate] = useState(3);
  const [proUsageRate, setProUsageRate] = useState(60);
  const [proPrice, setProPrice] = useState(8);
  const [freeCredits, setFreeCredits] = useState(100);
  const [proCredits, setProCredits] = useState(5000);
  const [claudeCost, setClaudeCost] = useState(100);
  const [domainCost, setDomainCost] = useState(8);
  const [costPerCredit, setCostPerCredit] = useState(0.001);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Variance settings
  const [conversionVariance, setConversionVariance] = useState(1); // ±1%
  const [usageVariance, setUsageVariance] = useState(15); // ±15%

  // Calculate results
  const inputs: BusinessInputs = useMemo(
    () => ({
      users,
      conversionRate,
      proUsageRate,
      proPrice,
      freeCredits,
      proCredits,
      claudeCost,
      domainCost,
      costPerCredit,
    }),
    [
      users,
      conversionRate,
      proUsageRate,
      proPrice,
      freeCredits,
      proCredits,
      claudeCost,
      domainCost,
      costPerCredit,
    ]
  );

  const results = useMemo(() => calculateBusiness(inputs), [inputs]);

  // Optimistic scenario (higher conversion, lower usage)
  const optimisticInputs: BusinessInputs = useMemo(
    () => ({
      ...inputs,
      conversionRate: Math.min(20, conversionRate + conversionVariance),
      proUsageRate: Math.max(20, proUsageRate - usageVariance),
    }),
    [inputs, conversionRate, conversionVariance, proUsageRate, usageVariance]
  );
  const optimisticResults = useMemo(
    () => calculateBusiness(optimisticInputs),
    [optimisticInputs]
  );

  // Pessimistic scenario (lower conversion, higher usage)
  const pessimisticInputs: BusinessInputs = useMemo(
    () => ({
      ...inputs,
      conversionRate: Math.max(1, conversionRate - conversionVariance),
      proUsageRate: Math.min(100, proUsageRate + usageVariance),
    }),
    [inputs, conversionRate, conversionVariance, proUsageRate, usageVariance]
  );
  const pessimisticResults = useMemo(
    () => calculateBusiness(pessimisticInputs),
    [pessimisticInputs]
  );

  const isProfitable = results.profit >= 0;

  // Generate chart data for profit across user scales
  const profitChartData = useMemo(() => {
    const userCounts = [0, 100, 250, 500, 750, 1000, 1500, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 25000];
    return userCounts.map((u) => {
      const realistic = calculateBusiness({ ...inputs, users: u });
      const optimistic = calculateBusiness({ ...optimisticInputs, users: u });
      const pessimistic = calculateBusiness({ ...pessimisticInputs, users: u });
      return {
        users: u,
        realistic: realistic.profit,
        optimistic: optimistic.profit,
        pessimistic: pessimistic.profit,
      };
    });
  }, [inputs, optimisticInputs, pessimisticInputs]);

  // Cost breakdown for pie chart
  const costBreakdownData = useMemo(() => {
    return [
      { name: "AI (Free)", value: results.freeAICost, color: COLORS.ai },
      { name: "AI (Pro)", value: results.proAICost, color: "#a78bfa" },
      { name: "Infrastructure", value: results.infrastructureCost, color: COLORS.infrastructure },
      { name: "Claude Code", value: claudeCost, color: COLORS.fixed },
      { name: "Domain", value: domainCost / 12, color: "#818cf8" },
    ].filter((item) => item.value > 0);
  }, [results, claudeCost, domainCost]);

  // Revenue vs Costs bar chart data
  const revenueVsCostsData = useMemo(() => {
    const userCounts = [1000, 2000, 5000, 10000, 25000];
    return userCounts.map((u) => {
      const r = calculateBusiness({ ...inputs, users: u });
      return {
        users: `${u / 1000}k`,
        revenue: r.revenue,
        costs: r.totalCosts,
        profit: r.profit,
      };
    });
  }, [inputs]);

  // Scenario comparison data
  const scenarioData = useMemo(() => {
    return [
      {
        scenario: "Pessimistic",
        conversion: pessimisticInputs.conversionRate,
        usage: pessimisticInputs.proUsageRate,
        profit: pessimisticResults.profit,
        proUsers: pessimisticResults.proUsers,
      },
      {
        scenario: "Realistic",
        conversion: inputs.conversionRate,
        usage: inputs.proUsageRate,
        profit: results.profit,
        proUsers: results.proUsers,
      },
      {
        scenario: "Optimistic",
        conversion: optimisticInputs.conversionRate,
        usage: optimisticInputs.proUsageRate,
        profit: optimisticResults.profit,
        proUsers: optimisticResults.proUsers,
      },
    ];
  }, [inputs, optimisticInputs, pessimisticInputs, results, optimisticResults, pessimisticResults]);

  return (
    <div className="space-y-6">
      {/* Main Grid: Inputs and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Inputs
            </CardTitle>
            <CardDescription>
              Adjust variables to find the optimal pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Users & Conversion */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">
                Users & Conversion
              </h4>

              {/* Total Users */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Total Users</Label>
                  <span className="text-sm font-medium">
                    {formatNumber(users)}
                  </span>
                </div>
                <Slider
                  value={[users]}
                  onValueChange={([v]) => setUsers(v)}
                  min={0}
                  max={100000}
                  step={100}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={users}
                  onChange={(e) => setUsers(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full"
                  min={0}
                />
              </div>

              {/* Conversion Rate */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Conversion Rate</Label>
                  <span className="text-sm font-medium">{conversionRate}%</span>
                </div>
                <Slider
                  value={[conversionRate]}
                  onValueChange={([v]) => setConversionRate(v)}
                  min={0.5}
                  max={20}
                  step={0.5}
                  className="w-full"
                />
              </div>

              {/* Pro Usage Rate */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Pro Usage Rate</Label>
                  <span className="text-sm font-medium">{proUsageRate}%</span>
                </div>
                <Slider
                  value={[proUsageRate]}
                  onValueChange={([v]) => setProUsageRate(v)}
                  min={20}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  How much of their credits Pro users actually use
                </p>
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">
                Pricing
              </h4>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Pro Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      value={proPrice}
                      onChange={(e) => setProPrice(Number(e.target.value) || 0)}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Free Credits</Label>
                  <Input
                    type="number"
                    value={freeCredits}
                    onChange={(e) =>
                      setFreeCredits(Number(e.target.value) || 0)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pro Credits</Label>
                  <Input
                    type="number"
                    value={proCredits}
                    onChange={(e) => setProCredits(Number(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Fixed Costs */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">
                Fixed Costs
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Claude Code ($/mo)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      value={claudeCost}
                      onChange={(e) =>
                        setClaudeCost(Number(e.target.value) || 0)
                      }
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Domain ($/year)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      value={domainCost}
                      onChange={(e) =>
                        setDomainCost(Number(e.target.value) || 0)
                      }
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Variance Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">
                Scenario Variance
              </h4>
              <p className="text-xs text-muted-foreground">
                Adjust to see optimistic/pessimistic scenarios
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Conversion ±</Label>
                    <span className="text-sm font-medium">{conversionVariance}%</span>
                  </div>
                  <Slider
                    value={[conversionVariance]}
                    onValueChange={([v]) => setConversionVariance(v)}
                    min={0.5}
                    max={5}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Usage ±</Label>
                    <span className="text-sm font-medium">{usageVariance}%</span>
                  </div>
                  <Slider
                    value={[usageVariance]}
                    onValueChange={([v]) => setUsageVariance(v)}
                    min={5}
                    max={30}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                />
                Advanced Settings
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="space-y-2">
                  <Label>Cost per Credit ($)</Label>
                  <Input
                    type="number"
                    value={costPerCredit}
                    onChange={(e) =>
                      setCostPerCredit(Number(e.target.value) || 0.001)
                    }
                    step={0.0001}
                  />
                  <p className="text-xs text-muted-foreground">
                    Default: $0.001 per credit (1 credit = $0.001)
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isProfitable ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              Results
            </CardTitle>
            <CardDescription>
              {results.proUsers} Pro users, {formatNumber(results.freeUsers)}{" "}
              Free users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-lg border-2 ${isProfitable ? "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900" : "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900"}`}
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  {isProfitable ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  Monthly Profit
                </div>
                <div
                  className={`text-2xl font-bold font-mono tabular-nums ${isProfitable ? "text-emerald-500" : "text-red-500"}`}
                >
                  {isProfitable ? "+" : ""}
                  {formatCurrency(results.profit)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatPercent(results.profitMargin)} margin
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30 dark:bg-muted/10">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Revenue
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-primary">
                  {formatCurrency(results.revenue)}
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-mono">
                  {formatCurrency(results.revenuePerUser)}/user avg
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30 dark:bg-muted/10">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calculator className="h-4 w-4" />
                  Total Costs
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums">
                  {formatCurrency(results.totalCosts)}
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30 dark:bg-muted/10">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <PiggyBank className="h-4 w-4" />
                  Cash Reserve
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums">
                  {formatCurrency(results.cashReserve)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Needed to operate safely
                </div>
              </div>
            </div>

            <Separator />

            {/* Scenario Comparison */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Scenario Range
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-red-500/5 dark:bg-red-500/10 border border-red-500/20">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Pessimistic</div>
                  <div className="text-lg font-semibold font-mono tabular-nums text-red-500">
                    {formatCurrency(pessimisticResults.profit)}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {formatPercent(pessimisticInputs.conversionRate)} / {pessimisticInputs.proUsageRate}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Realistic</div>
                  <div className={`text-lg font-semibold font-mono tabular-nums ${isProfitable ? "text-primary" : "text-red-500"}`}>
                    {formatCurrency(results.profit)}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {formatPercent(inputs.conversionRate)} / {inputs.proUsageRate}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Optimistic</div>
                  <div className="text-lg font-semibold font-mono tabular-nums text-emerald-500">
                    {formatCurrency(optimisticResults.profit)}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {formatPercent(optimisticInputs.conversionRate)} / {optimisticInputs.proUsageRate}%
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Cost Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Cost Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    AI (Free users - 100% usage)
                  </span>
                  <span>{formatCurrency(results.freeAICost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    AI (Pro users - {proUsageRate}% usage)
                  </span>
                  <span>{formatCurrency(results.proAICost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Infrastructure</span>
                  <span>{formatCurrency(results.infrastructureCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Claude Code</span>
                  <span>{formatCurrency(claudeCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Domain</span>
                  <span>{formatCurrency(domainCost / 12)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(results.totalCosts)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Per-User Economics */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Per-User Economics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30 dark:bg-muted/10 border border-emerald-500/20">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Profit per Pro
                  </div>
                  <div className="text-lg font-semibold font-mono tabular-nums text-emerald-500">
                    +{formatCurrency(results.profitPerPro)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 dark:bg-muted/10 border border-red-500/20">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Cost per Free
                  </div>
                  <div className="text-lg font-semibold font-mono tabular-nums text-red-500">
                    -{formatCurrency(results.costPerFree)}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Break-Even Analysis */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Break-Even Analysis
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Pro users needed
                  </span>
                  <span className="font-medium font-mono tabular-nums text-primary">
                    {formatNumber(results.breakEvenProUsers)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Conversion needed
                  </span>
                  <span className="font-medium font-mono tabular-nums text-primary">
                    {formatPercent(results.breakEvenConversion)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total users needed
                  </span>
                  <span className="font-medium font-mono tabular-nums text-primary">
                    {formatNumber(results.breakEvenUsers)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Visualizations
          </CardTitle>
          <CardDescription>
            Visual analysis of profit, costs, and scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profit" className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              <TabsTrigger value="profit" className="gap-2">
                <LineChartIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Profit</span>
              </TabsTrigger>
              <TabsTrigger value="breakdown" className="gap-2">
                <PieChartIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Costs</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Compare</span>
              </TabsTrigger>
              <TabsTrigger value="scenarios" className="gap-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Scenarios</span>
              </TabsTrigger>
            </TabsList>

            {/* Profit vs Users Chart */}
            <TabsContent value="profit" className="space-y-4">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={profitChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="users"
                      tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v}
                      className="text-xs"
                    />
                    <YAxis
                      tickFormatter={(v) => `$${v >= 1000 || v <= -1000 ? `${(v/1000).toFixed(1)}k` : v}`}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value as number), ""]}
                      labelFormatter={(label) => `${formatNumber(label)} users`}
                    />
                    <Legend />
                    <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
                    <Area
                      type="monotone"
                      dataKey="optimistic"
                      name="Optimistic"
                      stroke={COLORS.optimistic}
                      fill={COLORS.optimistic}
                      fillOpacity={0.1}
                    />
                    <Area
                      type="monotone"
                      dataKey="realistic"
                      name="Realistic"
                      stroke={COLORS.realistic}
                      fill={COLORS.realistic}
                      fillOpacity={0.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="pessimistic"
                      name="Pessimistic"
                      stroke={COLORS.pessimistic}
                      fill={COLORS.pessimistic}
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Profit projections across different user counts with scenario ranges
              </p>
            </TabsContent>

            {/* Cost Breakdown Pie Chart */}
            <TabsContent value="breakdown" className="space-y-4">
              <div className="h-[400px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, value, percent }) =>
                        `${name}: ${formatCurrency(value)} (${((percent ?? 0) * 100).toFixed(0)}%)`
                      }
                      outerRadius={140}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Cost distribution breakdown at {formatNumber(users)} users
              </p>
            </TabsContent>

            {/* Revenue vs Costs Bar Chart */}
            <TabsContent value="comparison" className="space-y-4">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueVsCostsData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="users" className="text-xs" />
                    <YAxis
                      tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                      className="text-xs"
                    />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill={COLORS.revenue} />
                    <Bar dataKey="costs" name="Costs" fill={COLORS.costs} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Revenue vs Costs comparison at different scales
              </p>
            </TabsContent>

            {/* Scenarios Comparison */}
            <TabsContent value="scenarios" className="space-y-4">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scenarioData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => formatCurrency(v)}
                      className="text-xs"
                    />
                    <YAxis
                      type="category"
                      dataKey="scenario"
                      className="text-xs"
                      width={80}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        const v = value as number;
                        if (name === "profit") return [formatCurrency(v), "Profit"];
                        if (name === "proUsers") return [v, "Pro Users"];
                        return [v, name];
                      }}
                    />
                    <Legend />
                    <ReferenceLine x={0} stroke="#888" strokeDasharray="3 3" />
                    <Bar
                      dataKey="profit"
                      name="Monthly Profit"
                      fill={COLORS.profit}
                    >
                      {scenarioData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.profit >= 0 ? COLORS.profit : COLORS.loss}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {scenarioData.map((s) => (
                  <div key={s.scenario} className="p-3 rounded-lg bg-muted/50 text-center">
                    <div className="font-medium">{s.scenario}</div>
                    <div className="text-sm text-muted-foreground">
                      {s.conversion}% conv / {s.usage}% usage
                    </div>
                    <div className="text-sm">{s.proUsers} Pro users</div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Projections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Projections at Different Scales</CardTitle>
          <CardDescription>
            With current settings: {conversionRate}% conversion, {proUsageRate}%
            Pro usage, ${proPrice}/mo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Users</TableHead>
                <TableHead className="text-right">Free</TableHead>
                <TableHead className="text-right">Pro</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Infra</TableHead>
                <TableHead className="text-right">Costs</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Cash Reserve</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.projections.map((row) => {
                const rowProfit = row.profit;
                const rowIsProfitable = rowProfit >= 0;

                return (
                  <TableRow
                    key={row.users}
                    className={
                      row.users === users ? "bg-muted/50 font-medium" : ""
                    }
                  >
                    <TableCell>
                      {formatNumber(row.users)}
                      {row.users === users && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Current
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(row.freeUsers)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(row.proUsers)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.revenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.infrastructure)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.totalCosts)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium font-mono tabular-nums ${rowIsProfitable ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {rowIsProfitable ? "+" : ""}
                      {formatCurrency(rowProfit)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.cashReserve)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Service Upgrades Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Service Upgrade Timeline</CardTitle>
          <CardDescription>
            When each service needs upgrading based on user count
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.serviceUpgrades.map((upgrade) => (
              <div
                key={`${upgrade.service}-${upgrade.triggerUsers}`}
                className={`flex items-center gap-4 p-3 rounded-lg border ${
                  upgrade.isActive
                    ? "bg-primary/5 border-primary/20"
                    : "bg-muted/30"
                }`}
              >
                {upgrade.isActive ? (
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{upgrade.service}</div>
                  <div className="text-sm text-muted-foreground">
                    {upgrade.from} → {upgrade.to}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatNumber(upgrade.triggerUsers)} users
                  </div>
                  <div className="text-sm text-muted-foreground">
                    +${upgrade.cost}/mo
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Infrastructure Summary */}
          <div className="mt-6 p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium mb-3">
              Current Infrastructure ({formatNumber(users)} users)
            </h4>
            <div className="grid grid-cols-5 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Neon</div>
                <div className="font-medium">
                  ${results.infrastructureBreakdown.neon}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Vercel</div>
                <div className="font-medium">
                  ${results.infrastructureBreakdown.vercel}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Resend</div>
                <div className="font-medium">
                  ${results.infrastructureBreakdown.resend}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Supadata</div>
                <div className="font-medium">
                  ${results.infrastructureBreakdown.supadata}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Railway</div>
                <div className="font-medium">
                  ${results.infrastructureBreakdown.railway}
                </div>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between font-medium">
              <span>Total Infrastructure</span>
              <span>{formatCurrency(results.infrastructureBreakdown.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
