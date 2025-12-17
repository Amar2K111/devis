/**
 * Page de détails d'un devis
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

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

export default function DevisDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [devis, setDevis] = useState<Devis | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportingPDF, setExportingPDF] = useState(false)
  const [exportingExcel, setExportingExcel] = useState(false)

  useEffect(() => {
    loadDevis()
  }, [id])

  const loadDevis = async () => {
    try {
      const response = await fetch(`/api/devis/${id}`)
      const data = await response.json()
      if (response.ok) {
        setDevis(data.data)
      } else {
        alert(data.error || 'Erreur lors du chargement')
        router.push('/devis')
      }
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
      router.push('/devis')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) return

    try {
      const response = await fetch(`/api/devis?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        router.push('/devis')
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la suppression')
      }
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
    }
  }

  const handleExportPDF = async () => {
    setExportingPDF(true)
    try {
      const response = await fetch(`/api/devis/${id}/export/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `devis-${devis?.numeroDevis || id}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de l\'export PDF')
      }
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
    } finally {
      setExportingPDF(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant)
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'brouillon': 'bg-gray-100 text-gray-800',
      'envoyé': 'bg-blue-100 text-blue-800',
      'accepté': 'bg-green-100 text-green-800',
      'refusé': 'bg-red-100 text-red-800',
      'en cours': 'bg-yellow-100 text-yellow-800',
      'terminé': 'bg-green-100 text-green-800',
      'annulé': 'bg-red-100 text-red-800',
    }
    return colors[statut.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-gray-500">Chargement...</div>
        </div>
      </div>
    )
  }

  if (!devis) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/devis')}
              className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Devis {devis.numeroDevis}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Créé le {formatDate(devis.createdAt)}
              {devis.updatedAt !== devis.createdAt && ` • Modifié le ${formatDate(devis.updatedAt)}`}
            </p>
            </div>
          </div>
          <div className="flex gap-2">
          <button
            onClick={() => router.push(`/devis/${id}/editer`)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Modifier
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exportingPDF}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            {exportingPDF ? 'Export...' : 'PDF'}
          </button>
          <button
            onClick={handleDelete}
            className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Supprimer
          </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-8 py-6">
        <div className="space-y-6">
        {/* Informations client */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Client</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">Nom</p>
              <p className="text-sm font-medium text-gray-900">{devis.client}</p>
            </div>
            {devis.clientAdresse && (
              <div>
                <p className="text-xs text-gray-500">Adresse</p>
                <p className="text-sm text-gray-900">{devis.clientAdresse}</p>
              </div>
            )}
            {devis.clientTelephone && (
              <div>
                <p className="text-xs text-gray-500">Téléphone</p>
                <p className="text-sm text-gray-900">{devis.clientTelephone}</p>
              </div>
            )}
            {devis.clientEmail && (
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{devis.clientEmail}</p>
              </div>
            )}
            {devis.clientSiret && (
              <div>
                <p className="text-xs text-gray-500">SIRET</p>
                <p className="text-sm text-gray-900">{devis.clientSiret}</p>
              </div>
            )}
          </div>
        </div>

        {/* Informations devis */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Informations</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">Type de travaux</p>
              <p className="text-sm font-medium text-gray-900">{devis.typeTravaux}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Statut</p>
              <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatutColor(devis.statut)}`}>
                {devis.statut}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Date du devis</p>
              <p className="text-sm text-gray-900">{formatDate(devis.dateDevis)}</p>
            </div>
            {devis.dateValidite && (
              <div>
                <p className="text-xs text-gray-500">Date de validité</p>
                <p className="text-sm text-gray-900">{formatDate(devis.dateValidite)}</p>
              </div>
            )}
            {devis.dateDebutTravaux && (
              <div>
                <p className="text-xs text-gray-500">Date début travaux</p>
                <p className="text-sm text-gray-900">{formatDate(devis.dateDebutTravaux)}</p>
              </div>
            )}
            {devis.materiaux && (
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500">Matériaux</p>
                <p className="text-sm text-gray-900">{devis.materiaux}</p>
              </div>
            )}
            {devis.notes && (
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500">Notes</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{devis.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Lignes de devis */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Détail des prestations</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Quantité</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Unité</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Prix unitaire</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">TVA</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Total HT</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Total TTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {devis.lignes && devis.lignes.length > 0 ? (
                  devis.lignes.map((ligne) => (
                    <tr key={ligne.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{ligne.description}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">{ligne.quantite}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ligne.unite}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">{formatMontant(ligne.prixUnitaire)}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">{ligne.tauxTVA}%</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{formatMontant(ligne.montantHT)}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{formatMontant(ligne.montantTTC)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      Aucune ligne de devis
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="border-t-2 border-gray-300 bg-gray-50">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    Total HT:
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {formatMontant(devis.montantHT)}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    TVA ({devis.tauxTVA}%):
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {formatMontant(devis.montantTVA)}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right text-base font-bold text-gray-900">
                    Total TTC:
                  </td>
                  <td className="px-4 py-3 text-right text-base font-bold text-gray-900">
                    {formatMontant(devis.montantTTC)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

