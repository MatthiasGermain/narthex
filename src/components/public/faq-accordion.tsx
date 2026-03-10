'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
  id?: string
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="flex flex-col rounded-xl border border-raisin/8 divide-y divide-raisin/8 bg-cream overflow-hidden shadow-[0_2px_12px_rgba(30,41,82,0.04)]">
      {items.map((item, index) => {
        const isOpen = open === index
        return (
          <div key={item.id ?? index}>
            <button
              type="button"
              className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-cream/80 transition-colors"
              onClick={() => setOpen(isOpen ? null : index)}
            >
              <span className="font-heading font-bold text-sm text-raisin pr-4">
                {item.question}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-raisin/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5">
                <p className="text-raisin/70 text-sm leading-relaxed whitespace-pre-wrap">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
