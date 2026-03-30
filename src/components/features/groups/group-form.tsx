'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface AvailableMember {
  id: number
  firstName: string
  lastName: string
}

interface GroupFormProps {
  mode: 'create' | 'edit'
  defaultValues?: {
    id?: number
    name: string
    description: string
    members: number[]
    leader: number | null
  }
  churchId: number
  availableMembers: AvailableMember[]
}

export function GroupForm({ mode, defaultValues, churchId, availableMembers }: GroupFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [selectedMembers, setSelectedMembers] = useState<number[]>(defaultValues?.members ?? [])
  const [leader, setLeader] = useState<number | null>(defaultValues?.leader ?? null)
  const [memberSearch, setMemberSearch] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filteredMembers = availableMembers.filter((m) =>
    !memberSearch || `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearch.toLowerCase()),
  )

  function toggleMember(id: number) {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Le nom est requis'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    try {
      const body = {
        name: name.trim(),
        description: description.trim() || undefined,
        members: selectedMembers,
        leader: leader || undefined,
        church: churchId,
      }

      const isEdit = mode === 'edit' && defaultValues?.id
      const url = isEdit ? `/api/groups/${defaultValues.id}` : '/api/groups'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        toast.error(data?.errors?.[0]?.message || 'Une erreur est survenue')
        return
      }

      toast.success(mode === 'create' ? 'Groupe créé' : 'Groupe modifié')
      router.push('/dashboard/groups')
      router.refresh()
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-2">
        <Label htmlFor="group-name">Nom du groupe *</Label>
        <Input
          id="group-name"
          placeholder="Ex: Louange, Jeunesse, Groupe de prière..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="group-description">Description</Label>
        <Textarea
          id="group-description"
          placeholder="Décrivez l'objectif de ce groupe..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Responsable</Label>
        <Select
          value={leader ? String(leader) : 'none'}
          onValueChange={(v) => setLeader(v === 'none' ? null : Number(v))}
        >
          <SelectTrigger className="max-w-sm">
            <SelectValue placeholder="Choisir un responsable" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucun</SelectItem>
            {availableMembers.map((m) => (
              <SelectItem key={m.id} value={String(m.id)}>
                {m.firstName} {m.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Membres ({selectedMembers.length} sélectionnés)</Label>
        <Input
          placeholder="Rechercher un membre..."
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="border rounded-lg max-h-64 overflow-y-auto p-2 flex flex-col gap-1">
          {filteredMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground p-2">Aucun membre trouvé</p>
          ) : (
            filteredMembers.map((m) => {
              const checked = selectedMembers.includes(m.id)
              return (
                <label
                  key={m.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleMember(m.id)}
                  />
                  <span className="text-sm flex-1">
                    {m.firstName} {m.lastName}
                  </span>
                  {checked && <Check className="h-3.5 w-3.5 text-primary" />}
                </label>
              )
            })
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? (mode === 'create' ? 'Création...' : 'Enregistrement...')
            : (mode === 'create' ? 'Créer le groupe' : 'Enregistrer')
          }
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/groups')}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
