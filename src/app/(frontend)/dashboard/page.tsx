import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import Link from 'next/link'
import { CalendarPlus, Calendar, Church } from 'lucide-react'

import config from '@/payload.config'
import { Card, CardContent } from '@/components/ui/card'

export default async function DashboardPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenue, {user?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/events/new">
          <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CalendarPlus className="h-6 w-6" />
              </div>
              <div>
                <p className="font-heading font-bold">Ajouter un événement</p>
                <p className="text-sm text-muted-foreground">Créer un nouvel événement au calendrier</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/events">
          <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="font-heading font-bold">Voir le calendrier</p>
                <p className="text-sm text-muted-foreground">Consulter et gérer les événements</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {user?.role !== 'volunteer' && (
          <Link href="/dashboard/profile">
            <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Church className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-heading font-bold">Profil de l&apos;église</p>
                  <p className="text-sm text-muted-foreground">Modifier les infos publiques</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  )
}
