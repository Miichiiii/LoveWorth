"use client"

import { useEffect, useState, useRef } from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface AnimatedProgressProps {
  value: number
  className?: string
  duration?: number
  color?: "default" | "success" | "warning" | "danger"
}

export default function AnimatedProgress({
  value,
  className,
  duration = 800,
  color = "default",
}: AnimatedProgressProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const startValueRef = useRef(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    startValueRef.current = displayValue
    startTimeRef.current = null

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
    }

    const animateValue = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Easing function: easeOutQuart
      const easedProgress = 1 - Math.pow(1 - progress, 4)

      const currentValue = startValueRef.current + (value - startValueRef.current) * easedProgress
      setDisplayValue(currentValue)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animateValue)
      }
    }

    frameRef.current = requestAnimationFrame(animateValue)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [value, duration])

  const getColorClass = () => {
    switch (color) {
      case "success":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "danger":
        return "bg-red-500"
      default:
        return ""
    }
  }

  return <Progress value={displayValue} className={cn(className)} indicatorClassName={getColorClass()} />
}
