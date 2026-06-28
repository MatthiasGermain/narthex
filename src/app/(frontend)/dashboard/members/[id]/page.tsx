import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Mail, Phone, Calendar, Clock, ShieldCheck, Pencil, Users } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { isAdminRole } from '@/access'
import { CHURCH_ROLE_LABELS } from '@/lib/church-roles'
import { formatRelativeTime } from '@/lib/relative-time'
import { getInitials } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function formatBirthDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const memberId = Number(id)
  if (Number.isNaN(memberId)) notFound()

  const { payload, user, tenant } = await resolveTenant()
  if (!user || !tenant) notFound()

  const member = await payload
    .findByID({
      collection: 'members',
      id: memberId,
      depth: 1,
      overrideAccess: false,
      user,
    })
    .catch(() => null)

  if (!member) notFound()

  // Vérifier l'isolation tenant
  const memberChurchId =
    typeof member.church === 'object' ? (member.church as { id: number })?.id : member.church
  if (String(memberChurchId) !== String(tenant.id)) notFound()

  const isAdmin = isAdminRole(user)

  const linkedUser = member.user && typeof member.user === 'object'
    ? member.user as { id: number; role?: string; lastLogin?: string }
    : null
  const isAdminMember = linkedUser?.role === 'admin-church' || linkedUser?.role === 'super-admin'

  // Photo
  const photo = member.photo && typeof member.photo === 'object'
    ? member.photo as { url?: string; sizes?: { card?: { url?: string }; thumbnail?: { url?: string } } }
    : null
  const photoUrl = photo?.sizes?.card?.url || photo?.url || null

  // Groupes du membre
  let memberGroups: Array<{ id: number; name: string }> = []
  try {
    const { docs } = await payload.find({
      collection: 'groups',
      where: {
        church: { equals: tenant.id },
        members: { contains: memberId },
      },
      depth: 0,
      limit: 50,
      overrideAccess: false,
      user,
    })
    memberGroups = docs.map((g) => ({ id: g.id, name: g.name }))
  } catch {
    // La collection groups n'existe peut-être pas encore
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <Link
          href="/dashboard/members"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux membres
        </Link>
      </div>

      {/* En-tête profil */}
      <div className="flex items-start gap-5">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={`${member.firstName} ${member.lastName}`}
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl shrink-0">
            {getInitials(member.firstName, member.lastName)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {member.firstName} {member.lastName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {member.churchRole && (
              <Badge variant="outline">
                {CHURCH_ROLE_LABELS[member.churchRole] || member.churchRole}
              </Badge>
            )}
            {isAdminMember && (
              <Badge variant="outline" className="bg-violet/15 text-violet border-violet/30">
                <ShieldCheck className="h-3 w-3 mr-0.5" />
                Admin
              </Badge>
            )}
          </div>

          {isAdmin && (
            <Link href={`/dashboard/members/${member.id}/edit`} className="mt-3 inline-block">
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Coordonnées */}
      <div className="rounded-lg border border-raisin/8 bg-raisin/5 p-5">
        <h2 className="font-heading font-bold text-lg mb-3">Coordonnées</h2>
        <div className="flex flex-col gap-2.5 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            {member.email ? (
              <span>{member.email}</span>
            ) : (
              <span className="text-muted-foreground">Non renseigné</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            {member.phone ? (
              <span>{member.phone}</span>
            ) : (
              <span className="text-muted-foreground">Non renseigné</span>
            )}
          </div>
          {member.birthDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{formatBirthDate(member.birthDate)}</span>
            </div>
          )}
          {linkedUser && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>Dernière connexion : {formatRelativeTime(linkedUser.lastLogin)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Groupes */}
      <div className="rounded-lg border border-raisin/8 bg-raisin/5 p-5">
        <h2 className="font-heading font-bold text-lg mb-3">Groupes & Ministères</h2>
        {memberGroups.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {memberGroups.map((group) => (
              <Link key={group.id} href={`/dashboard/groups/${group.id}`}>
                <Badge variant="outline" className="hover:bg-raisin/10 transition-colors cursor-pointer">
                  <Users className="h-3 w-3 mr-1" />
                  {group.name}
                </Badge>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun groupe</p>
        )}
      </div>
    </div>
  )
}
