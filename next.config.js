/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuration pour Prisma et pdf-parse sur Vercel
  serverExternalPackages: ['@prisma/client', 'pdf-parse'],
  // Optimisations pour le build
  output: 'standalone',
}

module.exports = nextConfig
