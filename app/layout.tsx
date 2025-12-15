import type { Metadata } from 'next'
import './globals.css'
import Header from './components/Header'

export const metadata: Metadata = {
  title: 'Devis Manager - Gestion des Devis',
  description: 'Application de gestion des devis pour entreprise de construction',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" translate="no" className="h-full">
      <body className="h-full min-h-screen flex flex-col bg-white antialiased">
        <Header />
        <main className="flex-1 w-full">
          {children}
        </main>
      </body>
    </html>
  )
}
