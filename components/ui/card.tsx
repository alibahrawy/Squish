import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        // Base
        "flex flex-col gap-5 rounded-lg border py-5",
        // Background - more visible
        "bg-white dark:bg-slate-900",
        "text-foreground",
        // Border - more contrast
        "border-slate-200 dark:border-slate-700",
        // Shadow
        "shadow-sm transition-all duration-200",
        "dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]",
        // Hover effect
        "hover:border-amber-400/30 hover:shadow-md",
        "dark:hover:border-amber-500/30 dark:hover:shadow-[0_4px_20px_rgba(255,149,0,0.1)]",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-5",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold text-sm", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-xs", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
}
