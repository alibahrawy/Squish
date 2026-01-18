"use client";

import { BusinessCalculator } from "@/components/business-calculator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Calculator } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Terminal Header */}
      <header className="sticky top-0 z-50 terminal-header">
        <div className="container mx-auto px-4 flex h-12 items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-primary/10 border border-primary/20">
              <Calculator className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-wider">
                Squish
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                SaaS Profitability Calculator
              </p>
            </div>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        <BusinessCalculator />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Calculator className="h-3 w-3 text-primary" />
              <span>SQUISH v1.0.0</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
              Next.js + Tailwind + Recharts
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
