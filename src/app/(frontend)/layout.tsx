import React from 'react'
import './globals.css'

export const metadata = {
  description: 'Narthex — Plateforme pour les églises',
  title: 'Narthex',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="fr">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
