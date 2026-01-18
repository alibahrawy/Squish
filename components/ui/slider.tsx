"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center group",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-border dark:bg-[#1e293b] border border-border dark:border-[#334155] transition-colors">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-primary to-primary rounded-full shadow-[0_0_8px_rgba(255,149,0,0.4)] transition-all" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-white dark:bg-slate-100 shadow-md transition-all duration-200 hover:scale-110 hover:shadow-[0_0_15px_rgba(255,149,0,0.5)] focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-[0_0_20px_rgba(255,149,0,0.6)] active:scale-95 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
