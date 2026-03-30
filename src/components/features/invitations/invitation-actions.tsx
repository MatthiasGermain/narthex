'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MoreHorizontal, RefreshCw, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface InvitationActionsProps {
  invitationId: number
  email: string
}

export function InvitationActions({ invitationId, email }: InvitationActionsProps) {
  const router = useRouter()
  const [showCancel, setShowCancel] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleResend() {
    setLoading(true)
    try {
      const res = await fetch(`/api/invitations/${invitationId}/resend`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        toast.error(data?.error || 'Erreur lors du renvoi')
        return
      }
      toast.success(`Invitation renvoyée à ${email}`)
      router.refresh()
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel() {
    setLoading(true)
    try {
      const res = await fetch(`/api/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'expired' }),
      })
      if (!res.ok) {
        toast.error("Erreur lors de l'annulation")
        return
      }
      toast.success('Invitation annulée')
      router.refresh()
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
      setShowCancel(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleResend} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Renvoyer
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowCancel(true)}
            className="text-destructive focus:text-destructive"
            disabled={loading}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Annuler
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler l&apos;invitation ?</AlertDialogTitle>
            <AlertDialogDescription>
              L&apos;invitation envoyée à {email} sera annulée. Le lien ne sera plus utilisable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Retour</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Annulation...' : 'Annuler l\'invitation'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
