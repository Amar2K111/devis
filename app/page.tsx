/**
 * Page d'accueil pour utilisateurs connectés
 * Redirige vers la liste des devis
 */

import { redirect } from 'next/navigation'

export default function Home() {
  // Rediriger vers la liste des devis pour les utilisateurs connectés
  redirect('/devis')
}
