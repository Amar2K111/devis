/**
 * Page d'import Excel style Airtable - avec preview et mapping
 */

'use client'

import { useState, useRef, DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import PageHeader from '@/app/components/PageHeader'

interface PreviewData {
  headers: string[]
  rows: any[][]
  rawData: any[]
}

const REQUIRED_FIELDS = ['client', 'typetravaux', 'datedevis', 'montant', 'statut']
const OPTIONAL_FIELDS = [
  'clientadresse', 'clienttelephone', 'clientemail', 'clientsiret',
  'datevalidite', 'datedebuttravaux', 'tauxtva', 'materiaux', 'notes'
]

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls') || droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.pdf'))) {
      handleFile(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile)
    setMessage(null)
    setPreview(null)

      try {
        // Si c'est un PDF, on ne peut pas le prévisualiser côté client mais on peut l'importer
        if (selectedFile.name.toLowerCase().endsWith('.pdf')) {
          setFile(selectedFile)
          setMessage({
            type: 'success',
            text: `Fichier PDF sélectionné: ${selectedFile.name}. Le PDF sera converti en Excel lors de l'import.`
          })
          setPreview(null)
          return
        }

        const buffer = await selectedFile.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        // Convertir en JSON
        const rawData = XLSX.utils.sheet_to_json(worksheet)
        
        if (!Array.isArray(rawData) || rawData.length === 0) {
          setMessage({ type: 'error', text: 'Le fichier Excel est vide ou invalide' })
          return
        }

      // Normaliser les clés (insensible à la casse)
      const normalizeKey = (key: string) => key.toLowerCase().trim().replace(/\s+/g, '')
      const normalizedData = rawData.map((row: any) => {
        const normalized: any = {}
        Object.keys(row).forEach(key => {
          normalized[normalizeKey(key)] = row[key]
        })
        return normalized
      })

      // Extraire les en-têtes
      const headers = Object.keys(rawData[0] || {})
      const normalizedHeaders = headers.map(h => normalizeKey(h))

      // Créer les lignes pour le preview
      const rows = normalizedData.slice(0, 10).map((row: any) => 
        headers.map(header => row[normalizeKey(header)] ?? '')
      )

      setPreview({
        headers,
        rows,
        rawData: normalizedData,
      })

      // Vérifier les champs requis
      const missingFields = REQUIRED_FIELDS.filter(field => 
        !normalizedHeaders.includes(field)
      )

      if (missingFields.length > 0) {
        setMessage({
          type: 'warning',
          text: `Champs requis manquants détectés: ${missingFields.join(', ')}. L'import peut échouer.`,
        })
      } else {
        setMessage({
          type: 'success',
          text: `Fichier valide. ${rawData.length} ligne(s) détectée(s).`,
        })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `Erreur lors de la lecture du fichier: ${error.message}` })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un fichier' })
      return
    }

    setImporting(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/devis/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        const successMessage = data.count > 0 
          ? `${data.count} devis créé(s) avec succès${data.errors && data.errors.length > 0 ? ` (${data.errors.length} erreur(s))` : ''}`
          : 'Aucun devis créé. Vérifiez les erreurs ci-dessous.'
        
        setMessage({ 
          type: data.count > 0 ? 'success' : 'warning', 
          text: successMessage
        })
        
        if (data.errors && data.errors.length > 0) {
          console.warn('Erreurs lors de l\'import:', data.errors)
          // Afficher les erreurs dans un message détaillé
          const errorDetails = data.errors.slice(0, 5).join('\n')
          if (data.errors.length > 5) {
            setMessage({
              type: 'warning',
              text: `${successMessage}\n\nPremières erreurs:\n${errorDetails}\n... et ${data.errors.length - 5} autres erreurs.`,
            })
          } else {
            setMessage({
              type: 'warning',
              text: `${successMessage}\n\nErreurs:\n${errorDetails}`,
            })
          }
        }
        
        setFile(null)
        setPreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        
        // Rediriger vers la liste après 2 secondes seulement si des devis ont été créés
        if (data.count > 0) {
          setTimeout(() => {
            router.push('/devis')
          }, 2000)
        }
      } else {
        const errorText = data.error || 'Erreur lors de l\'import'
        console.error('Erreur API:', errorText)
        setMessage({ type: 'error', text: errorText })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `Erreur: ${error.message}` })
    } finally {
      setImporting(false)
    }
  }

  const getFieldStatus = (header: string) => {
    const normalized = header.toLowerCase().trim().replace(/\s+/g, '')
    if (REQUIRED_FIELDS.includes(normalized)) {
      return 'required'
    }
    if (OPTIONAL_FIELDS.includes(normalized)) {
      return 'optional'
    }
    return 'unknown'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Import Devis / PDF"
        description="Importez vos devis depuis un fichier Excel (.xlsx, .xls, .csv) ou PDF (converti automatiquement en Excel)"
        showBackButton
        backHref="/devis"
      />

      <div className="px-8 py-6">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Zone de drag and drop */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-lg border-2 border-dashed transition-colors ${
                isDragging 
                  ? 'border-black bg-gray-50' 
                  : file 
                    ? 'border-gray-300 bg-white' 
                    : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.pdf"
                onChange={handleFileChange}
                disabled={loading || importing}
                className="hidden"
              />
              
              <div className="flex flex-col items-center justify-center p-12 text-center">
                {file ? (
                  <>
                    <FileSpreadsheet className="mb-4 h-12 w-12 text-gray-400" />
                    <p className="mb-1 text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">Cliquez pour changer de fichier</p>
                  </>
                ) : (
                  <>
                    <Upload className="mb-4 h-12 w-12 text-gray-400" />
                    <p className="mb-1 text-sm font-medium text-gray-900">
                      Glissez-déposez votre fichier ici
                    </p>
                    <p className="text-xs text-gray-500">ou cliquez pour sélectionner</p>
                    <p className="mt-2 text-xs text-gray-400">Formats acceptés: .xlsx, .xls, .csv, .pdf (PDF converti en Excel automatiquement)</p>
                  </>
                )}
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`flex items-start gap-3 rounded-lg border p-4 ${
                message.type === 'success' 
                  ? 'border-green-200 bg-green-50 text-green-800' 
                  : message.type === 'warning'
                  ? 'border-yellow-200 bg-yellow-50 text-yellow-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                ) : message.type === 'warning' ? (
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            {/* Preview du fichier */}
            {preview && (
              <div className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                  <h3 className="text-sm font-semibold text-gray-900">Aperçu des données</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Affichage des 10 premières lignes
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {preview.headers.map((header, index) => {
                          const status = getFieldStatus(header)
                          return (
                            <th
                              key={index}
                              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                            >
                              <div className="flex items-center gap-2">
                                {header}
                                {status === 'required' && (
                                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                                    Requis
                                  </span>
                                )}
                                {status === 'optional' && (
                                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                                    Optionnel
                                  </span>
                                )}
                              </div>
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {preview.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                              {cell !== null && cell !== undefined ? String(cell) : '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bouton import */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!file || importing}
                className="flex items-center gap-2 rounded-md bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Import en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Importer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
