import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get('domain')
  if (!domain) return NextResponse.json({ slug: null })

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'churches',
    where: { 'domains.domain': { equals: domain } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    select: { slug: true },
  })

  return NextResponse.json({ slug: result.docs[0]?.slug || null })
}
