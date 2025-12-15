/**
 * Page d'import Excel avec drag and drop
 */

'use client'

import { useState, useRef, DragEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
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
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls') || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile)
      setMessage(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setMessage(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un fichier' })
      return
    }

    setLoading(true)
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
        setMessage({ 
          type: 'success', 
          text: `${data.count} devis créés avec succès` 
        })
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        
        // Rediriger vers la liste après 1.5 secondes
        setTimeout(() => {
          router.push('/devis')
        }, 1500)
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'import' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `Erreur: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">Importer un fichier Excel</h1>
      
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
                ? 'border-gray-300 bg-gray-50' 
                : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
          />
          
          <div className="flex flex-col items-center justify-center p-12 text-center">
            {file ? (
              <>
                <div className="mb-4 text-4xl">📄</div>
                <p className="mb-1 text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">Cliquez pour changer de fichier</p>
              </>
            ) : (
              <>
                <div className="mb-4 text-4xl">📥</div>
                <p className="mb-1 text-sm font-medium text-gray-900">
                  Glissez-déposez votre fichier ici
                </p>
                <p className="text-xs text-gray-500">ou cliquez pour sélectionner</p>
                <p className="mt-2 text-xs text-gray-400">.xlsx, .xls, .csv</p>
              </>
            )}
          </div>
        </div>

        {message && (
          <div className={`rounded-md border p-4 text-sm ${
            message.type === 'success' 
              ? 'border-green-200 bg-green-50 text-green-800' 
              : 'border-red-200 bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full rounded-md bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Import en cours...' : 'Importer'}
        </button>

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
          <p className="mb-2 font-medium">Format requis :</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>client, typeTravaux, dateDevis, montant, statut</li>
            <li>materiaux et notes (optionnels)</li>
          </ul>
        </div>
      </form>
    </div>
  )
}
