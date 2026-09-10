import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { checkUserTenantAccess } from '@/lib/tenant-check'
import { buildAnnouncementSheet, type AnnouncementItem } from '@/lib/announcements'
import { formatDateRange, formatDateShort, formatTime, servicePlanTitle } from '@/lib/format'
import { KeepAwake } from '@/components/features/announcements/keep-awake'

// Feuille interne à l'église : jamais indexée.
export const metadata = {
  title: 'Annonces',
  robots: { index: false, follow: false },
}

/** « Mardi 16 juin » — l'année n'apporte rien à l'oral. */
function spokenDay(iso: string): string {
  const label = new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function detailsOf(item: AnnouncementItem): { meta: string | null; text: string | null } {
  switch (item.kind) {
    case 'event': {
      const hours = `${formatTime(item.time)}${item.endTime ? ` – ${formatTime(item.endTime)}` : ''}`
      return {
        meta: [spokenDay(item.date), hours, item.place].filter(Boolean).join(' · '),
        text: item.description,
      }
    }
    case 'gathering':
      return {
        meta: [formatDateRange(item.startDate, item.endDate), item.location].filter(Boolean).join(' · '),
        text: item.description,
      }
    case 'extra':
      return { meta: null, text: item.details }
  }
}

/**
 * Mode lecture au pupitre : plein écran, gros caractères, sans la barre du
 * dashboard. Réservé aux membres de l'église ; n'affiche que ce qui sera lu.
 */
export default async function ReadAnnouncementsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const planId = Number(id)
  if (Number.isNaN(planId)) notFound()

  const { payload, user, tenant } = await resolveTenant()
  if (!tenant) notFound()
  if (!user) redirect(`/login?redirect=${encodeURIComponent(`/annonces/${planId}`)}`)
  if (!checkUserTenantAccess(user, tenant.id)) redirect('/login')

  const plan = await payload
    .findByID({ collection: 'service-plans', id: planId, depth: 0, overrideAccess: false, user })
    .catch(() => null)
  if (!plan) notFound()

  const planChurchId = typeof plan.church === 'object' ? plan.church?.id : plan.church
  if (String(planChurchId) !== String(tenant.id)) notFound()

  const sheet = await buildAnnouncementSheet(payload, user, plan, tenant.id)
  const items = sheet.items.filter((item) => item.kind === 'extra' || !item.hidden)

  return (
    <div className="min-h-screen bg-cream px-5 py-6 text-raisin sm:px-10 sm:py-10">
      <KeepAwake />

      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <Link
            href={`/dashboard/planning/${plan.id}/annonces`}
            className="inline-flex items-center gap-1 self-start text-sm text-raisin/60 transition-colors hover:text-raisin"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-raisin/60">
              {servicePlanTitle(plan.title)} du {formatDateShort(plan.date)}
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl">Annonces</h1>
          </div>
        </header>

        {items.length === 0 ? (
          <p className="text-xl text-raisin/70">Aucune annonce pour ce culte.</p>
        ) : (
          <ol className="flex flex-col gap-8">
            {items.map((item, index) => {
              const { meta, text } = detailsOf(item)
              return (
                <li key={`${item.kind}-${item.id}`} className="flex gap-4 border-t border-raisin/10 pt-6">
                  {/* Le rang aide à garder sa place en levant les yeux vers l'assemblée. */}
                  <span className="w-8 shrink-0 pt-1 text-lg font-semibold tabular-nums text-raisin/40">
                    {index + 1}
                  </span>
                  <div className="flex min-w-0 flex-col gap-2">
                    <h2 className="text-2xl font-bold leading-snug sm:text-3xl">{item.title}</h2>
                    {meta && <p className="text-xl text-raisin/80">{meta}</p>}
                    {text && <p className="whitespace-pre-line text-lg leading-relaxed text-raisin/70">{text}</p>}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}
