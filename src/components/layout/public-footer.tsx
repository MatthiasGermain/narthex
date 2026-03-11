import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Youtube } from 'lucide-react'

interface PublicFooterProps {
  churchName: string
  logoUrl?: string | null
  social?: {
    facebook?: string | null
    instagram?: string | null
    youtube?: string | null
  } | null
}

const footerNav = [
  { href: '/events', label: 'Événements' },
  { href: '/sermons', label: 'Prédications' },
  { href: '/visit', label: 'Première visite' },
  { href: '/about', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
]

export function PublicFooter({ churchName, logoUrl, social }: PublicFooterProps) {
  const hasSocial = social?.facebook || social?.instagram || social?.youtube

  return (
    <footer className="bg-raisin text-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center gap-8">
          {/* Logo + nom */}
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={churchName}
                width={32}
                height={32}
                className="h-8 w-8 rounded object-contain invert"
              />
            ) : (
              <Image
                src="/brand/pictogramme_noir_sans_fond.svg"
                alt="Narthex"
                width={28}
                height={28}
                className="h-7 w-7 invert"
              />
            )}
            <span className="font-heading font-bold text-lg">{churchName}</span>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {footerNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-cream/60 hover:text-sunglow transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Réseaux sociaux */}
          {hasSocial && (
            <div className="flex gap-5">
              {social!.facebook && (
                <Link
                  href={social!.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/50 hover:text-sunglow transition-colors duration-200"
                >
                  <Facebook className="h-5 w-5" />
                </Link>
              )}
              {social!.instagram && (
                <Link
                  href={social!.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/50 hover:text-sunglow transition-colors duration-200"
                >
                  <Instagram className="h-5 w-5" />
                </Link>
              )}
              {social!.youtube && (
                <Link
                  href={social!.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/50 hover:text-sunglow transition-colors duration-200"
                >
                  <Youtube className="h-5 w-5" />
                </Link>
              )}
            </div>
          )}

          {/* Copyright + Narthex */}
          <div className="flex flex-col items-center gap-1 text-xs text-cream/40">
            <p>&copy; {new Date().getFullYear()} {churchName}</p>
            <p>
              Propulsé par{' '}
              <Link
                href="https://narthex.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cream/60 transition-colors"
              >
                Narthex
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
