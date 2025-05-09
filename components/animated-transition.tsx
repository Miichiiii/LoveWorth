"use client"

import { type ReactNode, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedTransitionProps {
  children: ReactNode
  show: boolean
  animation?: "fade" | "slide-up" | "slide-right" | "slide-left" | "scale"
  duration?: number
  className?: string
}

export default function AnimatedTransition({
  children,
  show,
  animation = "fade",
  duration = 300,
  className,
}: AnimatedTransitionProps) {
  const [shouldRender, setShouldRender] = useState(show)

  useEffect(() => {
    if (show) setShouldRender(true)
    let timeout: NodeJS.Timeout

    if (!show && shouldRender) {
      timeout = setTimeout(() => {
        setShouldRender(false)
      }, duration)
    }

    return () => clearTimeout(timeout)
  }, [show, duration, shouldRender])

  const getAnimationClasses = () => {
    switch (animation) {
      case "fade":
        return show ? "animate-fade-in opacity-100" : "opacity-0"
      case "slide-up":
        return show ? "animate-slide-in-bottom opacity-100" : "translate-y-4 opacity-0"
      case "slide-right":
        return show ? "animate-slide-in-right opacity-100" : "translate-x-4 opacity-0"
      case "slide-left":
        return show ? "animate-slide-in-left opacity-100" : "-translate-x-4 opacity-0"
      case "scale":
        return show ? "animate-scale-in opacity-100" : "scale-95 opacity-0"
      default:
        return show ? "opacity-100" : "opacity-0"
    }
  }

  if (!shouldRender) return null

  return (
    <div
      className={cn("transition-all", getAnimationClasses(), className)}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}
