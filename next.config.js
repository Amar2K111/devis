/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuration pour Prisma et pdf-parse sur Vercel
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'pdf-parse'],
  },
  // Optimisations pour le build
  output: 'standalone',
}

module.exports = nextConfig
