/**
 * Génération de PDF pour les devis avec Puppeteer
 */

import puppeteer from 'puppeteer'
import { Devis, LigneDevis } from '@prisma/client'

interface DevisWithLignes extends Devis {
  lignes: LigneDevis[]
}

/**
 * Génère le HTML pour un devis
 */
function generateDevisHTML(devis: DevisWithLignes): string {
  const formatDate = (date: string | Date | null) => {
    if (!date) return '-'
    const dateObj = date instanceof Date ? date : new Date(date)
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant)
  }

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Devis ${devis.numeroDevis}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #1f2937;
      padding: 40px;
      background: white;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #1f2937;
      padding-bottom: 20px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #1f2937;
    }
    .header .numero {
      font-size: 16px;
      color: #6b7280;
      font-weight: 500;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .info-item {
      margin-bottom: 8px;
    }
    .info-label {
      font-size: 10px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .info-value {
      font-size: 12px;
      color: #1f2937;
      font-weight: 500;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    thead {
      background-color: #f9fafb;
    }
    th {
      text-align: left;
      padding: 10px 8px;
      font-size: 10px;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 10px 8px;
      font-size: 11px;
      color: #1f2937;
      border-bottom: 1px solid #f3f4f6;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    tfoot {
      background-color: #f9fafb;
    }
    tfoot td {
      font-weight: 600;
      padding: 12px 8px;
      border-top: 2px solid #e5e7eb;
      border-bottom: none;
    }
    .total-row {
      font-size: 14px;
      font-weight: 700;
      color: #1f2937;
    }
    .notes {
      margin-top: 30px;
      padding: 15px;
      background-color: #f9fafb;
      border-left: 3px solid #1f2937;
      border-radius: 4px;
    }
    .notes-title {
      font-size: 11px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .notes-content {
      font-size: 11px;
      color: #1f2937;
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 9px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>DEVIS</h1>
    <div class="numero">N° ${devis.numeroDevis}</div>
  </div>

  <div class="section">
    <div class="section-title">CLIENT</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Nom</div>
        <div class="info-value">${devis.client}</div>
      </div>
      ${devis.clientAdresse ? `
      <div class="info-item">
        <div class="info-label">Adresse</div>
        <div class="info-value">${devis.clientAdresse}</div>
      </div>
      ` : ''}
      ${devis.clientTelephone ? `
      <div class="info-item">
        <div class="info-label">Téléphone</div>
        <div class="info-value">${devis.clientTelephone}</div>
      </div>
      ` : ''}
      ${devis.clientEmail ? `
      <div class="info-item">
        <div class="info-label">Email</div>
        <div class="info-value">${devis.clientEmail}</div>
      </div>
      ` : ''}
      ${devis.clientSiret ? `
      <div class="info-item">
        <div class="info-label">SIRET</div>
        <div class="info-value">${devis.clientSiret}</div>
      </div>
      ` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">INFORMATIONS</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Type de travaux</div>
        <div class="info-value">${devis.typeTravaux}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Date du devis</div>
        <div class="info-value">${formatDate(devis.dateDevis)}</div>
      </div>
      ${devis.dateValidite ? `
      <div class="info-item">
        <div class="info-label">Date de validité</div>
        <div class="info-value">${formatDate(devis.dateValidite)}</div>
      </div>
      ` : ''}
      ${devis.dateDebutTravaux ? `
      <div class="info-item">
        <div class="info-label">Date début travaux</div>
        <div class="info-value">${formatDate(devis.dateDebutTravaux)}</div>
      </div>
      ` : ''}
      <div class="info-item">
        <div class="info-label">Statut</div>
        <div class="info-value">${devis.statut}</div>
      </div>
    </div>
  </div>

  ${devis.lignes && devis.lignes.length > 0 ? `
  <div class="section">
    <div class="section-title">DÉTAIL DES PRESTATIONS</div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="text-right">Quantité</th>
          <th class="text-center">Unité</th>
          <th class="text-right">Prix unitaire</th>
          <th class="text-right">TVA</th>
          <th class="text-right">Total HT</th>
          <th class="text-right">Total TTC</th>
        </tr>
      </thead>
      <tbody>
        ${devis.lignes.map(ligne => `
        <tr>
          <td>${ligne.description}</td>
          <td class="text-right">${ligne.quantite}</td>
          <td class="text-center">${ligne.unite}</td>
          <td class="text-right">${formatMontant(ligne.prixUnitaire)}</td>
          <td class="text-right">${ligne.tauxTVA}%</td>
          <td class="text-right">${formatMontant(ligne.montantHT)}</td>
          <td class="text-right">${formatMontant(ligne.montantTTC)}</td>
        </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" class="text-right">Total HT:</td>
          <td class="text-right">${formatMontant(devis.montantHT)}</td>
          <td></td>
        </tr>
        <tr>
          <td colspan="5" class="text-right">TVA (${devis.tauxTVA}%):</td>
          <td class="text-right">${formatMontant(devis.montantTVA)}</td>
          <td></td>
        </tr>
        <tr class="total-row">
          <td colspan="5" class="text-right">Total TTC:</td>
          <td class="text-right">${formatMontant(devis.montantTTC)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  </div>
  ` : ''}

  ${devis.notes ? `
  <div class="notes">
    <div class="notes-title">Notes</div>
    <div class="notes-content">${devis.notes}</div>
  </div>
  ` : ''}

  ${devis.materiaux ? `
  <div class="notes">
    <div class="notes-title">Matériaux</div>
    <div class="notes-content">${devis.materiaux}</div>
  </div>
  ` : ''}

  <div class="footer">
    Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
  </div>
</body>
</html>
  `.trim()
}

/**
 * Génère un PDF pour un devis avec Puppeteer
 * @param devis - Le devis à exporter avec ses lignes
 * @returns Buffer du PDF
 */
export const generateDevisPDF = async (devis: DevisWithLignes): Promise<Buffer> => {
  let browser
  
  try {
    // Lancer Puppeteer avec configuration pour Vercel
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
    })
    
    const page = await browser.newPage()
    
    // Générer le HTML
    const html = generateDevisHTML(devis)
    
    // Charger le HTML
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    // Générer le PDF
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      printBackground: true,
    })
    
    await browser.close()
    
    return Buffer.from(pdf)
  } catch (error) {
    if (browser) {
      await browser.close()
    }
    throw error
  }
}

/**
 * Génère un PDF pour plusieurs devis
 * @param devis - Liste des devis à exporter
 * @returns Buffer du PDF
 */
export const generateDevisListPDF = async (devis: DevisWithLignes[]): Promise<Buffer> => {
  let browser
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    
    const page = await browser.newPage()
    
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      padding: 40px;
    }
    h1 {
      text-align: center;
      margin-bottom: 30px;
    }
    .devis-item {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
    }
    .devis-title {
      font-weight: 600;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <h1>LISTE DES DEVIS</h1>
  ${devis.map(d => `
    <div class="devis-item">
      <div class="devis-title">Devis ${d.numeroDevis}</div>
      <div>Client: ${d.client}</div>
      <div>Type: ${d.typeTravaux}</div>
      <div>Date: ${new Date(d.dateDevis).toLocaleDateString('fr-FR')}</div>
      <div>Montant TTC: ${d.montantTTC.toFixed(2)} €</div>
      <div>Statut: ${d.statut}</div>
    </div>
  `).join('')}
</body>
</html>
    `
    
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    })
    
    await browser.close()
    
    return Buffer.from(pdf)
  } catch (error) {
    if (browser) {
      await browser.close()
    }
    throw error
  }
}
