import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

import { isAdminRole } from '@/access'
import { acquirePlanLock, getPlanLockOwner, releasePlanLock } from '@/lib/plan-lock'

type Context = { params: Promise<{ id: string }> }

/** Un admin connecté, sur un culte de son église. */
async function authorize({ params }: Context) {
  const { id } = await params
  const planId = Number(id)
  if (!Number.isInteger(planId)) {
    return { error: NextResponse.json({ error: 'ID invalide.' }, { status: 400 }) }
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user) {
    return { error: NextResponse.json({ error: 'Non authentifié.' }, { status: 401 }) }
  }
  if (!isAdminRole(user)) {
    return { error: NextResponse.json({ error: 'Accès refusé.' }, { status: 403 }) }
  }

  // Lecture avec les droits du user : introuvable si le culte est d'une autre église.
  const plan = await payload
    .findByID({ collection: 'service-plans', id: planId, depth: 0, overrideAccess: false, user })
    .catch(() => null)
  if (!plan) {
    return { error: NextResponse.json({ error: 'Culte introuvable.' }, { status: 404 }) }
  }

  return { payload, planId, userId: user.id, planUpdatedAt: plan.updatedAt }
}

/** Qui tient le verrou, sans le prendre. */
export async function GET(_req: NextRequest, context: Context) {
  const auth = await authorize(context)
  if ('error' in auth) return auth.error

  return NextResponse.json({
    lockedBy: await getPlanLockOwner(auth.payload, auth.planId, auth.userId),
  })
}

/** Prend ou prolonge le verrou. `expectUpdatedAt` : refuse si le culte a changé depuis. */
export async function POST(req: NextRequest, context: Context) {
  const auth = await authorize(context)
  if ('error' in auth) return auth.error

  const body = (await req.json().catch(() => null)) as { expectUpdatedAt?: unknown } | null
  if (typeof body?.expectUpdatedAt === 'string' && body.expectUpdatedAt !== auth.planUpdatedAt) {
    return NextResponse.json({ ok: false, changed: true })
  }

  return NextResponse.json(await acquirePlanLock(auth.payload, auth.planId, auth.userId))
}

/** Libère le verrou en quittant la page. */
export async function DELETE(_req: NextRequest, context: Context) {
  const auth = await authorize(context)
  if ('error' in auth) return auth.error

  await releasePlanLock(auth.payload, auth.planId, auth.userId)
  return new NextResponse(null, { status: 204 })
}
