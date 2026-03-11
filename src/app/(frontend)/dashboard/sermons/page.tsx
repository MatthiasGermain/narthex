import Link from 'next/link'
import Image from 'next/image'
import { Plus, BookOpen } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { formatDateShort } from '@/lib/format'
import { getThumbUrl } from '@/lib/image-utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SermonActions } from '@/components/features/sermons/sermon-actions'

function getPreacherName(preacher: unknown): string | null {
  if (!preacher || typeof preacher !== 'object') return null
  const p = preacher as { firstName?: string; lastName?: string }
  if (!p.firstName && !p.lastName) return null
  return [p.firstName, p.lastName].filter(Boolean).join(' ')
}

function canUserDelete(
  sermon: { createdBy?: number | { id: number } | null },
  userId: number,
  userRole: string,
): boolean {
  if (userRole === 'super-admin' || userRole === 'admin-church') return true
  const creatorId = typeof sermon.createdBy === 'object' ? sermon.createdBy?.id : sermon.createdBy
  return creatorId === userId
}

export default async function SermonsPage() {
  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) return null

  const { docs: sermons } = await payload.find({
    collection: 'sermons',
    where: {
      church: { equals: tenant.id },
    },
    sort: '-date',
    limit: 100,
    depth: 1,
    overrideAccess: false,
    user,
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Prédications</h1>
        <Link href="/dashboard/sermons/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Ajouter</span>
          </Button>
        </Link>
      </div>

      {sermons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <BookOpen className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Aucune prédication</p>
          <p className="text-sm mt-1">Ajoutez votre première prédication pour commencer.</p>
          <Link href="/dashboard/sermons/new" className="mt-4">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une prédication
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {sermons.map((sermon) => (
              <div
                key={sermon.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-raisin/8 bg-raisin/5 p-4"
              >
                {getThumbUrl(sermon.image) && (
                  <Image
                    src={getThumbUrl(sermon.image)!}
                    alt={sermon.title}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded object-cover shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{sermon.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDateShort(sermon.date)}
                  </p>
                  {getPreacherName(sermon.preacher) && (
                    <p className="text-sm text-muted-foreground">{getPreacherName(sermon.preacher)}</p>
                  )}
                  {sermon.series && (
                    <Badge variant="outline" className="mt-2 border-primary/40 text-primary">
                      {sermon.series}
                    </Badge>
                  )}
                </div>
                <SermonActions
                  sermonId={sermon.id}
                  sermonTitle={sermon.title}
                  canDelete={canUserDelete(sermon, user.id, user.role)}
                />
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block">
            <div className="rounded-lg border border-raisin/8 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-raisin/8">
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="w-[25%]">Titre</TableHead>
                    <TableHead className="w-[18%]">Date</TableHead>
                    <TableHead className="w-[18%]">Prédicateur</TableHead>
                    <TableHead className="w-[15%]">Série</TableHead>
                    <TableHead className="w-[12%]">Visibilité</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sermons.map((sermon) => (
                    <TableRow key={sermon.id} className="hover:bg-raisin/5">
                      <TableCell>
                        {getThumbUrl(sermon.image) ? (
                          <Image
                            src={getThumbUrl(sermon.image)!}
                            alt={sermon.title}
                            width={36}
                            height={36}
                            className="h-9 w-9 rounded object-cover"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded bg-muted" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{sermon.title}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateShort(sermon.date)}</TableCell>
                      <TableCell className="text-muted-foreground">{getPreacherName(sermon.preacher) || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{sermon.series || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={sermon.visibility === 'public' ? 'border-primary/40 text-primary' : 'border-muted-foreground/40 text-muted-foreground'}>
                          {sermon.visibility === 'public' ? 'Public' : 'Interne'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <SermonActions
                          sermonId={sermon.id}
                          sermonTitle={sermon.title}
                          canDelete={canUserDelete(sermon, user.id, user.role)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
