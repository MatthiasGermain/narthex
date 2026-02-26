'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '#features', label: 'Fonctionnalités' },
  { href: '#how-it-works', label: 'Comment ça marche' },
  { href: '#contact', label: 'Contact' },
]

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [contentWidth, setContentWidth] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
      if (contentRef.current) {
        setContentWidth(contentRef.current.scrollWidth)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)
    handleScroll()
    handleResize()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const compact = isScrolled && isDesktop

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center">
        <div
          className="relative w-full"
          style={{
            marginTop: compact ? '8px' : '0px',
            transition: 'margin-top 600ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Background layer — shrinks to content width when compact */}
          <div
            className={cn(
              'absolute left-1/2 -translate-x-1/2 h-full bg-cream',
              compact && 'lg:rounded-full lg:border lg:border-white/20 bg-cream/80',
            )}
            style={{
              width: isDesktop && compact && contentWidth ? `${contentWidth + 16}px` : '100%',
              backdropFilter: compact ? 'blur(20px) saturate(180%)' : undefined,
              WebkitBackdropFilter: compact ? 'blur(20px) saturate(180%)' : undefined,
              boxShadow: compact ? '0 10px 40px -10px rgba(30, 41, 82, 0.15)' : 'none',
              transition:
                'width 600ms cubic-bezier(0.4, 0, 0.2, 1), border-radius 400ms ease-out, box-shadow 600ms cubic-bezier(0.4, 0, 0.2, 1), background-color 300ms ease-out',
            }}
          >
            {/* Glass reflection */}
            <div
              className="absolute inset-0 pointer-events-none rounded-full overflow-hidden hidden lg:block"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                opacity: compact ? 1 : 0,
                transition: 'opacity 500ms ease-out',
              }}
            />
          </div>

          {/* Content layer */}
          <div
            ref={contentRef}
            className="relative flex items-center justify-between px-6 py-2 sm:px-8 mx-auto w-full"
            style={{
              maxWidth: compact ? '900px' : '1200px',
              gap: compact ? '24px' : '32px',
              transition:
                'max-width 600ms cubic-bezier(0.4, 0, 0.2, 1), gap 600ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Logo */}
            <Link href="/" className="relative shrink-0">
              <span
                className="font-heading font-black uppercase tracking-wider text-raisin"
                style={{
                  fontSize: compact ? '16px' : '20px',
                  transition: 'font-size 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Narthex
              </span>
            </Link>

            {/* Desktop nav */}
            <nav
              className="hidden lg:flex lg:items-center"
              style={{
                gap: compact ? '24px' : '28px',
                transition: 'gap 600ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="group relative font-medium uppercase whitespace-nowrap text-raisin/70 hover:text-raisin transition-colors duration-200"
                  style={{
                    fontSize: compact ? '12px' : '13px',
                    letterSpacing: compact ? '0.04em' : '0.05em',
                    transition:
                      'font-size 600ms cubic-bezier(0.4, 0, 0.2, 1), letter-spacing 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-sunglow transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </nav>

            {/* CTA */}
            <Link
              href="/login"
              className="hidden lg:block rounded-full border-2 border-sunglow px-5 py-1.5 font-medium text-sunglow transition-colors duration-200 hover:bg-sunglow hover:text-raisin whitespace-nowrap"
              style={{
                fontSize: compact ? '12px' : '13px',
                transition:
                  'font-size 600ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Se connecter
            </Link>

            {/* Mobile toggle */}
            <button
              className="lg:hidden p-2 text-raisin"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          className="fixed inset-0 z-40 bg-cream pt-20 px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <nav className="flex flex-col gap-6">
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-heading font-bold uppercase tracking-wide text-raisin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {link.label}
              </motion.a>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-4 inline-block rounded-full border-2 border-sunglow px-6 py-3 text-center text-lg font-medium text-sunglow transition-colors duration-200 hover:bg-sunglow hover:text-raisin"
            >
              Se connecter
            </Link>
          </nav>
        </motion.div>
      )}
    </>
  )
}
