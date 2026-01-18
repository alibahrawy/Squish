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
        "h-9 w-full min-w-0 rounded-sm border px-3 py-1.5 text-sm transition-all duration-150",
        // Background
        "bg-input",
        // Border
        "border-border",
        // Text color
        "text-foreground",
        // Placeholder
        "placeholder:text-muted-foreground/60",
        // Hover state
        "hover:border-primary/50",
        // Focus state - orange glow
        "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30",
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
