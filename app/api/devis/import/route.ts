/**
 * API Route pour importer un fichier Excel ou PDF et créer des devis
 * POST /api/devis/import
 * 
 * Accepte :
 * - Fichier Excel avec les colonnes : client, typeTravaux, dateDevis, montant, statut
 * - Fichier PDF au format devis structuré
 */

import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { prisma } from '@/lib/prisma'

// Polyfill pour DOMMatrix si nécessaire (pour éviter les erreurs sur Vercel)
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor(init?: string | number[]) {
      // Polyfill minimal pour DOMMatrix
    }
    static fromMatrix(other?: DOMMatrix) {
      return new DOMMatrix()
    }
  } as any
}

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

    // Vérifier le type de fichier
    const validExtensions = ['.xlsx', '.xls', '.csv', '.pdf']
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    
    if (!validExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Format de fichier non supporté. Utilisez .xlsx, .xls, .csv ou .pdf' },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    let data: any[] = []

    // Traiter selon le type de fichier
    if (fileExtension === '.pdf') {
      // Parser le PDF avec gestion d'erreur améliorée
      try {
        const pdfParseModule = await import('pdf-parse')
        const pdfParseFn = (pdfParseModule as any).default || pdfParseModule
        const pdfData = await pdfParseFn(Buffer.from(buffer), {
          // Options pour éviter les erreurs DOM
          max: 0, // Pas de limite de pages
        })
        const parsedData = parsePDFDevis(pdfData.text)
        if (!parsedData) {
          return NextResponse.json(
            { error: 'Impossible de parser le PDF. Vérifiez que c\'est un devis au format attendu.' },
            { status: 400 }
          )
        }
        data = [parsedData]
      } catch (pdfError: any) {
        console.error('Erreur lors du parsing PDF:', pdfError)
        return NextResponse.json(
          { error: `Erreur lors de l'import du PDF: ${pdfError.message || 'Erreur inconnue'}` },
          { status: 500 }
        )
      }
    } else {
      // Lire le fichier Excel
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      // Convertir en JSON
      data = XLSX.utils.sheet_to_json(worksheet)

      if (!Array.isArray(data) || data.length === 0) {
        return NextResponse.json(
          { error: 'Le fichier Excel est vide ou invalide' },
          { status: 400 }
        )
      }
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
        const statutsValides = ['brouillon', 'envoyé', 'accepté', 'refusé', 'en cours', 'terminé', 'annulé', 'en attente', 'validé']
        const statutNormalized = statut.toLowerCase()
        // Mapper les anciens statuts vers les nouveaux
        const statutMapping: Record<string, string> = {
          'en attente': 'brouillon',
          'validé': 'accepté',
        }
        const statutFinal = statutMapping[statutNormalized] || statutNormalized
        if (!statutsValides.includes(statutFinal)) {
          errors.push(`Ligne ${i + 2}: Statut invalide (doit être: ${statutsValides.join(', ')})`)
          continue
        }

        // Générer le numéro de devis
        const { generateNumeroDevis } = await import('@/lib/devis')
        const numeroDevis = await generateNumeroDevis()

        // Calculer les montants (si montant fourni, on le considère comme TTC)
        const montantTTC = parsedMontant
        const tauxTVA = parseFloat(rowNormalized['tauxtva'] || rowNormalized['tva'] || '20')
        const montantHT = montantTTC / (1 + tauxTVA / 100)
        const montantTVA = montantTTC - montantHT

        // Extraire les lignes si présentes (pour PDF)
        const lignesData = rowNormalized['lignes'] || []

        // Créer le devis
        const devisData: any = {
          numeroDevis,
          client,
          clientAdresse: rowNormalized['clientadresse']?.toString().trim() || null,
          clientTelephone: rowNormalized['clienttelephone']?.toString().trim() || null,
          clientEmail: rowNormalized['clientemail']?.toString().trim() || null,
          clientSiret: rowNormalized['clientsiret']?.toString().trim() || null,
          typeTravaux,
          dateDevis: parsedDate,
          dateValidite: rowNormalized['datevalidite'] ? new Date(rowNormalized['datevalidite']) : null,
          dateDebutTravaux: rowNormalized['datedebuttravaux'] ? new Date(rowNormalized['datedebuttravaux']) : null,
          montantHT: Math.round(montantHT * 100) / 100,
          tauxTVA,
          montantTVA: Math.round(montantTVA * 100) / 100,
          montantTTC: Math.round(montantTTC * 100) / 100,
          statut: statutFinal,
          materiaux: rowNormalized['materiaux']?.toString().trim() || null,
          notes: rowNormalized['notes']?.toString().trim() || null,
        }

        // Ajouter les informations entreprise dans les notes si présentes (depuis PDF)
        const infosEntreprise: string[] = []
        if (rowNormalized['entreprisenom']) infosEntreprise.push(`Entreprise: ${rowNormalized['entreprisenom']}`)
        if (rowNormalized['entrepriseadresse']) infosEntreprise.push(`Adresse: ${rowNormalized['entrepriseadresse']}`)
        if (rowNormalized['referenceaffaire']) infosEntreprise.push(`Réf. affaire: ${rowNormalized['referenceaffaire']}`)
        if (rowNormalized['affairesuiviepar']) infosEntreprise.push(`Suivi par: ${rowNormalized['affairesuiviepar']}`)
        if (rowNormalized['lieudevis']) infosEntreprise.push(`Lieu: ${rowNormalized['lieudevis']}`)
        
        if (infosEntreprise.length > 0) {
          devisData.notes = (devisData.notes ? devisData.notes + '\n\n' : '') + infosEntreprise.join('\n')
        }

        const createdDevis = await prisma.devis.create({
          data: {
            ...devisData,
            lignes: lignesData.length > 0 ? {
              create: lignesData.map((ligne: any) => ({
                description: ligne.description || '',
                quantite: ligne.quantite ?? 1,
                unite: ligne.unite || 'unité',
                prixUnitaire: ligne.prixUnitaire ?? 0,
                tauxTVA: ligne.tauxTVA ?? tauxTVA,
                montantHT: ligne.montantHT ?? 0,
                montantTVA: ligne.montantTVA ?? 0,
                montantTTC: ligne.montantTTC ?? 0,
                numeroLigne: ligne.numeroLigne || null,
                isSection: ligne.isSection || false,
                ordre: ligne.ordre ?? 0,
              }))
            } : undefined,
          },
        })

        devis.push(createdDevis)
        console.log(`✅ Devis créé: ${createdDevis.numeroDevis} - ${createdDevis.client}`)
      } catch (error: any) {
        console.error(`❌ Erreur ligne ${i + 2}:`, error)
        errors.push(`Ligne ${i + 2}: ${error.message || 'Erreur inconnue'}`)
        // Log détaillé pour debug
        if (error.code) {
          console.error(`Code erreur: ${error.code}`)
        }
        if (error.meta) {
          console.error(`Meta:`, error.meta)
        }
      }
    }

    console.log(`📊 Import terminé: ${devis.length} devis créés, ${errors.length} erreurs`)

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

