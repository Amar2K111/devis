/**
 * Page Clients - Liste et gestion des clients
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Eye, FileText, Euro, Calendar, Building2, Phone, Mail, Hash } from 'lucide-react'
import PageHeader from '@/app/components/PageHeader'

interface Client {
  nom: string
  adresse: string | null
  telephone: string | null
  email: string | null
  siret: string | null
  totalDevis: number
  totalMontant: number
  montantAccepte: number
  dernierDevis: string
  devisIds: string[]
}

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/clients')
      const data = await response.json()
      if (response.ok && data.success) {
        setClients(data.data || [])
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const filteredClients = clients.filter(client =>
    client.nom.toLowerCase().includes(search.toLowerCase()) ||
    client.email?.toLowerCase().includes(search.toLowerCase()) ||
    client.telephone?.includes(search) ||
    client.siret?.includes(search)
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Clients" description="Gestion des clients" />
        <div className="px-8 py-6">
          <div className="text-center text-gray-500">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Clients"
        description={`${clients.length} client${clients.length > 1 ? 's' : ''} au total`}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un client..."
        actions={
          <button
            onClick={() => router.push('/devis/nouveau')}
            className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Nouveau devis
          </button>
        }
      />

      <div className="px-8 py-6">
        {filteredClients.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm font-medium text-gray-900">
              {search ? 'Aucun client trouvé' : 'Aucun client'}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {search
                ? 'Essayez une autre recherche'
                : 'Les clients apparaîtront ici après la création de devis'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client, index) => (
              <div
                key={index}
                className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* En-tête client */}
                <div className="mb-4 min-h-[60px]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{client.nom}</h3>
                      <div className="mt-1 min-h-[20px]">
                        {client.siret ? (
                          <p className="flex items-center gap-1 text-xs text-gray-500">
                            <Hash className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{client.siret}</span>
                          </p>
                        ) : (
                          <div className="h-5" />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/devis?search=${encodeURIComponent(client.nom)}`)}
                      className="ml-2 flex-shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      aria-label="Voir les devis"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Informations de contact - Hauteur fixe pour alignement */}
                <div className="mb-4 min-h-[100px] space-y-2">
                  <div className="flex items-start gap-2 text-sm text-gray-600 min-h-[20px]">
                    <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className={client.adresse ? '' : 'text-gray-400 italic'}>
                      {client.adresse || 'Non renseigné'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 min-h-[20px]">
                    <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    {client.telephone ? (
                      <a
                        href={`tel:${client.telephone}`}
                        className="hover:text-gray-900"
                      >
                        {client.telephone}
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">Non renseigné</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 min-h-[20px]">
                    <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    {client.email ? (
                      <a
                        href={`mailto:${client.email}`}
                        className="hover:text-gray-900 truncate"
                      >
                        {client.email}
                      </a>
                    ) : (
                      <span className="text-gray-400 italic truncate">Non renseigné</span>
                    )}
                  </div>
                </div>

                {/* Statistiques - Hauteur fixe pour alignement */}
                <div className="border-t border-gray-100 pt-4 space-y-3 min-h-[140px] flex flex-col">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total devis</span>
                    <span className="font-semibold text-gray-900">{client.totalDevis}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Montant total</span>
                    <span className="font-semibold text-gray-900">
                      {formatMontant(client.totalMontant)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm min-h-[20px]">
                    <span className="text-gray-600">Montant accepté</span>
                    <span className={`font-semibold ${client.montantAccepte > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {client.montantAccepte > 0 ? formatMontant(client.montantAccepte) : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Dernier devis
                    </div>
                    <span>{formatDate(client.dernierDevis)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => router.push(`/devis?search=${encodeURIComponent(client.nom)}`)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <FileText className="h-4 w-4" />
                    Voir les devis
                  </button>
                  <button
                    onClick={() => {
                      // Pré-remplir le formulaire avec les infos client
                      const params = new URLSearchParams()
                      params.set('client', client.nom)
                      if (client.adresse) params.set('adresse', client.adresse)
                      if (client.telephone) params.set('telephone', client.telephone)
                      if (client.email) params.set('email', client.email)
                      if (client.siret) params.set('siret', client.siret)
                      router.push(`/devis/nouveau?${params.toString()}`)
                    }}
                    className="flex items-center justify-center gap-2 rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    <Plus className="h-4 w-4" />
                    Nouveau devis
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
