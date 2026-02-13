'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkUserTenantAccess } from '@/lib/tenant-check'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

      // Vérifier que l'user appartient à ce tenant
      const data = await res.json()
      const user = data.user
      if (!checkUserTenantAccess(user, tenantId)) {
        await fetch('/api/users/logout', { method: 'POST' })
        setError('Ce compte n\'appartient pas à cette église.')
        return
      }

      router.push(redirectTo || '/dashboard')
      router.refresh()
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="votre@email.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Connexion...' : 'Se connecter'}
      </Button>
      <a
        href="/login/forgot-password"
        className="text-sm text-muted-foreground hover:underline text-center"
      >
        Mot de passe oublié ?
      </a>
    </form>
  )
}
