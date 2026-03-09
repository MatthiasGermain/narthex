import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

let resend: Resend
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

// Rate limit simple en mémoire
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const LIMIT = 3
const WINDOW_MS = 15 * 60 * 1000 // 15 min

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > LIMIT
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Trop de messages envoyés. Réessayez dans 15 minutes.' },
      { status: 429 },
    )
  }

  let body: { name?: string; email?: string; message?: string }
  try {
    body = await req.json()
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  const { name, email, message } = body

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 })
  }

  if (typeof name !== 'string' || name.length > 100) {
    return NextResponse.json({ error: 'Nom invalide.' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (typeof email !== 'string' || !emailRegex.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })
  }

  if (typeof message !== 'string' || message.length < 10 || message.length > 2000) {
    return NextResponse.json(
      { error: 'Le message doit contenir entre 10 et 2000 caractères.' },
      { status: 400 },
    )
  }

  try {
    await getResend().emails.send({
      from: 'Narthex <noreply@narthex.dev>',
      to: 'contact@narthex.dev',
      replyTo: email,
      subject: `[Narthex] Message de ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #1e2952;">Nouveau message depuis narthex.dev</h2>
          <p><strong>Nom :</strong> ${escapeHtml(name)}</p>
          <p><strong>Email :</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
          <hr style="border: none; border-top: 1px solid #d8d2cc; margin: 16px 0;" />
          <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Erreur lors de l'envoi. Réessayez plus tard." },
      { status: 500 },
    )
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
