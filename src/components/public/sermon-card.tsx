import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Mic, Music } from 'lucide-react'

import { formatDate } from '@/lib/format'

interface SermonCardProps {
  sermon: {
    id: string | number
    title: string
    date: string
    preacher?: { firstName?: string; lastName?: string } | number | null
    series?: string | null
    scripture?: string | null
    image?: unknown
    audioFile?: unknown
    videoUrl?: string | null
  }
}

function getPreacherName(preacher: SermonCardProps['sermon']['preacher']): string | null {
  if (!preacher || typeof preacher !== 'object') return null
  return [preacher.firstName, preacher.lastName].filter(Boolean).join(' ') || null
}

function getThumb(image: unknown): string | null {
  if (typeof image === 'object' && image !== null) {
    const img = image as Record<string, unknown>
    const sizes = img.sizes as Record<string, { url?: string }> | undefined
    if (sizes?.card?.url) return sizes.card.url
    if (typeof img.url === 'string') return img.url
  }
  return null
}

export function SermonCard({ sermon }: SermonCardProps) {
  const thumb = getThumb(sermon.image)
  const preacherName = getPreacherName(sermon.preacher)
  const hasMedia = sermon.audioFile || sermon.videoUrl

  return (
    <Link href={`/sermons/${sermon.id}`} className="group block h-full">
      <div className="rounded-xl overflow-hidden bg-cream/80 border border-raisin/8 h-full transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
        {thumb ? (
          <Image
            src={thumb}
            alt={sermon.title}
            width={768}
            height={432}
            className="w-full aspect-video object-cover"
          />
        ) : (
          <div className="w-full aspect-video bg-linear-to-br from-raisin/10 to-violet/20 flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-raisin/20" />
          </div>
        )}
        <div className="p-5">
          <p className="font-heading font-bold text-raisin">{sermon.title}</p>
          <p className="text-sm text-raisin/60 mt-1">{formatDate(sermon.date)}</p>
          {preacherName && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Mic className="h-3.5 w-3.5 text-raisin/40" />
              <p className="text-sm text-raisin/50">{preacherName}</p>
            </div>
          )}
          <div className="flex items-center gap-3 mt-3">
            {sermon.series && (
              <span className="text-xs font-medium bg-violet/10 text-raisin/70 px-2.5 py-1 rounded-full">
                {sermon.series}
              </span>
            )}
            {sermon.scripture && (
              <span className="text-xs text-raisin/40">{sermon.scripture}</span>
            )}
          </div>
          {hasMedia && (
            <div className="flex items-center gap-1.5 mt-2">
              <Music className="h-3.5 w-3.5 text-sunglow" />
              <span className="text-xs text-raisin/40">
                {sermon.audioFile && sermon.videoUrl ? 'Audio + Vidéo' : sermon.audioFile ? 'Audio' : 'Vidéo'}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
