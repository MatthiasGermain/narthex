'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        setError('Une erreur est survenue. Veuillez réessayer.')
        return
      }

      setSent(true)
    } catch (err) {
      console.error(err)
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="rounded-lg bg-sunglow/15 border border-sunglow/30 px-4 py-3 text-sm text-raisin">
          Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.
        </div>
        <Link href="/login" className="text-sm text-raisin/50 hover:text-raisin transition-colors">
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="forgot-email" className="block text-sm font-medium text-raisin mb-1.5">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          placeholder="votre@email.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full rounded-md border border-isabelline bg-cream px-4 py-2.5 text-sm text-raisin placeholder:text-raisin/50 outline-none focus:ring-2 focus:ring-indigo/50 transition-shadow"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <Button type="submit" disabled={loading} variant="sunglow" size="lg" className="w-full">
        {loading ? 'Envoi…' : 'Envoyer le lien'}
      </Button>
    </form>
  )
}
