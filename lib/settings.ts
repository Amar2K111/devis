/**
 * Gestion des paramètres de l'application
 */

export interface AppSettings {
  entreprise: {
    nom: string
    adresse: string
    codePostal: string
    ville: string
    telephone: string
    email: string
    siret: string
    tvaIntracommunautaire: string
  }
  devis: {
    tauxTVADefaut: number
    dureeValiditeDefaut: number
    prefixeNumero: string
    conditionsGenerales: string
    notesParDefaut: string
  }
  affichage: {
    formatDate: string
    devise: string
    langue: string
  }
}

const DEFAULT_SETTINGS: AppSettings = {
  entreprise: {
    nom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    telephone: '',
    email: '',
    siret: '',
    tvaIntracommunautaire: '',
  },
  devis: {
    tauxTVADefaut: 20.0,
    dureeValiditeDefaut: 30,
    prefixeNumero: 'DEV',
    conditionsGenerales: '',
    notesParDefaut: '',
  },
  affichage: {
    formatDate: 'fr-FR',
    devise: 'EUR',
    langue: 'fr',
  },
}

/**
 * Récupère les paramètres depuis localStorage
 * @returns Les paramètres sauvegardés ou les valeurs par défaut
 */
export function getSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }

  try {
    const saved = localStorage.getItem('appSettings')
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres:', error)
  }

  return DEFAULT_SETTINGS
}

/**
 * Récupère une section spécifique des paramètres
 */
export function getSettingSection<T extends keyof AppSettings>(section: T): AppSettings[T] {
  const settings = getSettings()
  return settings[section]
}

/**
 * Récupère une valeur spécifique des paramètres
 */
export function getSetting<T extends keyof AppSettings, K extends keyof AppSettings[T]>(
  section: T,
  key: K
): AppSettings[T][K] {
  const settings = getSettings()
  return settings[section][key]
}

