'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { checkUserTenantAccess } from '@/lib/tenant-check'
import { Button } from '@/components/ui/button'

export function LoginForm({ redirectTo, tenantId }: { redirectTo?: string; tenantId: number }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        setError('Email ou mot de passe incorrect.')
        return
      }

      const data = await res.json()
      const user = data.user
      if (!checkUserTenantAccess(user, tenantId)) {
        await fetch('/api/users/logout', { method: 'POST' })
        setError('Ce compte n\'appartient pas à cette église.')
        return
      }

      const safeRedirect = redirectTo?.startsWith('/') ? redirectTo : '/dashboard'
      router.push(safeRedirect)
      router.refresh()
    } catch (err) {
      console.error(err)
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-raisin mb-1.5">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          placeholder="votre@email.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full rounded-md border border-isabelline bg-cream px-4 py-2.5 text-sm text-raisin placeholder:text-raisin/50 outline-none focus:ring-2 focus:ring-indigo/50 transition-shadow"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-raisin mb-1.5">
          Mot de passe
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full rounded-md border border-isabelline bg-cream px-4 py-2.5 text-sm text-raisin placeholder:text-raisin/50 outline-none focus:ring-2 focus:ring-indigo/50 transition-shadow"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <Button type="submit" disabled={loading} variant="sunglow" size="lg" className="w-full">
        {loading ? 'Connexion…' : 'Se connecter'}
      </Button>
      <Link
        href="/login/forgot-password"
        className="text-sm text-raisin/50 hover:text-raisin transition-colors text-center"
      >
        Mot de passe oublié ?
      </Link>
    </form>
  )
}
