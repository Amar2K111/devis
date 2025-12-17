/**
 * API Route pour les statistiques du tableau de bord
 * GET /api/dashboard/stats
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Statistiques globales
    const totalDevis = await prisma.devis.count()
    
    // Montants totaux
    const montants = await prisma.devis.aggregate({
      _sum: {
        montantHT: true,
        montantTVA: true,
        montantTTC: true,
      },
    })

    // Statistiques par statut
    const statsByStatut = await prisma.devis.groupBy({
      by: ['statut'],
      _count: {
        id: true,
      },
      _sum: {
        montantTTC: true,
      },
    })

    // Statistiques par type de travaux
    const statsByType = await prisma.devis.groupBy({
      by: ['typeTravaux'],
      _count: {
        id: true,
      },
      _sum: {
        montantTTC: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    })

    // Devis du mois en cours
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const devisCeMois = await prisma.devis.count({
      where: {
        dateDevis: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    })

    const montantCeMois = await prisma.devis.aggregate({
      where: {
        dateDevis: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        montantTTC: true,
      },
    })

    // Devis acceptés
    const devisAcceptes = await prisma.devis.count({
      where: {
        statut: 'accepté',
      },
    })

    const montantAcceptes = await prisma.devis.aggregate({
      where: {
        statut: 'accepté',
      },
      _sum: {
        montantTTC: true,
      },
    })

    // Devis en attente (brouillon + envoyé)
    const devisEnAttente = await prisma.devis.count({
      where: {
        statut: {
          in: ['brouillon', 'envoyé'],
        },
      },
    })

    // Évolution des 6 derniers mois
    const sixMoisAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const evolution = await prisma.devis.findMany({
      where: {
        dateDevis: {
          gte: sixMoisAgo,
        },
      },
      select: {
        dateDevis: true,
        montantTTC: true,
        statut: true,
      },
    })

    // Grouper par mois
    const evolutionParMois: Record<string, { count: number; montant: number }> = {}
    evolution.forEach((devis) => {
      const mois = new Date(devis.dateDevis).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
      })
      if (!evolutionParMois[mois]) {
        evolutionParMois[mois] = { count: 0, montant: 0 }
      }
      evolutionParMois[mois].count++
      evolutionParMois[mois].montant += devis.montantTTC
    })

    return NextResponse.json({
      success: true,
      data: {
        total: {
          devis: totalDevis,
          montantHT: montants._sum.montantHT || 0,
          montantTVA: montants._sum.montantTVA || 0,
          montantTTC: montants._sum.montantTTC || 0,
        },
        ceMois: {
          devis: devisCeMois,
          montantTTC: montantCeMois._sum.montantTTC || 0,
        },
        acceptes: {
          devis: devisAcceptes,
          montantTTC: montantAcceptes._sum.montantTTC || 0,
        },
        enAttente: {
          devis: devisEnAttente,
        },
        parStatut: statsByStatut.map((s) => ({
          statut: s.statut,
          count: s._count.id,
          montantTTC: s._sum.montantTTC || 0,
        })),
        parType: statsByType.map((t) => ({
          type: t.typeTravaux,
          count: t._count.id,
          montantTTC: t._sum.montantTTC || 0,
        })),
        evolution: Object.entries(evolutionParMois).map(([mois, data]) => ({
          mois,
          count: data.count,
          montant: data.montant,
        })),
      },
    })
  } catch (error: any) {
    console.error('Erreur lors de la récupération des stats:', error)
    return NextResponse.json(
      { error: `Erreur: ${error.message}` },
      { status: 500 }
    )
  }
}

