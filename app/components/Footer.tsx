import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-300 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <span className="text-lg font-semibold text-gray-900">Devis Manager</span>
            </div>
            <p className="text-sm text-gray-600 max-w-md">
              Gestion simplifiée de vos devis de construction. Importez, consultez et suivez vos projets en un seul endroit.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Navigation</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/devis" className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Liste des Devis
                </Link>
              </li>
              <li>
                <Link href="/import" className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Importer
                </Link>
              </li>
            </ul>
          </div>

          {/* Additional Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Ressources</h3>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-gray-600">Documentation</span>
              </li>
              <li>
                <span className="text-sm text-gray-600">Support</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 border-t border-gray-300 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">© 2025 Devis Manager</p>
            <p className="text-sm text-gray-500">Gestion des devis simplifiée</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
