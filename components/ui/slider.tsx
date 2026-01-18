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
      "relative flex w-full touch-none select-none items-center group py-1",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-sm bg-neutral-300 dark:bg-neutral-700 border-0 transition-colors">
      <SliderPrimitive.Range className="absolute h-full bg-orange-500 rounded-sm transition-all" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-sm border-2 border-primary bg-white shadow transition-all duration-150 hover:scale-110 hover:shadow-[0_0_8px_rgba(234,88,12,0.4)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 active:scale-95 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
