/**
 * En-tête de page style Notion
 */

'use client'

import { Plus, Search, Filter, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  showBackButton?: boolean
  backHref?: string
}

export default function PageHeader({
  title,
  description,
  actions,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  showBackButton = false,
  backHref,
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="px-8 py-6">
        <div className="mb-4">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Retour"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              {description && (
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Barre de recherche et actions */}
        <div className="flex items-center gap-3">
          {onSearchChange && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
          )}

          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

