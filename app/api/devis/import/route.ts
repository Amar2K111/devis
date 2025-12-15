/**
 * API Route pour importer un fichier Excel et créer des devis
 * POST /api/devis/import
 * 
 * Accepte un fichier Excel avec les colonnes :
 * - client
 * - typeTravaux
 * - dateDevis (format: YYYY-MM-DD)
 * - montant
 * - statut
 * - materiaux (optionnel)
 * - notes (optionnel)
 */

import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Vérifier que c'est un fichier Excel
    const validExtensions = ['.xlsx', '.xls', '.csv']
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    
    if (!validExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Format de fichier non supporté. Utilisez .xlsx, .xls ou .csv' },
        { status: 400 }
      )
    }

    // Lire le fichier Excel
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convertir en JSON
    const data = XLSX.utils.sheet_to_json(worksheet)

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Le fichier Excel est vide ou invalide' },
        { status: 400 }
      )
    }

    // Mapper les données et créer les devis
    const devis = []
    const errors = []

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any
      
      try {
        // Normaliser les noms de colonnes (insensible à la casse et aux espaces)
        const normalizeKey = (key: string) => key.toLowerCase().trim().replace(/\s+/g, '')
        
        const rowNormalized: any = {}
        Object.keys(row).forEach(key => {
          rowNormalized[normalizeKey(key)] = row[key]
        })

        // Vérifier les champs obligatoires
        const client = rowNormalized['client']?.toString().trim()
        const typeTravaux = rowNormalized['typetravaux']?.toString().trim()
        const dateDevis = rowNormalized['datedevis']
        const montant = rowNormalized['montant']
        const statut = rowNormalized['statut']?.toString().trim()

        if (!client || !typeTravaux || !dateDevis || montant === undefined || !statut) {
          errors.push(`Ligne ${i + 2}: Champs obligatoires manquants`)
          continue
        }

        // Parser la date
        let parsedDate: Date
        if (dateDevis instanceof Date) {
          parsedDate = dateDevis
        } else if (typeof dateDevis === 'string' || typeof dateDevis === 'number') {
          parsedDate = new Date(dateDevis)
          if (isNaN(parsedDate.getTime())) {
            errors.push(`Ligne ${i + 2}: Date invalide`)
            continue
          }
        } else {
          errors.push(`Ligne ${i + 2}: Format de date invalide`)
          continue
        }

        // Parser le montant
        const parsedMontant = parseFloat(montant.toString())
        if (isNaN(parsedMontant)) {
          errors.push(`Ligne ${i + 2}: Montant invalide`)
          continue
        }

        // Vérifier le statut
        const statutsValides = ['en attente', 'validé', 'annulé']
        const statutNormalized = statut.toLowerCase()
        if (!statutsValides.includes(statutNormalized)) {
          errors.push(`Ligne ${i + 2}: Statut invalide (doit être: en attente, validé, annulé)`)
          continue
        }

        // Créer le devis
        const devisData = {
          client,
          typeTravaux,
          dateDevis: parsedDate,
          montant: parsedMontant,
          statut: statutNormalized,
          materiaux: rowNormalized['materiaux']?.toString().trim() || null,
          notes: rowNormalized['notes']?.toString().trim() || null,
        }

        const createdDevis = await prisma.devis.create({
          data: devisData,
        })

        devis.push(createdDevis)
      } catch (error: any) {
        errors.push(`Ligne ${i + 2}: ${error.message || 'Erreur inconnue'}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${devis.length} devis créés avec succès`,
      count: devis.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Erreur lors de l\'import:', error)
    return NextResponse.json(
      { error: `Erreur lors de l'import: ${error.message}` },
      { status: 500 }
    )
  }
}

