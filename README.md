# Devis Manager

Application de gestion des devis pour entreprise de construction.

## Fonctionnalités

- 📋 Gestion complète des devis
- 📊 Tableau de bord avec statistiques
- 📥 Import Excel et PDF
- 🔍 Recherche et filtres avancés
- 📱 Interface responsive (desktop et mobile)

## Technologies

- **Next.js 15** - Framework React
- **Prisma** - ORM pour la base de données
- **PostgreSQL** - Base de données
- **Tailwind CSS** - Styling
- **TypeScript** - Typage statique

## Déploiement

### Prérequis

- Node.js 18+
- Base de données PostgreSQL
- Compte Vercel (ou autre plateforme)

### Variables d'environnement

Créez un fichier `.env` avec :

```env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

### Déploiement sur Vercel

1. **Installer Vercel CLI** (optionnel) :
```bash
npm i -g vercel
```

2. **Déployer** :
```bash
vercel
```

Ou connectez votre repository GitHub à Vercel depuis le dashboard.

### Configuration Vercel

Les variables d'environnement suivantes doivent être configurées dans Vercel :

- `DATABASE_URL` - URL de connexion PostgreSQL

### Commandes de build

Le projet utilise les commandes suivantes :

- `npm run build` - Génère Prisma Client et build Next.js
- `npm start` - Démarre le serveur de production

## Développement local

```bash
# Installer les dépendances
npm install

# Générer Prisma Client
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# Démarrer le serveur de développement
npm run dev
```

## Structure du projet

```
app/
  ├── api/          # Routes API
  ├── components/   # Composants React
  ├── devis/        # Pages devis
  ├── import/       # Page d'import
  └── page.tsx      # Page d'accueil

lib/
  ├── prisma.ts     # Client Prisma
  ├── devis.ts      # Utilitaires devis
  └── pdf.ts        # Utilitaires PDF

prisma/
  ├── schema.prisma # Schéma de base de données
  └── migrations/   # Migrations Prisma
```

