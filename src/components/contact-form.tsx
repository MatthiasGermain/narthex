'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error || 'Une erreur est survenue.')
        return
      }

      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      console.error(err)
      setStatus('error')
      setErrorMsg('Impossible de contacter le serveur. Réessayez plus tard.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-raisin mb-1.5">
          Nom
        </label>
        <input
          id="contact-name"
          type="text"
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-isabelline bg-cream px-4 py-2.5 text-sm text-raisin placeholder:text-raisin/50 outline-none focus:ring-2 focus:ring-indigo/50 transition-shadow"
          placeholder="Votre nom"
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-raisin mb-1.5">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          required
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-isabelline bg-cream px-4 py-2.5 text-sm text-raisin placeholder:text-raisin/50 outline-none focus:ring-2 focus:ring-indigo/50 transition-shadow"
          placeholder="votre@email.com"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-raisin mb-1.5">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-md border border-isabelline bg-cream px-4 py-2.5 text-sm text-raisin placeholder:text-raisin/50 outline-none focus:ring-2 focus:ring-indigo/50 transition-shadow resize-y"
          placeholder="Votre message (10 caractères minimum)"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      {status === 'success' ? (
        <div className="rounded-lg bg-sunglow/15 border border-sunglow/30 px-4 py-3 text-sm text-raisin">
          Message envoyé avec succès ! Nous vous répondrons rapidement.
        </div>
      ) : (
        <Button
          type="submit"
          variant="sunglow"
          size="lg"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? (
            'Envoi en cours…'
          ) : (
            <>
              <Send className="h-4 w-4" />
              Envoyer
            </>
          )}
        </Button>
      )}
    </form>
  )
}
