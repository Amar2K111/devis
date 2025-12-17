/**
 * API Route pour télécharger le PDF original d'un devis
 * GET /api/devis/[id]/pdf
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Récupérer le devis avec le PDF
    const devis = await prisma.devis.findUnique({
      where: { id },
      select: {
        id: true,
        numeroDevis: true,
        pdfOriginal: true,
        nomFichierPDF: true,
      },
    })

    if (!devis) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      )
    }

    if (!devis.pdfOriginal) {
      return NextResponse.json(
        { error: 'Aucun PDF original disponible pour ce devis' },
        { status: 404 }
      )
    }

    // Convertir le Buffer en ArrayBuffer pour la réponse
    const pdfBuffer = Buffer.from(devis.pdfOriginal)
    const fileName = devis.nomFichierPDF || `devis-${devis.numeroDevis}.pdf`

    // Retourner le PDF avec les bons headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('Erreur lors de la récupération du PDF:', error)
    return NextResponse.json(
      { error: `Erreur lors de la récupération du PDF: ${error.message}` },
      { status: 500 }
    )
  }
}

