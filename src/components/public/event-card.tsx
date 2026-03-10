import Link from 'next/link'
import Image from 'next/image'
import { Calendar } from 'lucide-react'

import { formatDate, formatTime } from '@/lib/format'

interface EventCardProps {
  event: {
    id: string | number
    title: string
    date: string
    time: string
    location?: string | null
    image?: unknown
  }
  /** Tailwind aspect ratio class, e.g. "aspect-4/3" or "aspect-video" */
  aspect?: string
}

export function getEventThumb(image: unknown): string | null {
  if (typeof image === 'object' && image !== null) {
    const img = image as Record<string, unknown>
    const sizes = img.sizes as Record<string, { url?: string }> | undefined
    if (sizes?.card?.url) return sizes.card.url
    if (typeof img.url === 'string') return img.url
  }
  return null
}

export function getEventAlt(image: unknown, fallback: string): string {
  if (typeof image === 'object' && image !== null) {
    const img = image as Record<string, unknown>
    if (typeof img.alt === 'string' && img.alt) return img.alt
  }
  return fallback
}

export function EventCard({ event, aspect = 'aspect-4/3' }: EventCardProps) {
  const thumb = getEventThumb(event.image)
  const alt = getEventAlt(event.image, event.title)

  return (
    <Link href={`/events/${event.id}`} className="group block h-full">
      <div className="rounded-xl overflow-hidden bg-cream/80 border border-raisin/8 h-full transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
        {thumb ? (
          <Image
            src={thumb}
            alt={alt}
            width={768}
            height={432}
            className={`w-full ${aspect} object-cover`}
          />
        ) : (
          <div className={`w-full ${aspect} bg-linear-to-br from-raisin/10 to-violet/20 flex items-center justify-center`}>
            <Calendar className="h-10 w-10 text-raisin/20" />
          </div>
        )}
        <div className="p-5">
          <p className="font-heading font-bold text-raisin">{event.title}</p>
          <p className="text-sm text-raisin/60 mt-1">
            {formatDate(event.date)} à {formatTime(event.time)}
          </p>
          {event.location && (
            <p className="text-sm text-raisin/50 mt-0.5">{event.location}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
