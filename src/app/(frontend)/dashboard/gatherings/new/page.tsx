import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { GatheringForm } from '@/components/features/gatherings/gathering-form'

export default async function NewGatheringPage() {
  const { user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) return null

  // Seuls les admins créent des rassemblements
  if (user.role !== 'super-admin' && user.role !== 'admin-church') {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/gatherings"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux rassemblements
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Nouveau rassemblement</h1>
        <p className="mt-1 text-muted-foreground">
          Créez-le d’abord, vous y rattacherez ensuite ses événements et ses cultes.
        </p>
      </div>

      <GatheringForm mode="create" churchId={tenant.id} />
    </div>
  )
}
