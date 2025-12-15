/**
 * API Route pour gérer un devis spécifique
 * GET /api/devis/[id] - Récupère un devis par son ID
 * PUT /api/devis/[id] - Met à jour un devis
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupère un devis par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const devis = await prisma.devis.findUnique({
      where: { id },
    })

    if (!devis) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: devis,
    })
  } catch (error: any) {
    console.error('Erreur lors de la récupération:', error)
    return NextResponse.json(
      { error: `Erreur: ${error.message}` },
      { status: 500 }
    )
  }
}

// PUT - Met à jour un devis
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // Vérifier que le devis existe
    const existingDevis = await prisma.devis.findUnique({
      where: { id },
    })

    if (!existingDevis) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      )
    }

    // Préparer les données de mise à jour
    const updateData: any = {}

    if (body.client !== undefined) updateData.client = body.client
    if (body.typeTravaux !== undefined) updateData.typeTravaux = body.typeTravaux
    if (body.dateDevis !== undefined) updateData.dateDevis = new Date(body.dateDevis)
    if (body.montant !== undefined) updateData.montant = parseFloat(body.montant)
    if (body.statut !== undefined) {
      const statutsValides = ['en attente', 'validé', 'annulé']
      const statutNormalized = body.statut.toLowerCase()
      if (!statutsValides.includes(statutNormalized)) {
        return NextResponse.json(
          { error: 'Statut invalide' },
          { status: 400 }
        )
      }
      updateData.statut = statutNormalized
    }
    if (body.materiaux !== undefined) updateData.materiaux = body.materiaux || null
    if (body.notes !== undefined) updateData.notes = body.notes || null

    // Mettre à jour le devis
    const updatedDevis = await prisma.devis.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: 'Devis mis à jour avec succès',
      data: updatedDevis,
    })
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour:', error)
    return NextResponse.json(
      { error: `Erreur: ${error.message}` },
      { status: 500 }
    )
  }
}

