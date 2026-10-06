'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { sendSuggestion } from '@/app/(frontend)/dashboard/actions'
import {
  SUGGESTION_KINDS,
  SUGGESTION_MAX_LENGTH,
  SUGGESTION_MIN_LENGTH,
} from '@/lib/suggestions'

export function SuggestionDialog() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [kind, setKind] = useState<string>('amelioration')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function reset() {
    setKind('amelioration')
    setMessage('')
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (message.trim().length < SUGGESTION_MIN_LENGTH) {
      setError(`Le message doit contenir au moins ${SUGGESTION_MIN_LENGTH} caractères`)
      return
    }

    setLoading(true)
    try {
      const result = await sendSuggestion({ kind, page: pathname, message })
      if (!result.success) {
        setError(result.error || 'Une erreur est survenue')
        return
      }
      toast.success('Merci ! Votre suggestion a bien été envoyée.')
      reset()
      setOpen(false)
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="shrink-0 gap-2">
        <Lightbulb className="h-4 w-4" />
        <span className="hidden sm:inline">Suggérer</span>
      </Button>

      <AlertDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suggérer un changement</AlertDialogTitle>
            <AlertDialogDescription>
              Un souci, une idée, quelque chose à améliorer ? Votre message est envoyé
              directement à l&apos;équipe Narthex, qui vous répondra par email.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Vous nous signalez</Label>
              <Select value={kind} onValueChange={setKind}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUGGESTION_KINDS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="suggestion-message">Message *</Label>
              <Textarea
                id="suggestion-message"
                rows={6}
                maxLength={SUGGESTION_MAX_LENGTH}
                placeholder="Décrivez ce que vous aimeriez voir changer, et où…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-32 resize-y"
                required
              />
              <p className="text-xs text-muted-foreground">
                La page où vous êtes ({pathname}) est jointe automatiquement.
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading} type="button">Annuler</AlertDialogCancel>
              <Button type="submit" disabled={loading}>
                {loading ? 'Envoi...' : 'Envoyer'}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
