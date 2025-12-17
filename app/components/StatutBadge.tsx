/**
 * Badge de statut style Airtable
 */

interface StatutBadgeProps {
  statut: string
  className?: string
}

export default function StatutBadge({ statut, className = '' }: StatutBadgeProps) {
  const getStatutStyle = (statut: string) => {
    const styles: Record<string, string> = {
      'brouillon': 'bg-gray-100 text-gray-700 border-gray-200',
      'envoyé': 'bg-blue-50 text-blue-700 border-blue-200',
      'accepté': 'bg-green-50 text-green-700 border-green-200',
      'refusé': 'bg-red-50 text-red-700 border-red-200',
      'en cours': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'terminé': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'annulé': 'bg-gray-100 text-gray-500 border-gray-200',
      // Anciens statuts pour compatibilité
      'en attente': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'validé': 'bg-green-50 text-green-700 border-green-200',
    }

    return styles[statut.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getStatutStyle(statut)} ${className}`}
    >
      {statut}
    </span>
  )
}

