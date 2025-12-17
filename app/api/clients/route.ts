/**
 * API Route pour gérer les clients
 * GET /api/clients - Liste tous les clients avec leurs statistiques
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Récupérer tous les devis groupés par client
    const devis = await prisma.devis.findMany({
      select: {
        client: true,
        clientAdresse: true,
        clientTelephone: true,
        clientEmail: true,
        clientSiret: true,
        montantTTC: true,
        statut: true,
        dateDevis: true,
        id: true,
      },
      orderBy: {
        dateDevis: 'desc',
      },
    })

    // Grouper par client et calculer les statistiques
    const clientsMap = new Map<string, {
      nom: string
      adresse: string | null
      telephone: string | null
      email: string | null
      siret: string | null
      totalDevis: number
      totalMontant: number
      montantAccepte: number
      dernierDevis: Date
      devisIds: string[]
    }>()

    devis.forEach((devis) => {
      const key = devis.client.toLowerCase().trim()
      
      if (!clientsMap.has(key)) {
        clientsMap.set(key, {
          nom: devis.client,
          adresse: devis.clientAdresse,
          telephone: devis.clientTelephone,
          email: devis.clientEmail,
          siret: devis.clientSiret,
          totalDevis: 0,
          totalMontant: 0,
          montantAccepte: 0,
          dernierDevis: devis.dateDevis,
          devisIds: [],
        })
      }

      const client = clientsMap.get(key)!
      client.totalDevis++
      client.totalMontant += devis.montantTTC
      if (devis.statut === 'accepté') {
        client.montantAccepte += devis.montantTTC
      }
      if (devis.dateDevis > client.dernierDevis) {
        client.dernierDevis = devis.dateDevis
      }
      client.devisIds.push(devis.id)
    })

    // Convertir en tableau et trier par nom
    const clients = Array.from(clientsMap.values())
      .map(client => ({
        ...client,
        dernierDevis: client.dernierDevis.toISOString(),
      }))
      .sort((a, b) => a.nom.localeCompare(b.nom))

    return NextResponse.json({
      success: true,
      data: clients,
      total: clients.length,
    })
  } catch (error: any) {
    console.error('Erreur lors de la récupération des clients:', error)
    return NextResponse.json(
      { error: `Erreur: ${error.message}` },
      { status: 500 }
    )
  }
}

