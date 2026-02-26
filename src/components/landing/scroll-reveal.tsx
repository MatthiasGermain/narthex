'use client'

import { useRef } from 'react'
import { motion, useInView, type TargetAndTransition } from 'framer-motion'

type Variant = 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight'

const variants: Record<Variant, { hidden: TargetAndTransition; visible: TargetAndTransition }> = {
  fadeUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
}

interface ScrollRevealProps {
  children: React.ReactNode
  variant?: Variant
  delay?: number
  className?: string
}

export function ScrollReveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  className = '',
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const v = variants[variant]

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={v.hidden}
      animate={isInView ? v.visible : v.hidden}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  )
}
