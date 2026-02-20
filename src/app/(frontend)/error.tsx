'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">Oups !</h1>
      <p className="text-muted-foreground max-w-md">
        Une erreur inattendue est survenue. Veuillez réessayer.
      </p>
      <Button onClick={reset} variant="outline">
        Réessayer
      </Button>
    </div>
  )
}
