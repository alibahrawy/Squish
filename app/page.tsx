"use client";

import { BusinessCalculator } from "@/components/business-calculator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Calculator } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Unified Header */}
      <header className="sticky top-0 z-50 terminal-header border-b border-border/50">
        <div className="container mx-auto px-6 flex h-16 items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Calculator className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold">
                  Squish
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-white">
                  Pro
                </span>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                SaaS Profitability Calculator
              </p>
            </div>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <BusinessCalculator />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/20 dark:bg-muted/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calculator className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-medium">Squish v1.0</span>
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
