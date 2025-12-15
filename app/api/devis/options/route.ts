/**
 * API Route pour obtenir les options de filtres (valeurs uniques)
 * GET /api/devis/options - Retourne les valeurs uniques pour autocomplétion
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Récupérer toutes les valeurs uniques en parallèle
    const [clients, typeTravaux, statuts, materiaux] = await Promise.all([
      prisma.devis.findMany({
        select: { client: true },
        distinct: ['client'],
        orderBy: { client: 'asc' },
      }),
      prisma.devis.findMany({
        select: { typeTravaux: true },
        distinct: ['typeTravaux'],
        orderBy: { typeTravaux: 'asc' },
      }),
      prisma.devis.findMany({
        select: { statut: true },
        distinct: ['statut'],
        orderBy: { statut: 'asc' },
      }),
      prisma.devis.findMany({
        where: { materiaux: { not: null } },
        select: { materiaux: true },
        distinct: ['materiaux'],
        orderBy: { materiaux: 'asc' },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        clients: clients.map(d => d.client),
        typeTravaux: typeTravaux.map(d => d.typeTravaux),
        statuts: statuts.map(d => d.statut),
        materiaux: materiaux.map(d => d.materiaux).filter((m): m is string => m !== null),
      },
    })
  } catch (error: any) {
    console.error('Erreur lors de la récupération des options:', error)
    return NextResponse.json(
      { error: `Erreur lors de la récupération: ${error.message}` },
      { status: 500 }
    )
  }
}

