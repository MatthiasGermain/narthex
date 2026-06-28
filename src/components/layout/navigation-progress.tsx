'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // Clé d'URL complète : change aussi quand seuls les query params changent
  // (ex: navigation entre mois du calendrier via ?month=...).
  const urlKey = `${pathname}?${searchParams.toString()}`
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null)

  const start = useCallback(() => {
    setVisible(true)
    setProgress(0)
    // Simulate progress: jump to ~30%, then slowly crawl
    requestAnimationFrame(() => setProgress(30))
  }, [])

  const done = useCallback(() => {
    setProgress(100)
    const id = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 200)
    setTimeoutId(id)
  }, [])

  // Complete progress when the URL (path OR query) changes (navigation finished)
  useEffect(() => {
    if (visible) {
      done()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlKey])

  // Slowly increment progress while waiting
  useEffect(() => {
    if (!visible || progress >= 90 || progress === 0) return
    const id = setTimeout(() => {
      setProgress((p) => p + (90 - p) * 0.1)
    }, 300)
    return () => clearTimeout(id)
  }, [visible, progress])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [timeoutId])

  // Intercept clicks on internal links to start the progress bar
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href || !href.startsWith('/')) return

      // Skip if modifier keys (new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      // Skip if same URL (path + query) — aucune navigation ne se produira
      const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname
      if (href === currentUrl || href === pathname) return

      start()
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [pathname, searchParams, start])

  if (!visible) return null

  return (
    <div className="navigation-progress" style={{ transform: `scaleX(${progress / 100})` }} />
  )
}
