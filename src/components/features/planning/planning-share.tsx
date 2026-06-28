'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Share2, Copy, Trash2, Link2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  generatePlanningShareToken,
  revokePlanningShareToken,
} from '@/app/(frontend)/dashboard/planning/actions'

export function PlanningShare({ token }: { token: string | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentToken, setCurrentToken] = useState<string | null>(token)

  const url =
    currentToken && typeof window !== 'undefined'
      ? `${window.location.origin}/planning-partage/${currentToken}`
      : ''

  async function handleGenerate() {
    setLoading(true)
    const res = await generatePlanningShareToken()
    setLoading(false)
    if ('error' in res) {
      toast.error(res.error)
      return
    }
    setCurrentToken(res.token)
    toast.success('Lien de partage généré')
    router.refresh()
  }

  async function handleRevoke() {
    setLoading(true)
    const res = await revokePlanningShareToken()
    setLoading(false)
    if ('error' in res) {
      toast.error(res.error)
      return
    }
    setCurrentToken(null)
    toast.success('Lien révoqué')
    router.refresh()
  }

  async function handleCopy() {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Lien copié')
    } catch {
      toast.error('Impossible de copier')
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Partager</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-medium">Lien de partage du planning</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Lecture seule. Toute personne avec ce lien voit les cultes à venir et leurs
              affectations.
            </p>
          </div>

          {currentToken ? (
            <>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={url}
                  className="text-xs"
                  onFocusCapture={(e) => e.currentTarget.select()}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="shrink-0"
                  onClick={handleCopy}
                  aria-label="Copier le lien"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={handleRevoke}
                  disabled={loading}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Révoquer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  Régénérer
                </Button>
              </div>
            </>
          ) : (
            <Button type="button" size="sm" onClick={handleGenerate} disabled={loading}>
              <Link2 className="mr-2 h-4 w-4" />
              {loading ? 'Génération...' : 'Générer un lien'}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
