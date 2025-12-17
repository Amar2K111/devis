/**
 * Utilitaires pour la gestion des devis
 */

import { prisma } from './prisma'

/**
 * Génère un numéro de devis unique et séquentiel
 * Format: DEV-YYYY-NNN (ex: DEV-2024-001)
 */
export async function generateNumeroDevis(): Promise<string> {
  const currentYear = new Date().getFullYear()
  const prefix = `DEV-${currentYear}-`

  // Trouver le dernier numéro de devis de l'année
  const lastDevis = await prisma.devis.findFirst({
    where: {
      numeroDevis: {
        startsWith: prefix,
      },
    },
    orderBy: {
      numeroDevis: 'desc',
    },
  })

  let nextNumber = 1

  if (lastDevis && lastDevis.numeroDevis) {
    // Extraire le numéro de la dernière référence
    const lastNumber = parseInt(lastDevis.numeroDevis.replace(prefix, ''))
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1
    }
  }

  // Formater avec des zéros à gauche (001, 002, etc.)
  const formattedNumber = nextNumber.toString().padStart(3, '0')
  return `${prefix}${formattedNumber}`
}

/**
 * Calcule les montants HT, TVA et TTC à partir des lignes
 */
export function calculateMontants(lignes: Array<{
  quantite: number
  prixUnitaire: number
  tauxTVA: number
}>) {
  let montantHT = 0
  let montantTVA = 0
  let montantTTC = 0

  lignes.forEach(ligne => {
    const ligneHT = ligne.quantite * ligne.prixUnitaire
    const ligneTVA = ligneHT * (ligne.tauxTVA / 100)
    const ligneTTC = ligneHT + ligneTVA

    montantHT += ligneHT
    montantTVA += ligneTVA
    montantTTC += ligneTTC
  })

  return {
    montantHT: Math.round(montantHT * 100) / 100,
    montantTVA: Math.round(montantTVA * 100) / 100,
    montantTTC: Math.round(montantTTC * 100) / 100,
  }
}

