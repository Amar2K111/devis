'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/devis" className="flex items-center gap-2 no-underline">
            <div className="text-lg font-semibold text-gray-900">Devis Manager</div>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/devis" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Devis
            </Link>
            <Link href="/import" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Importer
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
