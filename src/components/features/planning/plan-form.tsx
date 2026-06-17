'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'

interface MemberOption {
  id: number
  firstName: string
  lastName: string
}

interface GroupOption {
  id: number
  name: string
  leaderName: string | null
}

interface AssignmentData {
  role: string
  memberIds: number[]
  groupId?: number | null
}

interface PlanData {
  id?: number
  date?: string
  assignments?: AssignmentData[]
  notes?: string
}

interface PlanFormProps {
  mode: 'create' | 'edit'
  defaultValues?: PlanData
  churchId: number
  members: MemberOption[]
  groups?: GroupOption[]
  serviceRoles: string[]
}

/** Le rôle « Louange » accepte la sélection d'un groupe entier. */
function isWorshipRole(role: string): boolean {
  return role.trim().toLowerCase() === 'louange'
}

export function PlanForm({
  mode,
  defaultValues,
  churchId,
  members,
  groups = [],
  serviceRoles,
}: PlanFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [date, setDate] = useState(defaultValues?.date ?? '')
  const [notes, setNotes] = useState(defaultValues?.notes ?? '')

  // Initialiser les assignments : soit depuis defaultValues, soit depuis les serviceRoles
  const initialAssignments: AssignmentData[] = defaultValues?.assignments?.length
    ? defaultValues.assignments
    : serviceRoles.map((role) => ({ role, memberIds: [] }))

  const [assignments, setAssignments] = useState<AssignmentData[]>(initialAssignments)

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!date) newErrors.date = 'La date est requise'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function updateAssignmentMembers(index: number, memberIds: number[]) {
    setAssignments((prev) =>
      prev.map((a, i) => (i === index ? { ...a, memberIds } : a)),
    )
  }

  function updateAssignmentRole(index: number, role: string) {
    setAssignments((prev) =>
      prev.map((a, i) => (i === index ? { ...a, role } : a)),
    )
  }

  function setAssignmentGroup(index: number, groupId: number | null) {
    setAssignments((prev) => prev.map((a, i) => (i === index ? { ...a, groupId } : a)))
  }

  function addAssignment() {
    setAssignments((prev) => [...prev, { role: '', memberIds: [], groupId: null }])
  }

  function removeAssignment(index: number) {
    setAssignments((prev) => prev.filter((_, i) => i !== index))
  }

  function toggleMember(assignmentIndex: number, memberId: number) {
    const current = assignments[assignmentIndex].memberIds
    const next = current.includes(memberId)
      ? current.filter((id) => id !== memberId)
      : [...current, memberId]
    updateAssignmentMembers(assignmentIndex, next)
  }

  function getMemberName(id: number): string {
    const m = members.find((m) => m.id === id)
    return m ? `${m.firstName} ${m.lastName}` : `#${id}`
  }

  function getGroup(id: number | null | undefined): GroupOption | undefined {
    if (id == null) return undefined
    return groups.find((g) => g.id === id)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    try {
      const url =
        mode === 'edit' && defaultValues?.id
          ? `/api/service-plans/${defaultValues.id}`
          : '/api/service-plans'

      const body = {
        date,
        assignments: assignments
          .filter((a) => a.role.trim())
          .map((a) => ({
            role: a.role.trim(),
            members: a.memberIds.length > 0 ? a.memberIds : null,
            // Le groupe n'est pertinent que pour le rôle Louange
            group: isWorshipRole(a.role) && a.groupId != null ? a.groupId : null,
          })),
        notes: notes.trim() || undefined,
        church: churchId,
      }

      const res = await fetch(url, {
        method: mode === 'edit' ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message = data?.errors?.[0]?.message || 'Une erreur est survenue'
        toast.error(message)
        return
      }

      toast.success(
        mode === 'create' ? 'Culte créé' : 'Culte modifié',
      )
      router.push('/dashboard/planning')
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      {/* Date */}
      <div className="flex flex-col gap-2 max-w-xs">
        <Label htmlFor="date">Date du culte *</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-invalid={!!errors.date}
        />
        {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
      </div>

      {/* Assignments */}
      <div className="flex flex-col gap-3">
        <Label>Affectations</Label>
        <div className="flex flex-col gap-3">
          {assignments.map((assignment, index) => (
            <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
              {/* Rôle */}
              <div className="flex flex-col gap-1 w-44 shrink-0">
                <Input
                  value={assignment.role}
                  onChange={(e) => updateAssignmentRole(index, e.target.value)}
                  placeholder="Rôle"
                  className="text-sm"
                />
              </div>

              {/* Membres sélectionnés + sélecteur */}
              <div className="flex-1 flex flex-wrap items-center gap-2 min-h-9">
                {assignment.memberIds.map((id) => (
                  <Badge key={id} variant="secondary" className="gap-1">
                    {getMemberName(id)}
                    <button
                      type="button"
                      onClick={() => toggleMember(index, id)}
                      className="ml-0.5 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}

                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Membre
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 max-h-60 overflow-y-auto p-2" align="start">
                    {members.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-2">Aucun membre</p>
                    ) : (
                      members.map((m) => (
                        <label
                          key={m.id}
                          className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted cursor-pointer"
                        >
                          <Checkbox
                            checked={assignment.memberIds.includes(m.id)}
                            onCheckedChange={() => toggleMember(index, m.id)}
                          />
                          <span className="text-sm">
                            {m.firstName} {m.lastName}
                          </span>
                        </label>
                      ))
                    )}
                  </PopoverContent>
                </Popover>

                {/* Groupe assigné (rôle Louange uniquement) */}
                {isWorshipRole(assignment.role) && (
                  <>
                    {assignment.groupId != null &&
                      (() => {
                        const g = getGroup(assignment.groupId)
                        return g ? (
                          <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                            {g.name}
                            {g.leaderName ? ` — ${g.leaderName}` : ''}
                            <button
                              type="button"
                              onClick={() => setAssignmentGroup(index, null)}
                              className="ml-0.5 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null
                      })()}

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className="h-7 text-xs">
                          <Plus className="h-3 w-3 mr-1" />
                          Groupe
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 max-h-60 overflow-y-auto p-2" align="start">
                        {groups.length === 0 ? (
                          <p className="text-sm text-muted-foreground p-2">Aucun groupe</p>
                        ) : (
                          groups.map((g) => (
                            <label
                              key={g.id}
                              className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted cursor-pointer"
                            >
                              <Checkbox
                                checked={assignment.groupId === g.id}
                                onCheckedChange={() =>
                                  setAssignmentGroup(index, assignment.groupId === g.id ? null : g.id)
                                }
                              />
                              <span className="text-sm">
                                {g.name}
                                {g.leaderName && (
                                  <span className="text-muted-foreground"> — {g.leaderName}</span>
                                )}
                              </span>
                            </label>
                          ))
                        )}
                      </PopoverContent>
                    </Popover>
                  </>
                )}
              </div>

              {/* Supprimer le rôle */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeAssignment(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={addAssignment}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un rôle
        </Button>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Informations complémentaires pour ce dimanche..."
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? mode === 'create'
              ? 'Création...'
              : 'Enregistrement...'
            : mode === 'create'
              ? 'Créer le culte'
              : 'Enregistrer'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/planning')}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
