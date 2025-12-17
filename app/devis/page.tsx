/**
 * Page de liste des devis - Style Airtable
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Download, MoreVertical, Eye, Edit, FileText, Trash2, ChevronUp, ChevronDown, Filter, X, Calendar, DollarSign } from 'lucide-react'
import PageHeader from '@/app/components/PageHeader'
import StatutBadge from '@/app/components/StatutBadge'

interface LigneDevis {
  id: string
  description: string
  quantite: number
  unite: string
  prixUnitaire: number
  tauxTVA: number
  montantHT: number
  montantTVA: number
  montantTTC: number
  ordre: number
}

interface Devis {
  id: string
  numeroDevis: string
  client: string
  clientAdresse: string | null
  clientTelephone: string | null
  clientEmail: string | null
  clientSiret: string | null
  typeTravaux: string
  dateDevis: string
  dateValidite: string | null
  dateDebutTravaux: string | null
  montantHT: number
  tauxTVA: number
  montantTVA: number
  montantTTC: number
  statut: string
  materiaux: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  lignes: LigneDevis[]
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

type SortField = 'dateDevis' | 'montantTTC' | 'montantHT' | 'client' | 'typeTravaux' | 'statut' | 'numeroDevis'
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
  const [showFilters, setShowFilters] = useState(true)
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' })
  const [montantFilter, setMontantFilter] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState<SortField>('dateDevis')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [page, setPage] = useState(1)
  const [exportingExcel, setExportingExcel] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
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
      if (dateFilter.start) params.append('dateDebut', dateFilter.start)
      if (dateFilter.end) params.append('dateFin', dateFilter.end)
      if (montantFilter.min) params.append('montantMin', montantFilter.min)
      if (montantFilter.max) params.append('montantMax', montantFilter.max)
      const sortByMapped = (sortBy as string) === 'montant' ? 'montantTTC' : sortBy
      params.append('sortBy', sortByMapped)
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
  }, [searchDebounced, filters, dateFilter, montantFilter, sortBy, sortOrder, page, pagination.pageSize])

  useEffect(() => {
    loadDevis()
  }, [loadDevis])

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce devis ?')) return

    try {
      const response = await fetch(`/api/devis?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        loadDevis()
        setOpenMenu(null)
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
    setDateFilter({ start: '', end: '' })
    setMontantFilter({ min: '', max: '' })
    setPage(1)
  }

  const hasActiveFilters = searchDebounced || filters.client || filters.typeTravaux || filters.statut || dateFilter.start || dateFilter.end || montantFilter.min || montantFilter.max

  const handleExportExcel = async () => {
    setExportingExcel(true)
    try {
      const params = new URLSearchParams()
      if (searchDebounced) params.append('search', searchDebounced)
      if (filters.client && !searchDebounced) params.append('client', filters.client)
      if (filters.typeTravaux && !searchDebounced) params.append('typeTravaux', filters.typeTravaux)
      if (filters.statut) params.append('statut', filters.statut)

      const response = await fetch(`/api/devis/export/excel?${params.toString()}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `devis-export-${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de l\'export Excel')
      }
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
    } finally {
      setExportingExcel(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Devis"
        description={
          hasActiveFilters 
            ? `${pagination.total} devis trouvé${pagination.total > 1 ? 's' : ''} avec les filtres appliqués`
            : `${pagination.total} devis au total`
        }
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par numéro, client, type de travaux, notes..."
        actions={
          <>
            <button
              onClick={handleExportExcel}
              disabled={exportingExcel || devis.length === 0}
              className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              {exportingExcel ? 'Export...' : 'Excel'}
            </button>
            <button
              onClick={() => router.push('/devis/nouveau')}
              className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              Nouveau devis
            </button>
          </>
        }
      />

      {/* Barre de filtres améliorée */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-8 py-4">
          {/* Filtres rapides (statuts courants) */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Filtres rapides:</span>
            {['brouillon', 'envoyé', 'accepté', 'en cours', 'terminé'].map((statut) => (
              <button
                key={statut}
                onClick={() => {
                  setFilters({ ...filters, statut: filters.statut === statut ? '' : statut })
                  setPage(1)
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filters.statut === statut
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {statut.charAt(0).toUpperCase() + statut.slice(1)}
              </button>
            ))}
            {filters.statut && (
              <button
                onClick={() => {
                  setFilters({ ...filters, statut: '' })
                  setPage(1)
                }}
                className="rounded-full px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* En-tête des filtres */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-medium text-gray-900">Filtres de recherche</h2>
              {hasActiveFilters && (
                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                  {[
                    searchDebounced && 'Recherche',
                    filters.client && 'Client',
                    filters.typeTravaux && 'Type',
                    filters.statut && 'Statut',
                    (dateFilter.start || dateFilter.end) && 'Date',
                    (montantFilter.min || montantFilter.max) && 'Montant',
                  ].filter(Boolean).length} actif(s)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                >
                  <X className="h-3 w-3" />
                  Réinitialiser
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
              >
                {showFilters ? 'Masquer' : 'Afficher'} les filtres
              </button>
            </div>
          </div>

          {/* Filtres détaillés */}
          {showFilters && (
            <div className="space-y-4">
              {/* Première ligne : Client, Type, Statut */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Client</label>
                  <select
                    value={filters.client}
                    onChange={(e) => {
                      setFilters({ ...filters, client: e.target.value })
                      setPage(1)
                    }}
                    disabled={!!searchDebounced}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100 disabled:opacity-60"
                  >
                    <option value="">Tous les clients</option>
                    {filterOptions.clients.map((client) => (
                      <option key={client} value={client}>{client}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Type de travaux</label>
                  <select
                    value={filters.typeTravaux}
                    onChange={(e) => {
                      setFilters({ ...filters, typeTravaux: e.target.value })
                      setPage(1)
                    }}
                    disabled={!!searchDebounced}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100 disabled:opacity-60"
                  >
                    <option value="">Tous les types</option>
                    {filterOptions.typeTravaux.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">Statut</label>
                  <select
                    value={filters.statut}
                    onChange={(e) => {
                      setFilters({ ...filters, statut: e.target.value })
                      setPage(1)
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="">Tous les statuts</option>
                    {filterOptions.statuts.map((statut) => (
                      <option key={statut} value={statut}>{statut}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Deuxième ligne : Dates */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-gray-700">
                    <Calendar className="h-3 w-3" />
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={dateFilter.start}
                    onChange={(e) => {
                      setDateFilter({ ...dateFilter, start: e.target.value })
                      setPage(1)
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-gray-700">
                    <Calendar className="h-3 w-3" />
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={dateFilter.end}
                    onChange={(e) => {
                      setDateFilter({ ...dateFilter, end: e.target.value })
                      setPage(1)
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Troisième ligne : Montants */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-gray-700">
                    <DollarSign className="h-3 w-3" />
                    Montant minimum (€)
                  </label>
                  <input
                    type="number"
                    value={montantFilter.min}
                    onChange={(e) => {
                      setMontantFilter({ ...montantFilter, min: e.target.value })
                      setPage(1)
                    }}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-gray-700">
                    <DollarSign className="h-3 w-3" />
                    Montant maximum (€)
                  </label>
                  <input
                    type="number"
                    value={montantFilter.max}
                    onChange={(e) => {
                      setMontantFilter({ ...montantFilter, max: e.target.value })
                      setPage(1)
                    }}
                    placeholder="Aucune limite"
                    min="0"
                    step="0.01"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tableau style Airtable */}
      <div className="px-8 py-6">
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
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      onClick={() => handleSort('numeroDevis')}
                      className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        N° Devis
                        <SortIcon field="numeroDevis" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('client')}
                      className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        Client
                        <SortIcon field="client" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('typeTravaux')}
                      className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        Type travaux
                        <SortIcon field="typeTravaux" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('dateDevis')}
                      className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        Date
                        <SortIcon field="dateDevis" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('montantTTC')}
                      className="cursor-pointer px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-100"
                    >
                      <div className="flex items-center justify-end">
                        Montant TTC
                        <SortIcon field="montantTTC" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('statut')}
                      className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        Statut
                        <SortIcon field="statut" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {devis.map((devi) => (
                    <tr key={devi.id} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                        {devi.numeroDevis}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{devi.client}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{devi.typeTravaux}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                        {formatDate(devi.dateDevis)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {formatMontant(devi.montantTTC)}
                      </td>
                      <td className="px-4 py-3">
                        <StatutBadge statut={devi.statut} />
                      </td>
                      <td className="relative whitespace-nowrap px-4 py-3 text-right text-sm">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === devi.id ? null : devi.id)}
                            className="rounded-md p-1 hover:bg-gray-100"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                          </button>
                          {openMenu === devi.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenu(null)}
                              />
                              <div className="absolute right-0 z-20 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      router.push(`/devis/${devi.id}`)
                                      setOpenMenu(null)
                                    }}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <Eye className="h-4 w-4" />
                                    Voir
                                  </button>
                                  <button
                                    onClick={() => {
                                      router.push(`/devis/${devi.id}/editer`)
                                      setOpenMenu(null)
                                    }}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Modifier
                                  </button>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const response = await fetch(`/api/devis/${devi.id}/export/pdf`)
                                        if (response.ok) {
                                          const blob = await response.blob()
                                          const url = window.URL.createObjectURL(blob)
                                          const a = document.createElement('a')
                                          a.href = url
                                          a.download = `devis-${devi.numeroDevis}.pdf`
                                          document.body.appendChild(a)
                                          a.click()
                                          window.URL.revokeObjectURL(url)
                                          document.body.removeChild(a)
                                        }
                                        setOpenMenu(null)
                                      } catch (error) {
                                        alert('Erreur lors de l\'export PDF')
                                      }
                                    }}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <FileText className="h-4 w-4" />
                                    Export PDF
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDelete(devi.id)
                                    }}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Supprimer
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {pagination.page} sur {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={page === pagination.totalPages}
                      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
