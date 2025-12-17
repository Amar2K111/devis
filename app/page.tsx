/**
 * Page d'accueil / Tableau de bord
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  Euro,
  ArrowRight,
  BarChart3,
} from 'lucide-react'
import PageHeader from '@/app/components/PageHeader'

interface Stats {
  total: {
    devis: number
    montantHT: number
    montantTVA: number
    montantTTC: number
  }
  ceMois: {
    devis: number
    montantTTC: number
  }
  acceptes: {
    devis: number
    montantTTC: number
  }
  enAttente: {
    devis: number
  }
  parStatut: Array<{
    statut: string
    count: number
    montantTTC: number
  }>
  parType: Array<{
    type: string
    count: number
    montantTTC: number
  }>
  evolution: Array<{
    mois: string
    count: number
    montant: number
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        const data = await response.json()
        if (response.ok && data.success) {
          setStats(data.data)
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Tableau de bord" description="Vue d'ensemble de votre activité" />
        <div className="px-8 py-6">
          <div className="text-center text-gray-500">Chargement...</div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Tableau de bord" description="Vue d'ensemble de votre activité" />
        <div className="px-8 py-6">
          <div className="text-center text-gray-500">Erreur lors du chargement des statistiques</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de votre activité"
        actions={
          <button
            onClick={() => router.push('/devis')}
            className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Voir tous les devis
            <ArrowRight className="h-4 w-4" />
          </button>
        }
      />

      <div className="px-8 py-6 space-y-6">
        {/* Cartes de statistiques principales */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600">Total devis</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total.devis}</p>
              </div>
              <div className="flex-shrink-0 rounded-full bg-blue-100 p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600">Chiffre d'affaires total</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {formatMontant(stats.total.montantTTC)}
                </p>
              </div>
              <div className="flex-shrink-0 rounded-full bg-green-100 p-3">
                <Euro className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600">Ce mois</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.ceMois.devis}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {formatMontant(stats.ceMois.montantTTC)}
                </p>
              </div>
              <div className="flex-shrink-0 rounded-full bg-purple-100 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600">Devis acceptés</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.acceptes.devis}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {formatMontant(stats.acceptes.montantTTC)}
                </p>
              </div>
              <div className="flex-shrink-0 rounded-full bg-emerald-100 p-3">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques et détails */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Répartition par statut */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Répartition par statut</h3>
            <div className="space-y-4">
              {stats.parStatut.map((item) => {
                const percentage = stats.total.devis > 0
                  ? Math.round((item.count / stats.total.devis) * 100)
                  : 0
                return (
                  <div key={item.statut}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 capitalize">{item.statut}</span>
                      <span className="text-gray-500">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatMontant(item.montantTTC)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top types de travaux */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Types de travaux</h3>
            <div className="space-y-3">
              {stats.parType.map((item, index) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between rounded-md border border-gray-100 p-3 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.type}</p>
                      <p className="text-xs text-gray-500">{item.count} devis</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatMontant(item.montantTTC)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Actions rapides</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              onClick={() => router.push('/devis/nouveau')}
              className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FileText className="h-4 w-4" />
              Nouveau devis
            </button>
            <button
              onClick={() => router.push('/import')}
              className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <BarChart3 className="h-4 w-4" />
              Importer Excel
            </button>
            <button
              onClick={() => router.push('/devis?statut=brouillon')}
              className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Clock className="h-4 w-4" />
              Devis en attente ({stats.enAttente.devis})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
