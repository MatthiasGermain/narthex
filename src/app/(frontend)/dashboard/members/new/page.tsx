import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { MemberForm } from '@/components/features/members/member-form'

export default async function NewMemberPage() {
  const { user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) return null

  // Seuls les admins peuvent créer des membres
  if (user.role !== 'super-admin' && user.role !== 'admin-church') {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/members"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux membres
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Nouveau membre</h1>
      </div>

      <MemberForm mode="create" churchId={tenant.id} userRole={user.role} />
    </div>
  )
}
