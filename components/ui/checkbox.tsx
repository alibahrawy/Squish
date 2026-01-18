"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Base styles
      "peer h-5 w-5 shrink-0 rounded border-2 transition-all duration-200",
      // Default state - more visible
      "border-slate-400 dark:border-slate-500",
      "bg-white dark:bg-slate-800",
      // Hover
      "hover:border-amber-500 hover:shadow-[0_0_8px_rgba(255,149,0,0.25)]",
      // Focus
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      // Checked state
      "data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-500 data-[state=checked]:text-white",
      "data-[state=checked]:shadow-[0_0_10px_rgba(255,149,0,0.4)]",
      // Disabled
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-3.5 w-3.5 stroke-[3]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
