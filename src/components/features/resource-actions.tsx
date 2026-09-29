'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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

interface ResourceActionsProps {
  resourceId: number
  resourceName: string
  /** Slug de la collection Payload (ex: "events", "rooms", "members") */
  collection: string
  /** Chemin du dashboard (ex: "/dashboard/events") */
  basePath: string
  /** Labels pour les messages */
  labels: {
    deleteTitle: string
    deleteDescription: string
    deleteError: string
    deleteSuccess: string
  }
  canDelete: boolean
}

export function ResourceActions({
  resourceId,
  resourceName,
  collection,
  basePath,
  labels,
  canDelete,
}: ResourceActionsProps) {
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/${collection}/${resourceId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        toast.error(data?.errors?.[0]?.message || labels.deleteError)
        return
      }
      toast.success(labels.deleteSuccess)
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Une erreur est survenue')
    } finally {
      setDeleting(false)
      setShowDelete(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`${basePath}/${resourceId}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Modifier
          </DropdownMenuItem>
          {canDelete && (
            <DropdownMenuItem
              onClick={() => setShowDelete(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{labels.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {labels.deleteDescription.replace('{name}', resourceName)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
