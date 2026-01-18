import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const isNumber = type === "number"

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "h-11 w-full min-w-0 rounded-md border px-3 py-2 text-sm transition-all duration-200",
        // Background - more visible
        "bg-white dark:bg-slate-800",
        // Border - more contrast
        "border-slate-300 dark:border-slate-600",
        // Text color
        "text-foreground",
        // Placeholder
        "placeholder:text-muted-foreground/70",
        // Hover state
        "hover:border-amber-400 hover:shadow-[0_0_10px_rgba(255,149,0,0.15)]",
        // Focus state - amber glow
        "focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:shadow-[0_0_15px_rgba(255,149,0,0.2)]",
        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Number input - monospace font
        isNumber && "font-mono tabular-nums tracking-tight",
        className
      )}
      {...props}
    />
  )
}

export { Input }
