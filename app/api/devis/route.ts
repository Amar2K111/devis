/**
 * API Route pour gérer les devis
 * GET /api/devis - Liste tous les devis avec filtres optionnels, tri et pagination
 * POST /api/devis - Crée un nouveau devis
 * DELETE /api/devis?id=xxx - Supprime un devis
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateNumeroDevis, calculateMontants } from '@/lib/devis'

// GET - Liste tous les devis avec filtres performants
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Paramètres de recherche et filtres
    const client = searchParams.get('client')
    const typeTravaux = searchParams.get('typeTravaux')
    const statut = searchParams.get('statut')
    const dateDebut = searchParams.get('dateDebut')
    const dateFin = searchParams.get('dateFin')
    const search = searchParams.get('search') // Recherche globale
    const montantMin = searchParams.get('montantMin')
    const montantMax = searchParams.get('montantMax')
    const materiaux = searchParams.get('materiaux')
    
    // Paramètres de tri et pagination
    const sortBy = searchParams.get('sortBy') || 'dateDevis'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')
    const skip = (page - 1) * pageSize

    // Construire les conditions de filtrage de manière combinée
    const whereConditions: any[] = []

    // Recherche globale (cherche dans plusieurs champs)
    if (search) {
      whereConditions.push({
        OR: [
          { numeroDevis: { contains: search, mode: 'insensitive' } },
          { client: { contains: search, mode: 'insensitive' } },
          { typeTravaux: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
          { materiaux: { contains: search, mode: 'insensitive' } },
        ]
      })
    }

    // Filtres spécifiques (s'appliquent en plus de la recherche globale si elle existe)
    // Si recherche globale active, on ignore les filtres client/typeTravaux spécifiques pour éviter les conflits
    if (client && !search) {
      whereConditions.push({ client: { contains: client, mode: 'insensitive' } })
    }

    if (typeTravaux && !search) {
      whereConditions.push({ typeTravaux: { contains: typeTravaux, mode: 'insensitive' } })
    }

    if (statut) {
      whereConditions.push({ statut: statut.toLowerCase() })
    }

    if (materiaux && !search) {
      whereConditions.push({ materiaux: { contains: materiaux, mode: 'insensitive' } })
    }

    // Filtres par date
    if (dateDebut || dateFin) {
      const dateFilter: any = {}
      if (dateDebut) {
        dateFilter.gte = new Date(dateDebut)
      }
      if (dateFin) {
        // Ajouter 23h59 pour inclure toute la journée
        const dateFinObj = new Date(dateFin)
        dateFinObj.setHours(23, 59, 59, 999)
        dateFilter.lte = dateFinObj
      }
      whereConditions.push({ dateDevis: dateFilter })
    }

    // Filtres par montant (utilise montantTTC)
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

    // Construire l'objet where final
    const where: any = whereConditions.length > 0 
      ? (whereConditions.length === 1 ? whereConditions[0] : { AND: whereConditions })
      : {}

    // Construire l'ordre de tri
    const orderBy: any = {}
    const validSortFields = ['dateDevis', 'montantTTC', 'montantHT', 'client', 'typeTravaux', 'statut', 'createdAt', 'numeroDevis']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'dateDevis'
    orderBy[sortField] = sortOrder === 'asc' ? 'asc' : 'desc'

    // Compter le total avant pagination
    const total = await prisma.devis.count({ where })

    // Récupérer les devis avec pagination et lignes
    const devis = await prisma.devis.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        lignes: {
          orderBy: { ordre: 'asc' },
        },
      },
    })

    return NextResponse.json({
      success: true,
      count: devis.length,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      data: devis,
    })
  } catch (error: any) {
    console.error('Erreur lors de la récupération des devis:', error)
    return NextResponse.json(
      { error: `Erreur lors de la récupération: ${error.message}` },
      { status: 500 }
    )
  }
}

// POST - Crée un nouveau devis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des champs obligatoires
    if (!body.client || !body.typeTravaux || !body.dateDevis) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants: client, typeTravaux, dateDevis' },
        { status: 400 }
      )
    }

    // Générer le numéro de devis
    const numeroDevis = await generateNumeroDevis()

    // Calculer les montants à partir des lignes si fournies
    let montantHT = 0
    let montantTVA = 0
    let montantTTC = 0
    let tauxTVA = body.tauxTVA || 20.0

    if (body.lignes && Array.isArray(body.lignes) && body.lignes.length > 0) {
      const montants = calculateMontants(body.lignes)
      montantHT = montants.montantHT
      montantTVA = montants.montantTVA
      montantTTC = montants.montantTTC
      // Utiliser le taux de TVA moyen si plusieurs lignes avec différents taux
      tauxTVA = body.tauxTVA || 20.0
    } else if (body.montantHT !== undefined) {
      // Si montantHT fourni directement (pour compatibilité)
      montantHT = parseFloat(body.montantHT)
      tauxTVA = body.tauxTVA || 20.0
      montantTVA = montantHT * (tauxTVA / 100)
      montantTTC = montantHT + montantTVA
    }

    // Validation du statut
    const statutsValides = ['brouillon', 'envoyé', 'accepté', 'refusé', 'en cours', 'terminé', 'annulé']
    const statut = body.statut || 'brouillon'
    if (!statutsValides.includes(statut.toLowerCase())) {
      return NextResponse.json(
        { error: `Statut invalide. Doit être l'un de: ${statutsValides.join(', ')}` },
        { status: 400 }
      )
    }

    // Créer le devis avec les lignes
    const devis = await prisma.devis.create({
      data: {
        numeroDevis,
        client: body.client,
        clientAdresse: body.clientAdresse || null,
        clientTelephone: body.clientTelephone || null,
        clientEmail: body.clientEmail || null,
        clientSiret: body.clientSiret || null,
        typeTravaux: body.typeTravaux,
        dateDevis: new Date(body.dateDevis),
        dateValidite: body.dateValidite ? new Date(body.dateValidite) : null,
        dateDebutTravaux: body.dateDebutTravaux ? new Date(body.dateDebutTravaux) : null,
        montantHT,
        tauxTVA,
        montantTVA,
        montantTTC,
        statut: statut.toLowerCase(),
        materiaux: body.materiaux || null,
        notes: body.notes || null,
        lignes: body.lignes && Array.isArray(body.lignes) ? {
          create: body.lignes.map((ligne: any, index: number) => {
            const ligneHT = ligne.quantite * ligne.prixUnitaire
            const ligneTVA = ligneHT * (ligne.tauxTVA / 100)
            const ligneTTC = ligneHT + ligneTVA
            return {
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
        } : undefined,
      },
      include: {
        lignes: {
          orderBy: { ordre: 'asc' },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Devis créé avec succès',
      data: devis,
    })
  } catch (error: any) {
    console.error('Erreur lors de la création:', error)
    return NextResponse.json(
      { error: `Erreur lors de la création: ${error.message}` },
      { status: 500 }
    )
  }
}

// DELETE - Supprime un devis
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID du devis requis' },
        { status: 400 }
      )
    }

    // Vérifier que le devis existe
    const devis = await prisma.devis.findUnique({
      where: { id },
    })

    if (!devis) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer le devis
    await prisma.devis.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Devis supprimé avec succès',
    })
  } catch (error: any) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json(
      { error: `Erreur lors de la suppression: ${error.message}` },
      { status: 500 }
    )
  }
}

