'use client'

import Link from 'next/link'
import { Calendar, Users, Sun, Church, ArrowRight, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { LandingHeader } from './landing-header'
import { AnimatedUnderline } from './animated-underline'
import { ScrollReveal } from './scroll-reveal'

const FEATURES = [
  {
    icon: Sun,
    title: 'Planification des cultes',
    description:
      'Organisez chaque dimanche : assignez la présidence, la louange, la sono et tous les rôles à vos membres.',
    color: 'bg-sunglow/10 text-sunglow',
  },
  {
    icon: Calendar,
    title: 'Événements',
    description:
      'Créez et partagez vos événements publics ou internes. Vos visiteurs voient les prochains rendez-vous.',
    color: 'bg-indigo/10 text-indigo',
  },
  {
    icon: Users,
    title: 'Gestion des membres',
    description:
      'Annuaire de votre communauté avec rôles, contacts et comptes utilisateurs liés.',
    color: 'bg-violet/10 text-violet',
  },
  {
    icon: Church,
    title: 'Site public personnalisé',
    description:
      'Chaque église a son propre sous-domaine avec ses couleurs, son logo et ses informations.',
    color: 'bg-cyan/10 text-cyan',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Créez votre église',
    description: 'Un nom, un slug, et votre espace est prêt en quelques secondes.',
  },
  {
    number: '02',
    title: 'Configurez',
    description: 'Ajoutez votre logo, vos couleurs, vos rôles de culte et vos salles.',
  },
  {
    number: '03',
    title: 'Invitez votre équipe',
    description: 'Vos bénévoles reçoivent un accès et voient leurs affectations.',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      <LandingHeader />

      {/* ════════ HERO ════════ */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-32 pb-20 sm:pt-44 sm:pb-32 text-center overflow-hidden">
        {/* Gradients décoratifs */}
        <div className="absolute top-20 right-[-100px] h-[300px] w-[300px] rounded-full bg-sunglow/10 blur-3xl" />
        <div className="absolute bottom-0 left-[-80px] h-[250px] w-[250px] rounded-full bg-violet/10 blur-3xl" />

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h1 className="font-heading font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl uppercase tracking-wide leading-tight text-raisin">
            L&apos;outil pour
            <br />
            votre <AnimatedUnderline delay="400ms">église</AnimatedUnderline>
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-raisin/60 max-w-2xl mx-auto leading-relaxed">
            Narthex remplace WordPress pour les églises francophones.
            <br className="hidden sm:block" />
            Cultes, événements, membres — tout au même endroit.
          </p>
        </motion.div>

        <motion.div
          className="relative z-10 mt-10 flex flex-wrap gap-4 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Link
            href="#contact"
            className="rounded-full border-2 border-sunglow bg-sunglow px-8 py-3 text-base font-medium text-raisin transition-all duration-200 hover:bg-transparent hover:text-sunglow"
          >
            Créer mon église
          </Link>
          <Link
            href="#features"
            className="rounded-full border-2 border-raisin/20 px-8 py-3 text-base font-medium text-raisin transition-colors duration-200 hover:border-raisin/50"
          >
            Découvrir
          </Link>
        </motion.div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section id="features" className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-wide leading-snug text-raisin">
                Tout ce qu&apos;il faut,{' '}
                <AnimatedUnderline>rien de plus</AnimatedUnderline>
              </h2>
              <p className="mt-4 text-raisin/50 max-w-lg mx-auto leading-relaxed">
                Des fonctionnalités pensées pour le quotidien des églises protestantes.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-2">
            {FEATURES.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 0.1}>
                <div className="group rounded-2xl border border-raisin/8 bg-white p-7 transition-all duration-300 hover:shadow-lg hover:shadow-raisin/5 hover:-translate-y-1">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
                  >
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-heading font-bold text-lg text-raisin">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-raisin/50 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section id="how-it-works" className="px-4 py-20 sm:py-28 bg-raisin">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-wide leading-snug text-cream">
                Prêt en{' '}
                <AnimatedUnderline>3 étapes</AnimatedUnderline>
              </h2>
              <p className="mt-4 text-cream/40 leading-relaxed">
                Pas besoin de développeur. Pas besoin de WordPress.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-10 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <ScrollReveal key={step.number} delay={i * 0.15}>
                <div className="text-center sm:text-left">
                  <span className="font-heading text-6xl font-black text-sunglow/20">
                    {step.number}
                  </span>
                  <h3 className="mt-3 font-heading font-bold text-xl text-cream">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-cream/40 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="px-4 py-20 sm:py-28">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-wide leading-snug text-raisin">
              Prêt à simplifier la gestion de votre{' '}
              <AnimatedUnderline>église</AnimatedUnderline> ?
            </h2>
            <p className="mt-4 text-raisin/50 leading-relaxed">
              Créez votre espace gratuitement et invitez votre équipe.
            </p>
            <div className="mt-10">
              <Link
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border-2 border-sunglow bg-sunglow px-8 py-3.5 text-base font-medium text-raisin transition-all duration-200 hover:bg-transparent hover:text-sunglow"
              >
                Commencer maintenant
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ════════ CONTACT ════════ */}
      <section id="contact" className="px-4 py-20 sm:py-28 bg-violet/20">
        <ScrollReveal>
          <div className="mx-auto max-w-lg text-center">
            <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-wide text-raisin">
              Contact
            </h2>
            <p className="mt-4 text-raisin/50 text-sm leading-relaxed">
              Narthex est en développement actif. Pour créer votre église ou poser vos questions, écrivez-nous.
            </p>
            <a
              href="mailto:contact@narthex.dev"
              className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-raisin px-6 py-3 text-sm font-medium text-raisin transition-colors duration-200 hover:bg-raisin hover:text-sunglow"
            >
              contact@narthex.dev
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </ScrollReveal>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="border-t border-raisin/10 px-4 py-8">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-heading font-bold text-sm uppercase tracking-wider text-raisin/30">
            &copy; {new Date().getFullYear()} Narthex
          </span>
          <div className="flex gap-6 text-sm text-raisin/30">
            <a href="#features" className="hover:text-raisin transition-colors duration-200">
              Fonctionnalités
            </a>
            <a href="#how-it-works" className="hover:text-raisin transition-colors duration-200">
              Comment ça marche
            </a>
            <a href="#contact" className="hover:text-raisin transition-colors duration-200">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