/**
 * Parse un PDF de devis au format structuré
 */
function parsePDFDevis(text: string): any | null {
  try {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    
    // Extraire les informations de l'en-tête
    let entrepriseNom = ''
    let entrepriseAdresse = ''
    let referenceAffaire = ''
    let affaireSuiviePar = ''
    let lieuDevis = ''
    let dateDevis = ''
    let client = ''
    let montantHT = 0
    let montantTVA = 0
    let montantTTC = 0
    let tauxTVA = 20

    // Chercher la référence affaire
    const refMatch = text.match(/Référence Affaire\s*[:]\s*(.+)/i)
    if (refMatch) referenceAffaire = refMatch[1].trim()

    // Chercher "Affaire suivie par"
    const suiviMatch = text.match(/Affaire suivie par\s+(.+?)(?:\n|Affaire|DEVIS)/i)
    if (suiviMatch) affaireSuiviePar = suiviMatch[1].trim()

    // Chercher le lieu et la date (format: "JUGON LES LACS, le 14/03/2024")
    const lieuDateMatch = text.match(/([A-Z\s]+),\s*le\s+(\d{2}\/\d{2}\/\d{4})/i)
    if (lieuDateMatch) {
      lieuDevis = lieuDateMatch[1].trim()
      const dateStr = lieuDateMatch[2]
      // Convertir DD/MM/YYYY en Date
      const [day, month, year] = dateStr.split('/')
      dateDevis = `${year}-${month}-${day}`
    }

    // Chercher le nom de l'entreprise (première ligne, souvent en majuscules)
    const entrepriseLines = text.split('\n').slice(0, 5)
    for (let i = 0; i < entrepriseLines.length; i++) {
      const line = entrepriseLines[i].trim()
      // Chercher une ligne qui ressemble à un nom d'entreprise (majuscules, pas d'adresse)
      if (line && line.length > 2 && line.length < 50 && /^[A-Z\s\-]+$/.test(line) && !line.match(/\d/)) {
        entrepriseNom = line
        // La ligne suivante est souvent l'adresse
        if (i + 1 < entrepriseLines.length) {
          const nextLine = entrepriseLines[i + 1].trim()
          if (nextLine.match(/\d/)) {
            entrepriseAdresse = nextLine
          }
        }
        break
      }
    }

    // Chercher le client (dans "DEVIS" ou "Affaire")
    const devisMatch = text.match(/DEVIS\s+(.+?)(?:\n|Affaire|page)/i)
    if (devisMatch) {
      client = devisMatch[1].trim()
    } else {
      // Essayer de trouver dans "Affaire"
      const affaireMatch = text.match(/Affaire\s+(.+?)(?:\n|CIF|-)/i)
      if (affaireMatch) {
        client = affaireMatch[1].trim()
      }
    }
    
    // Si pas de client trouvé, utiliser la référence affaire
    if (!client && referenceAffaire) {
      client = referenceAffaire
    }

    // Chercher les totaux
    const totalHTMatch = text.match(/TOTAL\s+H\.T\.\s+[|]\s+[|]\s+[|]\s+[|]\s+([\d\s,\.]+)/i)
    if (totalHTMatch) {
      const montantStr = totalHTMatch[1].replace(/\s/g, '').replace(',', '.')
      montantHT = parseFloat(montantStr) || 0
    }

    const tvaMatch = text.match(/T\.V\.A\.\s+à\s+\([^)]+\)\s+([\d\s,\.]+)\s*%/i)
    if (tvaMatch) {
      const tvaStr = tvaMatch[1].replace(/\s/g, '').replace(',', '.')
      tauxTVA = parseFloat(tvaStr) || 20
    }

    const montantTVAMatch = text.match(/T\.V\.A\.\s+[^|]+\|\s+[|]\s+[|]\s+[|]\s+[|]\s+([\d\s,\.]+)/i)
    if (montantTVAMatch) {
      const tvaStr = montantTVAMatch[1].replace(/\s/g, '').replace(',', '.')
      montantTVA = parseFloat(tvaStr) || 0
    }

    const totalTTCMatch = text.match(/TOTAL\s+T\.T\.C\.\s+[|]\s+[|]\s+[|]\s+[|]\s+([\d\s,\.]+)/i)
    if (totalTTCMatch) {
      const ttcStr = totalTTCMatch[1].replace(/\s/g, '').replace(',', '.')
      montantTTC = parseFloat(ttcStr) || 0
    }

    // Si on n'a pas trouvé les montants, calculer depuis le total TTC
    if (montantTTC > 0 && montantHT === 0) {
      montantHT = montantTTC / (1 + tauxTVA / 100)
      montantTVA = montantTTC - montantHT
    }

    // Extraire les lignes du devis (tableau)
    const lignes: any[] = []
    const tableauStart = text.indexOf('|  N° | Désignation')
    if (tableauStart > -1) {
      const tableauText = text.substring(tableauStart)
      const tableauLines = tableauText.split('\n').filter(l => l.includes('|'))
      
      for (const line of tableauLines) {
        // Ignorer les lignes d'en-tête et de séparation
        if (line.includes('N° | Désignation') || line.match(/^[\s|\+\-]+$/)) continue
        
        const cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0)
        if (cells.length >= 6) {
          const numeroLigne = cells[0]
          const designation = cells[1]
          const unite = cells[2] || 'unité'
          const quantite = parseFloat(cells[3]?.replace(/\s/g, '').replace(',', '.') || '0')
          const prixUnitaire = parseFloat(cells[4]?.replace(/\s/g, '').replace(',', '.') || '0')
          const montantHTLigne = parseFloat(cells[5]?.replace(/\s/g, '').replace(',', '.') || '0')
          const tvaLigne = cells[6] || 'V1'

          // Ignorer les lignes de total
          if (numeroLigne.toLowerCase().includes('total') || designation.toLowerCase().includes('total')) continue
          if (!numeroLigne || numeroLigne === '') continue

          // Déterminer si c'est une section (pas de quantité/prix)
          const isSection = quantite === 0 && prixUnitaire === 0 && montantHTLigne === 0 && designation.length > 0

          if (designation && (isSection || quantite > 0)) {
            // Parser le taux TVA
            let tauxTVALigne = tauxTVA
            if (tvaLigne) {
              const tvaMatch = tvaLigne.match(/(\d+(?:[.,]\d+)?)/)
              if (tvaMatch) {
                tauxTVALigne = parseFloat(tvaMatch[1].replace(',', '.'))
              }
            }

            const montantHTFinal = isSection ? 0 : (montantHTLigne || quantite * prixUnitaire)
            const montantTVALigne = montantHTFinal * (tauxTVALigne / 100)
            const montantTTCLigne = montantHTFinal + montantTVALigne

            lignes.push({
              numeroLigne,
              description: designation,
              quantite: isSection ? null : quantite,
              unite: isSection ? null : unite,
              prixUnitaire: isSection ? null : prixUnitaire,
              tauxTVA: tauxTVALigne,
              montantHT: Math.round(montantHTFinal * 100) / 100,
              montantTVA: Math.round(montantTVALigne * 100) / 100,
              montantTTC: Math.round(montantTTCLigne * 100) / 100,
              isSection,
              ordre: lignes.length,
            })
          }
        }
      }
    }

    // Si on n'a pas trouvé de client, utiliser le nom de l'entreprise ou une valeur par défaut
    if (!client) {
      client = entrepriseNom || 'Client non spécifié'
    }

    // Si on n'a pas de date, utiliser aujourd'hui
    if (!dateDevis) {
      const today = new Date()
      dateDevis = today.toISOString().split('T')[0]
    }

    // Si on n'a pas de montant, essayer de le calculer depuis les lignes
    if (montantTTC === 0 && lignes.length > 0) {
      montantHT = lignes.reduce((sum, l) => sum + (l.montantHT || 0), 0)
      montantTVA = lignes.reduce((sum, l) => sum + (l.montantTVA || 0), 0)
      montantTTC = montantHT + montantTVA
    }

    if (!client || montantTTC === 0) {
      return null
    }

    return {
      client,
      typeTravaux: 'Construction', // Par défaut, peut être extrait du PDF si présent
      dateDevis,
      montant: montantTTC,
      statut: 'brouillon',
      entrepriseNom: entrepriseNom || null,
      entrepriseAdresse: entrepriseAdresse || null,
      referenceAffaire: referenceAffaire || null,
      affaireSuiviePar: affaireSuiviePar || null,
      lieuDevis: lieuDevis || null,
      tauxTVA,
      lignes,
    }
  } catch (error) {
    console.error('Erreur lors du parsing PDF:', error)
    return null
  }
}

