import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { pageHref, type SearchParams } from '@/lib/pagination'

interface PaginationProps {
  basePath: string
  searchParams: SearchParams
  page: number
  totalPages: number
  /** Nom du paramètre d'URL — à distinguer si deux listes coexistent sur la page. */
  param?: string
  /** Ce qui est paginé, pour l'aide vocale : « page 2 sur 5 des événements passés ». */
  label?: string
  className?: string
}

/** Fenêtre de numéros autour de la page courante, bornes toujours visibles. */
function pageWindow(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)

  const pages = new Set([1, totalPages, page, page - 1, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)

  const out: (number | 'gap')[] = []
  let previous = 0
  for (const p of sorted) {
    if (previous && p - previous > 1) out.push('gap')
    out.push(p)
    previous = p
  }
  return out
}

const linkClass =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-raisin/10 px-3 text-sm transition-colors hover:bg-raisin/5'

export function Pagination({
  basePath,
  searchParams,
  page,
  totalPages,
  param = 'page',
  label,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const href = (p: number) => pageHref(basePath, searchParams, param, p)
  const suffix = label ? ` ${label}` : ''

  return (
    <nav
      aria-label={label ? `Pagination${suffix}` : 'Pagination'}
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className={linkClass} aria-label={`Page précédente${suffix}`}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(linkClass, 'opacity-40')} aria-hidden="true">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pageWindow(page, totalPages).map((entry, i) =>
        entry === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-muted-foreground" aria-hidden="true">
            …
          </span>
        ) : entry === page ? (
          <span
            key={entry}
            aria-current="page"
            className={cn(linkClass, 'border-transparent bg-raisin text-cream font-medium')}
          >
            {entry}
          </span>
        ) : (
          <Link key={entry} href={href(entry)} className={linkClass} aria-label={`Page ${entry}${suffix}`}>
            {entry}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link href={href(page + 1)} className={linkClass} aria-label={`Page suivante${suffix}`}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(linkClass, 'opacity-40')} aria-hidden="true">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  )
}
