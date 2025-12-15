# Devis Manager

Application de gestion des devis pour entreprise de construction, développée avec Next.js, Prisma, PostgreSQL et Tailwind CSS.

## 🚀 Technologies

- **Next.js 14** (App Router)
- **React 18**
- **PostgreSQL** (via Prisma)
- **Prisma ORM**
- **Tailwind CSS**
- **TypeScript**

## ✨ Fonctionnalités

- ✅ Import de devis depuis Excel avec **drag & drop**
- ✅ Liste des devis avec recherche et filtres
- ✅ Tri par colonnes
- ✅ Pagination
- ✅ Design épuré et moderne

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Configurer la base de données
# Créez un fichier .env avec :
# DATABASE_URL="postgresql://user:password@host:port/database"

# Générer le client Prisma
npm run prisma:generate

# Créer les tables
npm run prisma:migrate

# Lancer l'application
npm run dev
```

## 🚀 Déploiement

### Sur Vercel

1. Poussez votre code sur GitHub
2. Allez sur https://vercel.com/new
3. Importez votre repository
4. Configurez `DATABASE_URL` dans les variables d'environnement
5. Déployez !

Voir `VERCEL_DEPLOY.md` pour plus de détails.

## 📝 Format Excel

Le fichier Excel doit contenir ces colonnes :
- `client` (obligatoire)
- `typeTravaux` (obligatoire)
- `dateDevis` (obligatoire, format YYYY-MM-DD)
- `montant` (obligatoire)
- `statut` (obligatoire : en attente, validé, annulé)
- `materiaux` (optionnel)
- `notes` (optionnel)
