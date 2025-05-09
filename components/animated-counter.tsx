"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
  decimals?: number
}

export default function AnimatedCounter({
  value,
  duration = 1000,
  className,
  prefix = "",
  suffix = "",
  decimals = 0,
}: AnimatedCounterProps) {
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

      // Easing function: easeOutExpo
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)

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

  const formattedValue = displayValue.toFixed(decimals)

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  )
}
