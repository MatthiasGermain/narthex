import Link from 'next/link'
import { MapPin, Mail, Phone } from 'lucide-react'

interface ContactInfoItemsProps {
  address?: {
    street?: string | null
    postalCode?: string | null
    city?: string | null
  } | null
  contact?: {
    email?: string | null
    phone?: string | null
  } | null
}

export function ContactInfoItems({ address, contact }: ContactInfoItemsProps) {
  const hasAddress = address?.street || address?.city
  const hasEmail = contact?.email
  const hasPhone = contact?.phone

  if (!hasAddress && !hasEmail && !hasPhone) return null

  return (
    <>
      {hasAddress && (
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-sunglow/15 shrink-0">
            <MapPin className="h-5 w-5 text-sunglow" />
          </div>
          <div className="text-sm">
            <p className="font-heading font-bold text-raisin">Adresse</p>
            <p className="text-raisin/60 mt-0.5">
              {address!.street && <>{address!.street}<br /></>}
              {address!.postalCode} {address!.city}
            </p>
          </div>
        </div>
      )}
      {hasEmail && (
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo/15 shrink-0">
            <Mail className="h-5 w-5 text-indigo" />
          </div>
          <div className="text-sm">
            <p className="font-heading font-bold text-raisin">Email</p>
            <Link
              href={`mailto:${contact!.email}`}
              className="text-raisin/60 hover:text-raisin transition-colors"
            >
              {contact!.email}
            </Link>
          </div>
        </div>
      )}
      {hasPhone && (
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-violet/15 shrink-0">
            <Phone className="h-5 w-5 text-violet" />
          </div>
          <div className="text-sm">
            <p className="font-heading font-bold text-raisin">Téléphone</p>
            <Link
              href={`tel:${contact!.phone!.replace(/\s/g, '')}`}
              className="text-raisin/60 hover:text-raisin transition-colors"
            >
              {contact!.phone}
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
