/**
 * Page Paramètres - Configuration de l'application
 */

'use client'

import { useState, useEffect } from 'react'
import { Save, Building2, FileText, Eye, CheckCircle2 } from 'lucide-react'
import PageHeader from '@/app/components/PageHeader'

interface Settings {
  // Informations entreprise
  entreprise: {
    nom: string
    adresse: string
    codePostal: string
    ville: string
    telephone: string
    email: string
    siret: string
    tvaIntracommunautaire: string
  }
  // Paramètres devis par défaut
  devis: {
    tauxTVADefaut: number
    dureeValiditeDefaut: number // en jours
    prefixeNumero: string
    conditionsGenerales: string
    notesParDefaut: string
  }
  // Paramètres d'affichage
  affichage: {
    formatDate: string
    devise: string
    langue: string
  }
}

const DEFAULT_SETTINGS: Settings = {
  entreprise: {
    nom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    telephone: '',
    email: '',
    siret: '',
    tvaIntracommunautaire: '',
  },
  devis: {
    tauxTVADefaut: 20.0,
    dureeValiditeDefaut: 30,
    prefixeNumero: 'DEV',
    conditionsGenerales: '',
    notesParDefaut: '',
  },
  affichage: {
    formatDate: 'fr-FR',
    devise: 'EUR',
    langue: 'fr',
  },
}

export default function ParametresPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Charger les paramètres depuis localStorage
    const saved = localStorage.getItem('appSettings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error)
      }
    }
    setLoading(false)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    
    try {
      // Sauvegarder dans localStorage
      localStorage.setItem('appSettings', JSON.stringify(settings))
      
      // Simuler un délai pour l'UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde des paramètres')
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (section: keyof Settings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Paramètres" description="Configuration de l'application" />
        <div className="px-8 py-6">
          <div className="text-center text-gray-500">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Paramètres"
        description="Configurez votre application de gestion de devis"
        actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Enregistrement...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Enregistré
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Enregistrer
              </>
            )}
          </button>
        }
      />

      <div className="px-8 py-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Informations entreprise */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Informations entreprise</h2>
            </div>
            <p className="mb-4 text-sm text-gray-500">
              Ces informations seront utilisées dans vos devis et documents
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nom de l'entreprise <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.entreprise.nom}
                  onChange={(e) => updateSettings('entreprise', 'nom', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  placeholder="Ex: Entreprise BTP Martin"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Adresse</label>
                <input
                  type="text"
                  value={settings.entreprise.adresse}
                  onChange={(e) => updateSettings('entreprise', 'adresse', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  placeholder="Ex: 123 Rue de la Construction"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Code postal</label>
                <input
                  type="text"
                  value={settings.entreprise.codePostal}
                  onChange={(e) => updateSettings('entreprise', 'codePostal', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  placeholder="75001"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ville</label>
                <input
                  type="text"
                  value={settings.entreprise.ville}
                  onChange={(e) => updateSettings('entreprise', 'ville', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  placeholder="Paris"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Téléphone</label>
                <input
                  type="tel"
                  value={settings.entreprise.telephone}
                  onChange={(e) => updateSettings('entreprise', 'telephone', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  placeholder="01 23 45 67 89"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={settings.entreprise.email}
                  onChange={(e) => updateSettings('entreprise', 'email', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  placeholder="contact@entreprise.fr"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">SIRET</label>
                <input
                  type="text"
                  value={settings.entreprise.siret}
                  onChange={(e) => updateSettings('entreprise', 'siret', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  placeholder="123 456 789 00012"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">TVA Intracommunautaire</label>
                <input
                  type="text"
                  value={settings.entreprise.tvaIntracommunautaire}
                  onChange={(e) => updateSettings('entreprise', 'tvaIntracommunautaire', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  placeholder="FR12 345678901"
                />
              </div>
            </div>
          </div>

          {/* Paramètres devis */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Paramètres devis</h2>
            </div>
            <p className="mb-4 text-sm text-gray-500">
              Valeurs par défaut pour les nouveaux devis
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Taux TVA par défaut (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={settings.devis.tauxTVADefaut}
                  onChange={(e) => updateSettings('devis', 'tauxTVADefaut', parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Durée de validité par défaut (jours)
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.devis.dureeValiditeDefaut}
                  onChange={(e) => updateSettings('devis', 'dureeValiditeDefaut', parseInt(e.target.value) || 30)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Préfixe numéro de devis
                </label>
                <input
                  type="text"
                  value={settings.devis.prefixeNumero}
                  onChange={(e) => updateSettings('devis', 'prefixeNumero', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  placeholder="DEV"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Conditions générales
                </label>
                <textarea
                  value={settings.devis.conditionsGenerales}
                  onChange={(e) => updateSettings('devis', 'conditionsGenerales', e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  placeholder="Conditions générales de vente..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Notes par défaut
                </label>
                <textarea
                  value={settings.devis.notesParDefaut}
                  onChange={(e) => updateSettings('devis', 'notesParDefaut', e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  placeholder="Notes qui apparaîtront par défaut sur les nouveaux devis..."
                />
              </div>
            </div>
          </div>

          {/* Paramètres d'affichage */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Paramètres d'affichage</h2>
            </div>
            <p className="mb-4 text-sm text-gray-500">
              Personnalisez l'affichage de l'application
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Format de date
                </label>
                <select
                  value={settings.affichage.formatDate}
                  onChange={(e) => updateSettings('affichage', 'formatDate', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                >
                  <option value="fr-FR">Français (JJ/MM/AAAA)</option>
                  <option value="en-US">Anglais (MM/DD/YYYY)</option>
                  <option value="de-DE">Allemand (DD.MM.YYYY)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Devise
                </label>
                <select
                  value={settings.affichage.devise}
                  onChange={(e) => updateSettings('affichage', 'devise', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar ($)</option>
                  <option value="GBP">Livre (£)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Langue
                </label>
                <select
                  value={settings.affichage.langue}
                  onChange={(e) => updateSettings('affichage', 'langue', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bouton de sauvegarde en bas */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Enregistrement...
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Paramètres enregistrés
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Enregistrer les paramètres
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
