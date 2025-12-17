/**
 * API Route pour gérer un devis spécifique
 * GET /api/devis/[id] - Récupère un devis par son ID
 * PUT /api/devis/[id] - Met à jour un devis
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateMontants } from '@/lib/devis'

// GET - Récupère un devis par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const devis = await prisma.devis.findUnique({
      where: { id },
      include: {
        lignes: {
          orderBy: { ordre: 'asc' },
        },
      },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    if (body.clientAdresse !== undefined) updateData.clientAdresse = body.clientAdresse || null
    if (body.clientTelephone !== undefined) updateData.clientTelephone = body.clientTelephone || null
    if (body.clientEmail !== undefined) updateData.clientEmail = body.clientEmail || null
    if (body.clientSiret !== undefined) updateData.clientSiret = body.clientSiret || null
    if (body.typeTravaux !== undefined) updateData.typeTravaux = body.typeTravaux
    if (body.dateDevis !== undefined) updateData.dateDevis = new Date(body.dateDevis)
    if (body.dateValidite !== undefined) updateData.dateValidite = body.dateValidite ? new Date(body.dateValidite) : null
    if (body.dateDebutTravaux !== undefined) updateData.dateDebutTravaux = body.dateDebutTravaux ? new Date(body.dateDebutTravaux) : null
    if (body.tauxTVA !== undefined) updateData.tauxTVA = parseFloat(body.tauxTVA)
    if (body.statut !== undefined) {
      const statutsValides = ['brouillon', 'envoyé', 'accepté', 'refusé', 'en cours', 'terminé', 'annulé']
      const statutNormalized = body.statut.toLowerCase()
      if (!statutsValides.includes(statutNormalized)) {
        return NextResponse.json(
          { error: `Statut invalide. Doit être l'un de: ${statutsValides.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.statut = statutNormalized
    }
    if (body.materiaux !== undefined) updateData.materiaux = body.materiaux || null
    if (body.notes !== undefined) updateData.notes = body.notes || null

    // Si des lignes sont fournies, les mettre à jour
    if (body.lignes !== undefined && Array.isArray(body.lignes)) {
      // Supprimer les anciennes lignes
      await prisma.ligneDevis.deleteMany({
        where: { devisId: id },
      })

      // Créer les nouvelles lignes
      if (body.lignes.length > 0) {
        await prisma.ligneDevis.createMany({
          data: body.lignes.map((ligne: any, index: number) => {
            const ligneHT = ligne.quantite * ligne.prixUnitaire
            const ligneTVA = ligneHT * (ligne.tauxTVA / 100)
            const ligneTTC = ligneHT + ligneTVA
            return {
              devisId: id,
              description: ligne.description,
              quantite: parseFloat(ligne.quantite),
              unite: ligne.unite || 'unité',
              prixUnitaire: parseFloat(ligne.prixUnitaire),
              tauxTVA: ligne.tauxTVA || 20.0,
              montantHT: Math.round(ligneHT * 100) / 100,
              montantTVA: Math.round(ligneTVA * 100) / 100,
              montantTTC: Math.round(ligneTTC * 100) / 100,
              ordre: ligne.ordre !== undefined ? ligne.ordre : index,
            }
          }),
        })
      }

      // Recalculer les montants totaux
      const montants = calculateMontants(body.lignes)
      updateData.montantHT = montants.montantHT
      updateData.montantTVA = montants.montantTVA
      updateData.montantTTC = montants.montantTTC
    } else if (body.montantHT !== undefined) {
      // Si montantHT fourni directement
      const montantHT = parseFloat(body.montantHT)
      const tauxTVA = body.tauxTVA || updateData.tauxTVA || existingDevis.tauxTVA
      const montantTVA = montantHT * (tauxTVA / 100)
      const montantTTC = montantHT + montantTVA
      updateData.montantHT = montantHT
      updateData.montantTVA = montantTVA
      updateData.montantTTC = montantTTC
    }

    // Mettre à jour le devis
    const updatedDevis = await prisma.devis.update({
      where: { id },
      data: updateData,
      include: {
        lignes: {
          orderBy: { ordre: 'asc' },
        },
      },
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

