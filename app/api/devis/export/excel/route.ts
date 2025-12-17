/**
 * API Route pour exporter les devis en Excel
 * GET /api/devis/export/excel
 * 
 * Accepte les mêmes paramètres de filtres que GET /api/devis
 */

import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Récupérer les mêmes paramètres de filtres que l'API GET /api/devis
    const client = searchParams.get('client')
    const typeTravaux = searchParams.get('typeTravaux')
    const statut = searchParams.get('statut')
    const dateDebut = searchParams.get('dateDebut')
    const dateFin = searchParams.get('dateFin')
    const search = searchParams.get('search')
    const montantMin = searchParams.get('montantMin')
    const montantMax = searchParams.get('montantMax')

    // Construire les conditions de filtrage (même logique que GET /api/devis)
    const whereConditions: any[] = []

    if (search) {
      whereConditions.push({
        OR: [
          { client: { contains: search, mode: 'insensitive' } },
          { typeTravaux: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
          { materiaux: { contains: search, mode: 'insensitive' } },
        ]
      })
    }

    if (client && !search) {
      whereConditions.push({ client: { contains: client, mode: 'insensitive' } })
    }

    if (typeTravaux && !search) {
      whereConditions.push({ typeTravaux: { contains: typeTravaux, mode: 'insensitive' } })
    }

    if (statut) {
      whereConditions.push({ statut: statut.toLowerCase() })
    }

    if (dateDebut || dateFin) {
      const dateFilter: any = {}
      if (dateDebut) {
        dateFilter.gte = new Date(dateDebut)
      }
      if (dateFin) {
        const dateFinObj = new Date(dateFin)
        dateFinObj.setHours(23, 59, 59, 999)
        dateFilter.lte = dateFinObj
      }
      whereConditions.push({ dateDevis: dateFilter })
    }

    if (montantMin || montantMax) {
      const montantFilter: any = {}
      if (montantMin) {
        montantFilter.gte = parseFloat(montantMin)
      }
      if (montantMax) {
        montantFilter.lte = parseFloat(montantMax)
      }
      whereConditions.push({ montantTTC: montantFilter })
    }

    const where: any = whereConditions.length > 0 
      ? (whereConditions.length === 1 ? whereConditions[0] : { AND: whereConditions })
      : {}

    // Récupérer tous les devis (sans pagination pour l'export)
    const devis = await prisma.devis.findMany({
      where,
      orderBy: { dateDevis: 'desc' },
      include: {
        lignes: {
          orderBy: { ordre: 'asc' },
        },
      },
    })

    // Préparer les données pour Excel
    const excelData = devis.map(devis => ({
      'N° Devis': devis.numeroDevis,
      'Client': devis.client,
      'Adresse': devis.clientAdresse || '',
      'Téléphone': devis.clientTelephone || '',
      'Email': devis.clientEmail || '',
      'SIRET': devis.clientSiret || '',
      'Type travaux': devis.typeTravaux,
      'Date devis': new Date(devis.dateDevis).toLocaleDateString('fr-FR'),
      'Date validité': devis.dateValidite ? new Date(devis.dateValidite).toLocaleDateString('fr-FR') : '',
      'Date début travaux': devis.dateDebutTravaux ? new Date(devis.dateDebutTravaux).toLocaleDateString('fr-FR') : '',
      'Montant HT': devis.montantHT,
      'Taux TVA': devis.tauxTVA,
      'Montant TVA': devis.montantTVA,
      'Montant TTC': devis.montantTTC,
      'Statut': devis.statut,
      'Matériaux': devis.materiaux || '',
      'Notes': devis.notes || '',
      'Nb lignes': devis.lignes.length,
    }))

    // Créer le workbook
    const workbook = XLSX.utils.book_new()
    
    // Feuille principale avec les devis
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    
    // Ajuster la largeur des colonnes
    const colWidths = [
      { wch: 15 }, // N° Devis
      { wch: 25 }, // Client
      { wch: 30 }, // Adresse
      { wch: 15 }, // Téléphone
      { wch: 25 }, // Email
      { wch: 15 }, // SIRET
      { wch: 20 }, // Type travaux
      { wch: 12 }, // Date devis
      { wch: 12 }, // Date validité
      { wch: 15 }, // Date début travaux
      { wch: 12 }, // Montant HT
      { wch: 10 }, // Taux TVA
      { wch: 12 }, // Montant TVA
      { wch: 12 }, // Montant TTC
      { wch: 12 }, // Statut
      { wch: 30 }, // Matériaux
      { wch: 40 }, // Notes
      { wch: 10 }, // Nb lignes
    ]
    worksheet['!cols'] = colWidths

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Devis')

    // Feuille avec les lignes détaillées
    const lignesData: any[] = []
    devis.forEach(devis => {
      if (devis.lignes.length > 0) {
        devis.lignes.forEach(ligne => {
          lignesData.push({
            'N° Devis': devis.numeroDevis,
            'Client': devis.client,
            'Description': ligne.description,
            'Quantité': ligne.quantite,
            'Unité': ligne.unite,
            'Prix unitaire': ligne.prixUnitaire,
            'Taux TVA': ligne.tauxTVA,
            'Montant HT': ligne.montantHT,
            'Montant TVA': ligne.montantTVA,
            'Montant TTC': ligne.montantTTC,
          })
        })
      } else {
        // Si pas de lignes, ajouter une ligne avec les totaux
        lignesData.push({
          'N° Devis': devis.numeroDevis,
          'Client': devis.client,
          'Description': 'Total',
          'Quantité': '',
          'Unité': '',
          'Prix unitaire': '',
          'Taux TVA': devis.tauxTVA,
          'Montant HT': devis.montantHT,
          'Montant TVA': devis.montantTVA,
          'Montant TTC': devis.montantTTC,
        })
      }
    })

    if (lignesData.length > 0) {
      const lignesWorksheet = XLSX.utils.json_to_sheet(lignesData)
      const lignesColWidths = [
        { wch: 15 }, // N° Devis
        { wch: 25 }, // Client
        { wch: 40 }, // Description
        { wch: 10 }, // Quantité
        { wch: 10 }, // Unité
        { wch: 12 }, // Prix unitaire
        { wch: 10 }, // Taux TVA
        { wch: 12 }, // Montant HT
        { wch: 12 }, // Montant TVA
        { wch: 12 }, // Montant TTC
      ]
      lignesWorksheet['!cols'] = lignesColWidths
      XLSX.utils.book_append_sheet(workbook, lignesWorksheet, 'Lignes détaillées')
    }

    // Générer le buffer Excel
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Retourner le fichier Excel
    const filename = `devis-export-${new Date().toISOString().split('T')[0]}.xlsx`
    
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Erreur lors de l\'export Excel:', error)
    return NextResponse.json(
      { error: `Erreur lors de l'export Excel: ${error.message}` },
      { status: 500 }
    )
  }
}

