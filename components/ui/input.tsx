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
        "h-10 w-full min-w-0 rounded-md border bg-background px-3 py-2 text-sm transition-all duration-200",
        // Border and shadow
        "border-input shadow-sm",
        // Placeholder
        "placeholder:text-muted-foreground/60",
        // Hover state
        "hover:border-primary/30 hover:shadow-[0_0_10px_rgba(255,149,0,0.1)]",
        // Focus state - amber glow
        "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,149,0,0.15),0_0_20px_rgba(255,149,0,0.15)]",
        // Dark mode enhancements
        "dark:bg-muted/30 dark:hover:bg-muted/50",
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
