/**
 * API Route pour exporter un devis en PDF
 * GET /api/devis/[id]/export/pdf
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateDevisPDF } from '@/lib/pdf'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Récupérer le devis avec ses lignes
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

    // Générer le PDF
    const pdfBuffer = await generateDevisPDF(devis)

    // Convertir en Uint8Array pour NextResponse
    const pdfArray = pdfBuffer instanceof Buffer 
      ? new Uint8Array(pdfBuffer) 
      : pdfBuffer instanceof Uint8Array 
        ? pdfBuffer 
        : new Uint8Array(Buffer.from(pdfBuffer))

    // Retourner le PDF
    return new NextResponse(pdfArray, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="devis-${devis.numeroDevis}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('Erreur lors de l\'export PDF:', error)
    return NextResponse.json(
      { error: `Erreur lors de l'export PDF: ${error.message}` },
      { status: 500 }
    )
  }
}

