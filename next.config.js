/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuration pour Prisma et pdfjs-dist sur Vercel
  serverExternalPackages: ['@prisma/client', 'pdfjs-dist', 'puppeteer'],
  // Optimisations pour le build
  output: 'standalone',
  // Configuration pour éviter les erreurs DOM dans les packages serveur
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignorer les modules qui nécessitent des APIs DOM côté serveur
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        jsdom: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
