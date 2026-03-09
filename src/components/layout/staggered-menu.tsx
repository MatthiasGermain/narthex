'use client'

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export interface StaggeredMenuItem {
  label: string
  href: string
  exact?: boolean
}

interface StaggeredMenuProps {
  items: StaggeredMenuItem[]
  churchName: string
  logoUrl?: string | null
  // Customisation
  side?: 'left' | 'right'
  layerColors?: string[]
  accentColor?: string
  panelClassName?: string
  logoClassName?: string
  itemColorClass?: string
  itemActiveColorClass?: string
  closeBtnColorClass?: string
  onLogout?: () => void
}

export function StaggeredMenu({
  items,
  churchName,
  logoUrl,
  side = 'right',
  layerColors = ['#8B80F9', '#c9a0dc'],
  accentColor = '#FCCA46',
  panelClassName = 'bg-cream',
  logoClassName = '',
  itemColorClass = 'text-raisin hover:text-sunglow',
  itemActiveColorClass = 'text-sunglow',
  closeBtnColorClass = 'text-raisin/50 hover:text-raisin',
  onLogout,
}: StaggeredMenuProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const openRef = useRef(false)

  const panelRef = useRef<HTMLDivElement | null>(null)
  const preLayersRef = useRef<HTMLDivElement | null>(null)
  const preLayerElsRef = useRef<HTMLElement[]>([])

  const plusHRef = useRef<HTMLSpanElement | null>(null)
  const plusVRef = useRef<HTMLSpanElement | null>(null)
  const iconRef = useRef<HTMLSpanElement | null>(null)

  const textInnerRef = useRef<HTMLSpanElement | null>(null)
  const textWrapRef = useRef<HTMLSpanElement | null>(null)
  const [textLines, setTextLines] = useState<string[]>(['Menu', 'Fermer'])

  const openTlRef = useRef<gsap.core.Timeline | null>(null)
  const closeTweenRef = useRef<gsap.core.Tween | null>(null)
  const spinTweenRef = useRef<gsap.core.Timeline | null>(null)
  const textCycleAnimRef = useRef<gsap.core.Tween | null>(null)
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null)
  const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null)
  const busyRef = useRef(false)

  const offscreen = side === 'right' ? 100 : -100
  const positionClass = side === 'right' ? 'right-0' : 'left-0'

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current
      const preContainer = preLayersRef.current
      const plusH = plusHRef.current
      const plusV = plusVRef.current
      const icon = iconRef.current
      const textInner = textInnerRef.current

      if (!panel || !plusH || !plusV || !icon || !textInner) return

      const preLayers = preContainer
        ? (Array.from(preContainer.querySelectorAll('.sm-prelayer')) as HTMLElement[])
        : []
      preLayerElsRef.current = preLayers

      gsap.set([panel, ...preLayers], { xPercent: offscreen })
      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 })
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 })
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' })
      gsap.set(textInner, { yPercent: 0 })
    })
    return () => ctx.revert()
  }, [offscreen])

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current
    const layers = preLayerElsRef.current
    if (!panel) return null

    openTlRef.current?.kill()
    if (closeTweenRef.current) { closeTweenRef.current.kill(); closeTweenRef.current = null }
    itemEntranceTweenRef.current?.kill()

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[]
    const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')) as HTMLElement[]

    const layerStates = layers.map((el) => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }))
    const panelStart = Number(gsap.getProperty(panel, 'xPercent'))

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 })
    if (numberEls.length) gsap.set(numberEls, { ['--sm-num-opacity' as string]: 0 })

    const tl = gsap.timeline({ paused: true })

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07)
    })

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0)
    const panelDuration = 0.65

    tl.fromTo(panel, { xPercent: panelStart }, { xPercent: 0, duration: panelDuration, ease: 'power4.out' }, panelInsertTime)

    if (itemEls.length) {
      const itemsStart = panelInsertTime + panelDuration * 0.15
      tl.to(itemEls, { yPercent: 0, rotate: 0, duration: 1, ease: 'power4.out', stagger: { each: 0.1, from: 'start' } }, itemsStart)
      if (numberEls.length) {
        tl.to(numberEls, { duration: 0.6, ease: 'power2.out', ['--sm-num-opacity' as string]: 1, stagger: { each: 0.08, from: 'start' } }, itemsStart + 0.1)
      }
    }

    openTlRef.current = tl
    return tl
  }, [])

  const playOpen = useCallback(() => {
    if (busyRef.current) return
    busyRef.current = true
    const tl = buildOpenTimeline()
    if (tl) {
      tl.eventCallback('onComplete', () => { busyRef.current = false })
      tl.play(0)
    } else {
      busyRef.current = false
    }
  }, [buildOpenTimeline])

  const playClose = useCallback(() => {
    openTlRef.current?.kill()
    openTlRef.current = null
    itemEntranceTweenRef.current?.kill()
    const panel = panelRef.current
    const layers = preLayerElsRef.current
    if (!panel) return
    closeTweenRef.current?.kill()
    closeTweenRef.current = gsap.to([...layers, panel], {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const iEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[]
        if (iEls.length) gsap.set(iEls, { yPercent: 140, rotate: 10 })
        const nEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')) as HTMLElement[]
        if (nEls.length) gsap.set(nEls, { ['--sm-num-opacity' as string]: 0 })
        busyRef.current = false
      },
    })
  }, [offscreen])

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current
    const h = plusHRef.current
    const v = plusVRef.current
    if (!icon || !h || !v) return
    spinTweenRef.current?.kill()
    if (opening) {
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' })
      spinTweenRef.current = gsap.timeline({ defaults: { ease: 'power4.out' } })
        .to(h, { rotate: 45, duration: 0.5 }, 0)
        .to(v, { rotate: -45, duration: 0.5 }, 0)
    } else {
      spinTweenRef.current = gsap.timeline({ defaults: { ease: 'power3.inOut' } })
        .to(h, { rotate: 0, duration: 0.35 }, 0)
        .to(v, { rotate: 90, duration: 0.35 }, 0)
        .to(icon, { rotate: 0, duration: 0.001 }, 0)
    }
  }, [])

  const animateText = useCallback((opening: boolean) => {
    const inner = textInnerRef.current
    if (!inner) return
    textCycleAnimRef.current?.kill()
    const currentLabel = opening ? 'Menu' : 'Fermer'
    const targetLabel = opening ? 'Fermer' : 'Menu'
    const seq: string[] = [currentLabel]
    let last = currentLabel
    for (let i = 0; i < 3; i++) {
      last = last === 'Menu' ? 'Fermer' : 'Menu'
      seq.push(last)
    }
    if (last !== targetLabel) seq.push(targetLabel)
    seq.push(targetLabel)
    setTextLines(seq)
    gsap.set(inner, { yPercent: 0 })
    const finalShift = ((seq.length - 1) / seq.length) * 100
    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + seq.length * 0.07,
      ease: 'power4.out',
    })
  }, [])

  const toggleMenu = useCallback(() => {
    const target = !openRef.current
    openRef.current = target
    setOpen(target)
    if (target) {
      document.body.style.overflow = 'hidden'
      playOpen()
    } else {
      document.body.style.overflow = ''
      playClose()
    }
    animateIcon(target)
    animateText(target)
  }, [playOpen, playClose, animateIcon, animateText])

  const closeMenu = useCallback(() => {
    if (!openRef.current) return
    openRef.current = false
    setOpen(false)
    document.body.style.overflow = ''
    playClose()
    animateIcon(false)
    animateText(false)
  }, [playClose, animateIcon, animateText])

  React.useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        toggleBtnRef.current && !toggleBtnRef.current.contains(e.target as Node)
      ) closeMenu()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, closeMenu])

  return (
    <>
      {/* Inline toggle button — opens the menu */}
      <button
        ref={toggleBtnRef}
        className="relative inline-flex items-center gap-2 bg-transparent border-0 cursor-pointer font-sans text-sm font-medium text-raisin/70 hover:text-raisin transition-colors duration-200"
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={open}
        aria-controls="sm-panel"
        onClick={toggleMenu}
        type="button"
      >
        <span
          ref={textWrapRef}
          className="relative inline-block h-[1em] overflow-hidden whitespace-nowrap"
          aria-hidden="true"
        >
          <span ref={textInnerRef} className="flex flex-col leading-none">
            {textLines.map((l, i) => (
              <span className="block h-[1em] leading-none" key={i}>{l}</span>
            ))}
          </span>
        </span>

        <span
          ref={iconRef}
          className="relative w-3.5 h-3.5 shrink-0 inline-flex items-center justify-center"
          aria-hidden="true"
        >
          <span ref={plusHRef} className="absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2" />
          <span ref={plusVRef} className="absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2" />
        </span>
      </button>

      {/* Overlay + Backdrop — portalled to body to escape stacking contexts */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          {open && (
            <div className="fixed inset-0 z-55 bg-raisin/30 backdrop-blur-sm" onClick={closeMenu} />
          )}

          <div className="fixed inset-0 z-60 pointer-events-none">
            {/* Pre-layers */}
            <div
              ref={preLayersRef}
              className={`absolute top-0 ${positionClass} bottom-0 w-full sm:w-80 pointer-events-none`}
              aria-hidden="true"
            >
              {layerColors.map((color, i) => (
                <div key={i} className="sm-prelayer absolute top-0 left-0 h-full w-full" style={{ background: color }} />
              ))}
            </div>

            {/* Panel */}
            <aside
              id="sm-panel"
              ref={panelRef}
              className={`absolute top-0 ${positionClass} h-full w-full sm:w-80 ${panelClassName} flex flex-col pt-6 pb-8 px-8 overflow-y-auto pointer-events-auto`}
              style={{ '--sm-accent': accentColor } as React.CSSProperties}
              aria-hidden={!open}
            >
              {/* Close button — inside the panel, always above content */}
              <button
                className={`self-end mb-4 inline-flex items-center gap-2 bg-transparent border-0 cursor-pointer font-sans text-sm font-medium transition-colors duration-200 ${closeBtnColorClass}`}
                onClick={closeMenu}
                type="button"
                aria-label="Fermer le menu"
              >
                <span>Fermer</span>
                <span className="relative w-3.5 h-3.5 shrink-0 inline-flex items-center justify-center">
                  <span className="absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2 rotate-45" />
                  <span className="absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2 -rotate-45" />
                </span>
              </button>

              {/* Logo church */}
              <div className="mb-10 flex items-center gap-3">
                {logoUrl ? (
                  <Image src={logoUrl} alt={churchName} width={28} height={28} className={`h-7 w-7 rounded object-contain ${logoClassName}`} />
                ) : (
                  <Image src="/brand/pictogramme_noir_sans_fond.svg" alt="Narthex" width={28} height={28} className={`h-7 w-7 ${logoClassName}`} />
                )}
                <span className="font-heading font-bold text-sm">{churchName}</span>
              </div>

              <ul
                className="sm-panel-list list-none m-0 p-0 flex flex-col gap-2"
                role="list"
                data-numbering=""
              >
                {items.map((item, idx) => {
                  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                  return (
                    <li className="sm-panel-itemWrap relative overflow-hidden leading-none" key={item.href}>
                      <Link
                        className={`sm-panel-item relative font-heading font-black text-2xl cursor-pointer leading-none tracking-wide uppercase transition-colors duration-150 inline-flex items-baseline gap-2 no-underline ${
                          isActive ? itemActiveColorClass : itemColorClass
                        }`}
                        href={item.href}
                        onClick={closeMenu}
                        data-index={idx + 1}
                      >
                        <span className="sm-panel-itemLabel inline-block origin-bottom-left will-change-transform">
                          {item.label}
                        </span>
                        {isActive && <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-sunglow" />}
                      </Link>
                    </li>
                  )
                })}
              </ul>

              {onLogout && (
                <button
                  className={`mt-auto pt-8 inline-flex items-center gap-2 bg-transparent border-0 cursor-pointer font-sans text-sm font-medium transition-colors duration-200 ${closeBtnColorClass}`}
                  onClick={() => { closeMenu(); onLogout() }}
                  type="button"
                >
                  Déconnexion
                </button>
              )}
            </aside>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
