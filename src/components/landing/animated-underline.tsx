'use client'

import { useRef } from 'react'
import { useInView } from 'framer-motion'

interface AnimatedUnderlineProps {
  children: React.ReactNode
  color?: string
  delay?: string
  thickness?: string
  className?: string
}

export function AnimatedUnderline({
  children,
  color = 'var(--color-sunglow)',
  delay = '0ms',
  thickness = '0.35em',
  className = '',
}: AnimatedUnderlineProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <span
      ref={ref}
      style={{
        background: `linear-gradient(${color}, ${color}) no-repeat 0 90%`,
        backgroundSize: isInView ? `100% ${thickness}` : `0% ${thickness}`,
        transition: 'background-size 1s ease-out',
        transitionDelay: delay,
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
      } as React.CSSProperties}
      className={className}
    >
      {children}
    </span>
  )
}
