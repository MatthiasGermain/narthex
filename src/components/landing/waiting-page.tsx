'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2 } from 'lucide-react'
import { AnimatedUnderline } from './animated-underline'
import { ScrollReveal } from './scroll-reveal'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

export function WaitingPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur lors de l'envoi")
      }

      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : "Erreur lors de l'envoi")
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* ════════ HERO ════════ */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-12 pb-16 sm:pt-20 sm:pb-24 text-center overflow-hidden">
        {/* Decorative blob */}
        <div className="absolute top-10 -right-20 h-62.5 w-62.5 rounded-full bg-sunglow/8 blur-3xl" />


        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <h1
            className="font-heading font-black text-5xl sm:text-6xl md:text-7xl uppercase tracking-wide leading-tight"
            style={{
              animation: 'background-pan 6s linear infinite',
              background: 'linear-gradient(to right, #1e2952, #FCCA46, #c9a0dc, #1e2952)',
              backgroundSize: '200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Narthex
          </h1>
        </motion.div>

        <motion.div
          className="relative z-10 mt-6 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
        >
          <p className="text-lg sm:text-xl md:text-2xl text-raisin/70 leading-relaxed">
            Votre site web et votre gestion d&apos;église,
            <br />
            <span className="text-raisin font-medium">enfin au même endroit.</span>
          </p>

          <div className="mt-8">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl uppercase tracking-wide text-raisin">
              <AnimatedUnderline delay="500ms">Bientôt disponible</AnimatedUnderline>
            </h2>
          </div>

          <ul className="mt-8 flex flex-wrap justify-center gap-2.5 text-xs sm:text-sm text-raisin/50">
            <li className="rounded-full border border-raisin/10 bg-white/60 px-3 py-1.5 backdrop-blur-sm">Site personnalisé</li>
            <li className="rounded-full border border-raisin/10 bg-white/60 px-3 py-1.5 backdrop-blur-sm">Cultes</li>
            <li className="rounded-full border border-raisin/10 bg-white/60 px-3 py-1.5 backdrop-blur-sm">Événements</li>
            <li className="rounded-full border border-raisin/10 bg-white/60 px-3 py-1.5 backdrop-blur-sm">Communauté</li>
          </ul>

          <div className="mt-10">
            <a
              href="#contact"
              className="rounded-full border-2 border-raisin px-8 py-2.5 text-sm font-medium text-raisin transition-all duration-200 hover:bg-raisin hover:text-sunglow"
            >
              Nous contacter
            </a>
          </div>
        </motion.div>
      </section>

      {/* ════════ FORMULAIRE CONTACT ════════ */}
      <section id="contact" className="px-4 py-12 sm:py-18 bg-raisin relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-100 w-100 rounded-full bg-sunglow/5 blur-3xl" />

        <div className="mx-auto max-w-xl relative z-10">
          <ScrollReveal>
            <div className="text-center mb-10">
              <h3 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-wide text-sunglow mb-3">
                Contactez-nous
              </h3>
              <p className="text-sm sm:text-base text-cream/50 leading-relaxed">
                Narthex est en cours de développement. Écrivez-nous pour en savoir plus ou être informé du lancement.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            {status === 'sent' ? (
              <div className="text-center py-10">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
                <p className="mt-4 font-heading font-bold text-xl text-cream">
                  Message envoyé !
                </p>
                <p className="mt-2 text-sm text-cream/50">
                  Nous vous répondrons rapidement.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-6 text-sm text-cream/40 hover:text-cream transition-colors duration-200 underline"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  id="name"
                  type="text"
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border-l-3 border-sunglow bg-white/10 rounded-r-lg px-5 py-3.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:bg-white/15 transition-colors"
                  placeholder="Votre nom et prénom"
                />

                <input
                  id="email"
                  type="email"
                  required
                  maxLength={254}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border-l-3 border-sunglow bg-white/10 rounded-r-lg px-5 py-3.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:bg-white/15 transition-colors"
                  placeholder="Votre adresse email"
                />

                <textarea
                  id="message"
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full border-l-3 border-sunglow bg-white/10 rounded-r-lg px-5 py-3.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:bg-white/15 transition-colors resize-none"
                  placeholder="Votre message"
                />

                {status === 'error' && (
                  <p className="text-xs text-red-400">{errorMsg}</p>
                )}

                <div className="flex justify-center pt-2">
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-sunglow px-10 py-2.5 text-sm font-medium text-sunglow transition-all duration-200 hover:bg-sunglow hover:text-raisin disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      'Envoyer'
                    )}
                  </button>
                </div>
              </form>
            )}
          </ScrollReveal>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="border-t border-raisin/8 px-4 py-8">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
            <span className="font-heading font-bold text-sm uppercase tracking-wider text-raisin/30">
              &copy; {new Date().getFullYear()} Narthex
            </span>
            <span className="hidden sm:inline text-raisin/15">|</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo_noir_sans_fond.svg"
              alt="Spotlight"
              className="h-6 opacity-40 hover:opacity-60 transition-opacity duration-200"
            />
          </div>
          <a
            href="#contact"
            className="text-sm text-raisin/30 hover:text-raisin transition-colors duration-200"
          >
            Contact
          </a>
        </div>
      </footer>
    </div>
  )
}
