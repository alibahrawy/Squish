"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-auto items-center gap-1.5 rounded-lg p-1.5 text-muted-foreground",
      "bg-slate-100 dark:bg-slate-800/80",
      "border border-slate-200 dark:border-slate-700",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styles
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200",
      // Default state - more visible
      "text-slate-600 dark:text-slate-400",
      "hover:text-foreground hover:bg-white dark:hover:bg-slate-700",
      // Focus state
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50",
      // Active state - Bloomberg amber
      "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700",
      "data-[state=active]:text-foreground",
      "data-[state=active]:shadow-md",
      "data-[state=active]:border-b-2 data-[state=active]:border-amber-500",
      // Dark mode active glow
      "dark:data-[state=active]:shadow-[0_2px_12px_rgba(255,149,0,0.2)]",
      // Disabled
      "disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 focus-visible:outline-none focus-visible:ring-0",
      // Fade in animation
      "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1",
      "data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
