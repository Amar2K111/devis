import type { Metadata } from 'next'
import './globals.css'
import Sidebar from './components/Sidebar'

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
      <body className="h-full min-h-screen bg-gray-50 antialiased">
        <div className="flex h-full">
          <Sidebar />
          <main 
            id="main-content"
            className="flex-1 transition-[margin-left] duration-300"
            suppressHydrationWarning
          >
          {children}
        </main>
        </div>
      </body>
    </html>
  )
}
