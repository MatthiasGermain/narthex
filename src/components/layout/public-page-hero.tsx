'use client'

import { AnimatedUnderline } from '@/components/landing/animated-underline'
import { ScrollReveal } from '@/components/landing/scroll-reveal'

interface PublicPageHeroProps {
  title: string
  /** Mot ou expression à souligner dans le titre (AnimatedUnderline sunglow) */
  highlight?: string
  subtitle?: string
  className?: string
  children?: React.ReactNode
}

export function PublicPageHero({ title, highlight, subtitle, className = '', children }: PublicPageHeroProps) {
  const renderTitle = () => {
    if (!highlight) {
      return title
    }
    const idx = title.toLowerCase().indexOf(highlight.toLowerCase())
    if (idx === -1) return title
    const before = title.slice(0, idx)
    const match = title.slice(idx, idx + highlight.length)
    const after = title.slice(idx + highlight.length)
    return (
      <>
        {before}
        <AnimatedUnderline>{match}</AnimatedUnderline>
        {after}
      </>
    )
  }

  return (
    <section className={`pt-28 sm:pt-32 pb-12 sm:pb-16 px-4 ${className}`}>
      <div className="max-w-5xl mx-auto text-center">
        <ScrollReveal>
          <h1 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-wide leading-snug text-raisin">
            {renderTitle()}
          </h1>
        </ScrollReveal>
        {subtitle && (
          <ScrollReveal delay={0.1}>
            <p className="mt-4 text-base sm:text-lg text-raisin/60 max-w-xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          </ScrollReveal>
        )}
        {children && (
          <ScrollReveal delay={0.2}>
            <div className="mt-8">
              {children}
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  )
}
