'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, token }),
      })

      if (!res.ok) {
        setError('Le lien est invalide ou a expiré.')
        return
      }

      router.push('/login')
    } catch (err) {
      console.error(err)
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-red-600">Lien de réinitialisation invalide.</p>
        <Link href="/login" className="text-sm text-raisin/50 hover:text-raisin transition-colors">
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="reset-password" className="block text-sm font-medium text-raisin mb-1.5">
          Nouveau mot de passe
        </label>
        <input
          id="reset-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={8}
          className="w-full rounded-md border border-isabelline bg-cream px-4 py-2.5 text-sm text-raisin placeholder:text-raisin/50 outline-none focus:ring-2 focus:ring-indigo/50 transition-shadow"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <Button type="submit" disabled={loading} variant="sunglow" size="lg" className="w-full">
        {loading ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
      </Button>
    </form>
  )
}
