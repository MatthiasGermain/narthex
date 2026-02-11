'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    try {
      await fetch('/api/users/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch {
      setLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} disabled={loading} className="shrink-0 gap-2">
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">{loading ? 'Déconnexion...' : 'Déconnexion'}</span>
    </Button>
  )
}
