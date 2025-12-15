/**
 * Page de liste des devis - Design épuré avec filtres simples
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Devis {
  id: string
  client: string
  typeTravaux: string
  dateDevis: string
  montant: number
  statut: string
  materiaux: string | null
  notes: string | null
}

interface FilterOptions {
  clients: string[]
  typeTravaux: string[]
  statuts: string[]
}

interface PaginationInfo {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

type SortField = 'dateDevis' | 'montant' | 'client' | 'typeTravaux' | 'statut'
type SortOrder = 'asc' | 'desc'

export default function DevisPage() {
  const [devis, setDevis] = useState<Devis[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [filters, setFilters] = useState({
    client: '',
    typeTravaux: '',
    statut: '',
  })
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    clients: [],
    typeTravaux: [],
    statuts: [],
  })
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<SortField>('dateDevis')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pageSize: 50,
    totalPages: 1,
  })
  const router = useRouter()

  // Charger les options de filtres
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await fetch('/api/devis/options')
        const data = await response.json()
        if (response.ok && data.success) {
          setFilterOptions(data.data)
        }
      } catch (error) {
        console.error('Erreur:', error)
      }
    }
    loadOptions()
  }, [])

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const loadDevis = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchDebounced) params.append('search', searchDebounced)
      if (filters.client && !searchDebounced) params.append('client', filters.client)
      if (filters.typeTravaux && !searchDebounced) params.append('typeTravaux', filters.typeTravaux)
      if (filters.statut) params.append('statut', filters.statut)
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)
      params.append('page', page.toString())
      params.append('pageSize', pagination.pageSize.toString())

      const response = await fetch(`/api/devis?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setDevis(data.data || [])
        setPagination({
          total: data.total || 0,
          page: data.page || 1,
          pageSize: data.pageSize || 50,
          totalPages: data.totalPages || 1,
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }, [searchDebounced, filters, sortBy, sortOrder, page, pagination.pageSize])

  useEffect(() => {
    loadDevis()
  }, [loadDevis])

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce devis ?')) return

    try {
      const response = await fetch(`/api/devis?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        loadDevis()
      }
    } catch (error) {
      alert('Erreur lors de la suppression')
    }
  }

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setPage(1)
  }

  const resetFilters = () => {
    setSearch('')
    setFilters({ client: '', typeTravaux: '', statut: '' })
    setPage(1)
  }

  const hasActiveFilters = searchDebounced || filters.client || filters.typeTravaux || filters.statut

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant)
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'validé': 'bg-green-100 text-green-800',
      'annulé': 'bg-red-100 text-red-800',
      'en attente': 'bg-yellow-100 text-yellow-800',
    }
    return colors[statut.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Devis</h1>
        <button
          onClick={() => router.push('/import')}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          + Importer
        </button>
      </div>

      {/* Recherche et Filtres */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {showFilters ? 'Masquer' : 'Filtres'}
          </button>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Client</label>
              <select
                value={filters.client}
                onChange={(e) => setFilters({ ...filters, client: e.target.value })}
                disabled={!!searchDebounced}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100 disabled:opacity-60"
              >
                <option value="">Tous</option>
                {filterOptions.clients.map((client) => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Type de travaux</label>
              <select
                value={filters.typeTravaux}
                onChange={(e) => setFilters({ ...filters, typeTravaux: e.target.value })}
                disabled={!!searchDebounced}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100 disabled:opacity-60"
              >
                <option value="">Tous</option>
                {filterOptions.typeTravaux.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Statut</label>
              <select
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Tous</option>
                {filterOptions.statuts.map((statut) => (
                  <option key={statut} value={statut}>{statut}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="text-sm text-gray-600">
            {pagination.total} résultat{pagination.total > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-gray-500">Chargement...</div>
        </div>
      ) : devis.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">Aucun devis trouvé</p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-4 text-sm text-gray-600 underline hover:text-gray-900"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th 
                    onClick={() => handleSort('client')} 
                    className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Client {sortBy === 'client' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('typeTravaux')} 
                    className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Type {sortBy === 'typeTravaux' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('dateDevis')} 
                    className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Date {sortBy === 'dateDevis' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('montant')} 
                    className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Montant {sortBy === 'montant' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('statut')} 
                    className="cursor-pointer px-4 py-3 text-left text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Statut {sortBy === 'statut' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {devis.map((devi) => (
                  <tr key={devi.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{devi.client}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{devi.typeTravaux}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(devi.dateDevis)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatMontant(devi.montant)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatutColor(devi.statut)}`}>
                        {devi.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(devi.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          )}

          <div className="mt-4 text-center text-xs text-gray-500">
            {pagination.total} devis au total
          </div>
        </>
      )}
    </div>
  )
}
