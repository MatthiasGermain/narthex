import React from 'react'
import { Montserrat } from 'next/font/google'
import localFont from 'next/font/local'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const avenir = localFont({
  src: [
    { path: '../../../public/brand/fonts/AvenirLTStd-Light.otf', weight: '300', style: 'normal' },
    { path: '../../../public/brand/fonts/AvenirLTStd-LightOblique.otf', weight: '300', style: 'italic' },
    { path: '../../../public/brand/fonts/AvenirLTStd-Book.otf', weight: '400', style: 'normal' },
    { path: '../../../public/brand/fonts/AvenirLTStd-BookOblique.otf', weight: '400', style: 'italic' },
    { path: '../../../public/brand/fonts/AvenirLTStd-Roman.otf', weight: '450', style: 'normal' },
    { path: '../../../public/brand/fonts/AvenirLTStd-Medium.otf', weight: '500', style: 'normal' },
    { path: '../../../public/brand/fonts/AvenirLTStd-MediumOblique.otf', weight: '500', style: 'italic' },
    { path: '../../../public/brand/fonts/AvenirLTStd-Heavy.otf', weight: '700', style: 'normal' },
    { path: '../../../public/brand/fonts/AvenirLTStd-HeavyOblique.otf', weight: '700', style: 'italic' },
    { path: '../../../public/brand/fonts/AvenirLTStd-Black.otf', weight: '900', style: 'normal' },
    { path: '../../../public/brand/fonts/AvenirLTStd-BlackOblique.otf', weight: '900', style: 'italic' },
  ],
  variable: '--font-avenir',
  display: 'swap',
})

export const metadata = {
  description: 'Narthex — Plateforme pour les églises',
  title: 'Narthex',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="fr">
      <body className={`${montserrat.variable} ${avenir.variable} antialiased`}>
        <main>{children}</main>
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
