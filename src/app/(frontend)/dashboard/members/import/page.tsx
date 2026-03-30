import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { CHURCH_ROLE_OPTIONS } from '@/lib/church-roles'
import { CsvImport } from '@/components/features/members/csv-import'

export default async function ImportMembersPage() {
  const { user, tenant } = await resolveTenant()
  if (!user || !tenant) return null

  if (user.role !== 'super-admin' && user.role !== 'admin-church') notFound()

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
        <h1 className="text-2xl sm:text-3xl font-bold">Importer des membres</h1>
      </div>

      <CsvImport
        churchRoles={CHURCH_ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
      />
    </div>
  )
}
