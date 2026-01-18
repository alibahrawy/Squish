"use client";

import { BusinessCalculator } from "@/components/business-calculator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Calculator, Activity, TrendingUp, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Terminal Header */}
      <header className="sticky top-0 z-50 terminal-header border-b border-border/50">
        <div className="container mx-auto px-6 flex h-14 items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/20">
              <Calculator className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-sm font-semibold tracking-tight">
                SQUISH
              </h1>
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                <div className="status-dot active" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-primary">
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Activity className="h-3 w-3 text-primary" />
                <span className="font-mono">Real-time Analysis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="font-mono">Projections</span>
              </div>
            </div>
            <div className="h-4 w-px bg-border hidden md:block" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Command Bar / Hero */}
      <div className="border-b border-border/50 bg-muted/30 dark:bg-muted/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-sm font-semibold">SaaS Profitability Calculator</h2>
                <span className="badge-terminal badge-amber">PRO</span>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                Squeeze every insight from your business model - optimize pricing, costs & projections
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <BusinessCalculator />
      </main>

      {/* Terminal Footer */}
      <footer className="border-t border-border/50 bg-muted/20 dark:bg-muted/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
                  <Calculator className="h-3 w-3 text-primary" />
                </div>
                <span className="font-mono">SQUISH v1.0</span>
              </div>
              <span className="text-border">|</span>
              <span className="font-mono">Session Active</span>
            </div>
            <p className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-wider">
              Next.js + Tailwind + Recharts
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
