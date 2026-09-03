'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Unlink } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface DetachButtonProps {
  itemId: number
  collection: 'events' | 'service-plans'
  /** Nom de l'élément, pour le message et le libellé accessible. */
  itemLabel: string
}

/**
 * Retire l'élément du rassemblement sans le supprimer : il redevient
 * simplement indépendant. Contrepartie du rattachement en masse.
 */
export function DetachButton({ itemId, collection, itemLabel }: DetachButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDetach() {
    setLoading(true)
    try {
      const res = await fetch(`/api/${collection}/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gathering: null }),
      })
      if (!res.ok) {
        toast.error('Le retrait a échoué')
        return
      }
      toast.success(`« ${itemLabel} » retiré du rassemblement`)
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
      disabled={loading}
      onClick={handleDetach}
      aria-label={`Retirer « ${itemLabel} » du rassemblement`}
      title="Retirer du rassemblement"
    >
      <Unlink className="h-3.5 w-3.5" />
    </Button>
  )
}
