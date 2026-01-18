"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-muted/50 text-muted-foreground border border-border/50"
        disabled
      >
        <Sun className="h-4 w-4" />
      </button>
    )
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-[0_0_15px_rgba(255,149,0,0.2)] active:scale-95"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-primary transition-colors" />
      ) : (
        <Moon className="h-4 w-4 transition-colors" />
      )}
    </button>
  )
}
