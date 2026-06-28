'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Users, Mail, Phone, UserCheck, ShieldCheck, Search, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CHURCH_ROLE_OPTIONS } from '@/lib/church-roles'
import { getInitials } from '@/lib/format'
import { MemberActions } from '@/components/features/members/member-actions'

export interface SerializedMember {
  id: number
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  churchRole: string | null
  churchRoleLabel: string | null
  photoUrl: string | null
  hasAccount: boolean
  isAdminMember: boolean
  lastLoginLabel: string | null
}

interface MembersListProps {
  members: SerializedMember[]
  isAdmin: boolean
}

export function MembersList({ members, isAdmin }: MembersListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const filtered = members.filter((m) => {
    const matchesSearch =
      !searchQuery ||
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesRole = roleFilter === 'all' || m.churchRole === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <>
      {/* Barre de filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            {CHURCH_ROLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Résultats */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <Users className="h-12 w-12 mb-4 opacity-50" />
          {members.length === 0 ? (
            <>
              <p className="text-lg font-medium">Aucun membre</p>
              <p className="text-sm mt-1">Ajoutez votre premier membre pour commencer l&apos;annuaire.</p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">Aucun résultat</p>
              <p className="text-sm mt-1">Aucun membre ne correspond à votre recherche.</p>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <MemberGroup
            title={`${filtered.length} membre${filtered.length > 1 ? 's' : ''}`}
            members={filtered}
            isAdmin={isAdmin}
          />
        </div>
      )}
    </>
  )
}

function MemberGroup({
  title,
  members,
  isAdmin,
}: {
  title: string
  members: SerializedMember[]
  isAdmin: boolean
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} isAdmin={isAdmin} />
        ))}
      </div>
    </div>
  )
}

function MemberCard({
  member,
  isAdmin,
}: {
  member: SerializedMember
  isAdmin: boolean
}) {
  return (
    <Link href={`/dashboard/members/${member.id}`} className="block h-full">
      <div className="h-full rounded-lg border border-raisin/8 bg-raisin/5 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-4">
          <div className="flex items-start gap-3">
            {member.photoUrl ? (
              <Image
                src={member.photoUrl}
                alt={`${member.firstName} ${member.lastName}`}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                {getInitials(member.firstName, member.lastName)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-heading font-bold truncate">
                  {member.firstName} {member.lastName}
                </p>
                {member.hasAccount && (
                  <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" aria-label="Compte lié" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {member.churchRoleLabel && (
                  <Badge variant="outline" className="text-xs">
                    {member.churchRoleLabel}
                  </Badge>
                )}
                {member.hasAccount && member.isAdminMember && (
                  <Badge variant="outline" className="text-xs bg-violet/15 text-violet border-violet/30">
                    <ShieldCheck className="h-3 w-3 mr-0.5" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>

            {isAdmin && (
              <div onClick={(e) => e.preventDefault()}>
                <MemberActions
                  memberId={member.id}
                  memberName={`${member.firstName} ${member.lastName}`}
                  canDelete={isAdmin}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 mt-3 text-sm text-muted-foreground">
            {member.email && (
              <span className="flex items-center gap-1.5 truncate">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {member.email}
              </span>
            )}
            {member.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {member.phone}
              </span>
            )}
            {member.hasAccount && member.lastLoginLabel && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {member.lastLoginLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
