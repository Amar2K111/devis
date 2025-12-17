/**
 * Page d'édition d'un devis
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface LigneDevis {
  id?: string
  description: string
  quantite: number
  unite: string
  prixUnitaire: number
  tauxTVA: number
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
  tauxTVA: number
  statut: string
  materiaux: string | null
  notes: string | null
  lignes: LigneDevis[]
}

export default function EditerDevisPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lignes, setLignes] = useState<LigneDevis[]>([
    { description: '', quantite: 1, unite: 'unité', prixUnitaire: 0, tauxTVA: 20.0 },
  ])

  const [formData, setFormData] = useState({
    client: '',
    clientAdresse: '',
    clientTelephone: '',
    clientEmail: '',
    clientSiret: '',
    typeTravaux: '',
    dateDevis: new Date().toISOString().split('T')[0],
    dateValidite: '',
    dateDebutTravaux: '',
    tauxTVA: 20.0,
    statut: 'brouillon',
    materiaux: '',
    notes: '',
  })

  useEffect(() => {
    loadDevis()
  }, [id])

  const loadDevis = async () => {
    try {
      const response = await fetch(`/api/devis/${id}`)
      const data = await response.json()
      if (response.ok) {
        const devis: Devis = data.data
        setFormData({
          client: devis.client,
          clientAdresse: devis.clientAdresse || '',
          clientTelephone: devis.clientTelephone || '',
          clientEmail: devis.clientEmail || '',
          clientSiret: devis.clientSiret || '',
          typeTravaux: devis.typeTravaux,
          dateDevis: devis.dateDevis.split('T')[0],
          dateValidite: devis.dateValidite ? devis.dateValidite.split('T')[0] : '',
          dateDebutTravaux: devis.dateDebutTravaux ? devis.dateDebutTravaux.split('T')[0] : '',
          tauxTVA: devis.tauxTVA,
          statut: devis.statut,
          materiaux: devis.materiaux || '',
          notes: devis.notes || '',
        })
        if (devis.lignes && devis.lignes.length > 0) {
          setLignes(devis.lignes.map(l => ({
            id: l.id,
            description: l.description,
            quantite: l.quantite,
            unite: l.unite,
            prixUnitaire: l.prixUnitaire,
            tauxTVA: l.tauxTVA,
          })))
        }
      } else {
        alert(data.error || 'Erreur lors du chargement')
        router.push(`/devis/${id}`)
      }
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
      router.push(`/devis/${id}`)
    } finally {
      setLoading(false)
    }
  }

  const calculateLigne = (ligne: LigneDevis) => {
    const ht = ligne.quantite * ligne.prixUnitaire
    const tva = ht * (ligne.tauxTVA / 100)
    const ttc = ht + tva
    return {
      montantHT: Math.round(ht * 100) / 100,
      montantTVA: Math.round(tva * 100) / 100,
      montantTTC: Math.round(ttc * 100) / 100,
    }
  }

  const calculateTotals = () => {
    let totalHT = 0
    let totalTVA = 0
    let totalTTC = 0

    lignes.forEach(ligne => {
      const calc = calculateLigne(ligne)
      totalHT += calc.montantHT
      totalTVA += calc.montantTVA
      totalTTC += calc.montantTTC
    })

    return {
      montantHT: Math.round(totalHT * 100) / 100,
      montantTVA: Math.round(totalTVA * 100) / 100,
      montantTTC: Math.round(totalTTC * 100) / 100,
    }
  }

  const totals = calculateTotals()

  const handleLigneChange = (index: number, field: keyof LigneDevis, value: any) => {
    const newLignes = [...lignes]
    newLignes[index] = { ...newLignes[index], [field]: value }
    setLignes(newLignes)
  }

  const addLigne = () => {
    setLignes([...lignes, { description: '', quantite: 1, unite: 'unité', prixUnitaire: 0, tauxTVA: 20.0 }])
  }

  const removeLigne = (index: number) => {
    if (lignes.length > 1) {
      setLignes(lignes.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.client || !formData.typeTravaux) {
      alert('Veuillez remplir les champs obligatoires (Client, Type de travaux)')
      return
    }

    const lignesValides = lignes.filter(l => l.description.trim() !== '')
    if (lignesValides.length === 0) {
      alert('Veuillez ajouter au moins une ligne avec une description')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/devis/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lignes: lignesValides.map((ligne, index) => ({
            ...ligne,
            ordre: index,
          })),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/devis/${id}`)
      } else {
        alert(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error: any) {
      alert(`Erreur: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-gray-500">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/devis/${id}`)}
              className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Modifier le devis</h1>
              <p className="mt-1 text-sm text-gray-500">Modifiez les informations du devis</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/devis/${id}`)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-8 py-6">

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations client */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Informations client</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Client <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Adresse</label>
              <input
                type="text"
                value={formData.clientAdresse}
                onChange={(e) => setFormData({ ...formData, clientAdresse: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Téléphone</label>
              <input
                type="tel"
                value={formData.clientTelephone}
                onChange={(e) => setFormData({ ...formData, clientTelephone: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">SIRET</label>
              <input
                type="text"
                value={formData.clientSiret}
                onChange={(e) => setFormData({ ...formData, clientSiret: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Informations devis */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Informations devis</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Type de travaux <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.typeTravaux}
                onChange={(e) => setFormData({ ...formData, typeTravaux: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Statut</label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              >
                <option value="brouillon">Brouillon</option>
                <option value="envoyé">Envoyé</option>
                <option value="accepté">Accepté</option>
                <option value="refusé">Refusé</option>
                <option value="en cours">En cours</option>
                <option value="terminé">Terminé</option>
                <option value="annulé">Annulé</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Date du devis</label>
              <input
                type="date"
                required
                value={formData.dateDevis}
                onChange={(e) => setFormData({ ...formData, dateDevis: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Date de validité</label>
              <input
                type="date"
                value={formData.dateValidite}
                onChange={(e) => setFormData({ ...formData, dateValidite: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Date début travaux</label>
              <input
                type="date"
                value={formData.dateDebutTravaux}
                onChange={(e) => setFormData({ ...formData, dateDebutTravaux: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Taux TVA (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tauxTVA}
                onChange={(e) => setFormData({ ...formData, tauxTVA: parseFloat(e.target.value) || 20.0 })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Matériaux</label>
              <input
                type="text"
                value={formData.materiaux}
                onChange={(e) => setFormData({ ...formData, materiaux: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Lignes de devis */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Lignes de devis</h2>
            <button
              type="button"
              onClick={addLigne}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
            >
              + Ajouter une ligne
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Description</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Qté</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Unité</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Prix unitaire</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">TVA %</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-600">Total HT</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lignes.map((ligne, index) => {
                  const calc = calculateLigne(ligne)
                  return (
                    <tr key={index}>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={ligne.description}
                          onChange={(e) => handleLigneChange(index, 'description', e.target.value)}
                          placeholder="Description"
                          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-black focus:outline-none"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={ligne.quantite}
                          onChange={(e) => handleLigneChange(index, 'quantite', parseFloat(e.target.value) || 0)}
                          className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-black focus:outline-none"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={ligne.unite}
                          onChange={(e) => handleLigneChange(index, 'unite', e.target.value)}
                          placeholder="unité"
                          className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-black focus:outline-none"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={ligne.prixUnitaire}
                          onChange={(e) => handleLigneChange(index, 'prixUnitaire', parseFloat(e.target.value) || 0)}
                          className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-black focus:outline-none"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.1"
                          value={ligne.tauxTVA}
                          onChange={(e) => handleLigneChange(index, 'tauxTVA', parseFloat(e.target.value) || 20.0)}
                          className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-black focus:outline-none"
                        />
                      </td>
                      <td className="px-3 py-2 text-right text-sm font-medium">
                        {calc.montantHT.toFixed(2)} €
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => removeLigne(index)}
                          disabled={lignes.length === 1}
                          className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Totaux */}
          <div className="mt-4 flex justify-end">
            <div className="w-64 space-y-2 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total HT:</span>
                <span className="font-medium">{totals.montantHT.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total TVA:</span>
                <span className="font-medium">{totals.montantTVA.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold">
                <span>Total TTC:</span>
                <span>{totals.montantTTC.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push(`/devis/${id}`)}
            className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-black px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}

