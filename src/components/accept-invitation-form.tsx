'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface AcceptInvitationFormProps {
  token: string
  email: string
  defaultFirstName: string
  defaultLastName: string
}

export function AcceptInvitationForm({
  token,
  email,
  defaultFirstName,
  defaultLastName,
}: AcceptInvitationFormProps) {
  const router = useRouter()
  const [firstName, setFirstName] = useState(defaultFirstName)
  const [lastName, setLastName] = useState(defaultLastName)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!firstName.trim() || !lastName.trim()) {
      setError('Le prénom et le nom sont requis.')
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.')
        return
      }

      // Auto-login après acceptation
      await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      router.push(data.redirectTo || '/dashboard')
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
        <label className="block text-sm font-medium text-raisin mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full rounded-md border border-isabelline bg-raisin/5 px-4 py-2.5 text-sm text-raisin/60 cursor-not-allowed"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="accept-firstName" className="block text-sm font-medium text-raisin mb-1.5">
            Prénom *
          </label>
          <input
            id="accept-firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full rounded-md border border-isabelline bg-cream px-4 py-2.5 text-sm text-raisin placeholder:text-raisin/50 outline-none focus:ring-2 focus:ring-indigo/50 transition-shadow"
          />
        </div>
        <div>
          <label htmlFor="accept-lastName" className="block text-sm font-medium text-raisin mb-1.5">
            Nom *
          </label>
          <input
            id="accept-lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full rounded-md border border-isabelline bg-cream px-4 py-2.5 text-sm text-raisin placeholder:text-raisin/50 outline-none focus:ring-2 focus:ring-indigo/50 transition-shadow"
          />
        </div>
      </div>

      <div>
        <label htmlFor="accept-password" className="block text-sm font-medium text-raisin mb-1.5">
          Mot de passe *
        </label>
        <input
          id="accept-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={8}
          placeholder="8 caractères minimum"
          className="w-full rounded-md border border-isabelline bg-cream px-4 py-2.5 text-sm text-raisin placeholder:text-raisin/50 outline-none focus:ring-2 focus:ring-indigo/50 transition-shadow"
        />
      </div>

      <div>
        <label htmlFor="accept-confirmPassword" className="block text-sm font-medium text-raisin mb-1.5">
          Confirmer le mot de passe *
        </label>
        <input
          id="accept-confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
        {loading ? 'Création du compte…' : 'Créer mon compte'}
      </Button>
    </form>
  )
}
