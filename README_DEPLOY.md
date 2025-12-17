# Guide de déploiement sur Vercel

## Prérequis

1. Un compte Vercel (gratuit) : [vercel.com](https://vercel.com)
2. Une base de données PostgreSQL (recommandé : [Supabase](https://supabase.com) gratuit ou [Neon](https://neon.tech))
3. Votre code sur GitHub/GitLab/Bitbucket

## Étapes de déploiement

### 1. Préparer votre repository

Assurez-vous que tous vos fichiers sont commités :

```bash
git add .
git commit -m "Préparation pour déploiement Vercel"
git push
```

### 2. Créer une base de données PostgreSQL

**Option A : Supabase (recommandé)**
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte et un nouveau projet
3. Dans **Settings > Database**, copiez l'URL de connexion
4. **IMPORTANT pour Vercel** : Utilisez **Connection pooling** (pas la connexion directe)
   - Sélectionnez **Connection pooling** (Mode: Transaction)
   - Port : **6543** (pas 5432)
   - Format : `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[POOLER_HOST]:6543/postgres?pgbouncer=true`
   - Exemple : `postgresql://postgres.xxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

**Option B : Neon**
1. Allez sur [neon.tech](https://neon.tech)
2. Créez un compte et un nouveau projet
3. Copiez l'URL de connexion

### 3. Déployer sur Vercel

**Méthode 1 : Via le site web (recommandé)**

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **Add New Project**
3. Importez votre repository GitHub/GitLab
4. Configurez le projet :
   - **Framework Preset** : Next.js (détecté automatiquement)
   - **Root Directory** : `./` (par défaut)
   - **Build Command** : `prisma generate && next build` (déjà dans vercel.json)
   - **Install Command** : `npm install` (déjà dans vercel.json)

5. **Variables d'environnement** :
   - Cliquez sur **Environment Variables**
   - Ajoutez : `DATABASE_URL` = votre URL de connexion PostgreSQL
   - Sélectionnez tous les environnements (Production, Preview, Development)

6. Cliquez sur **Deploy**

**Méthode 2 : Via Vercel CLI**

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer (première fois)
vercel

# Pour la production
vercel --prod
```

### 4. Appliquer les migrations Prisma

Après le premier déploiement, vous devez appliquer les migrations à votre base de données :

**Option A : Via Prisma Studio (local)**
```bash
# Dans votre projet local
npx prisma studio
# Puis créez les tables manuellement via l'interface
```

**Option B : Via la ligne de commande (recommandé)**
```bash
# Connectez-vous à votre base de données et exécutez :
npx prisma migrate deploy
```

**Option C : Via Supabase SQL Editor**
1. Allez dans Supabase > SQL Editor
2. Exécutez les migrations depuis `prisma/migrations/[nom_migration]/migration.sql`

### 5. Vérifier le déploiement

1. Vercel vous donnera une URL (ex: `votre-projet.vercel.app`)
2. Visitez l'URL pour vérifier que tout fonctionne
3. Testez l'import d'un devis

## Configuration importante

### Variables d'environnement dans Vercel

Dans **Settings > Environment Variables**, vous devez avoir :

```
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
```

### Build Command

Le fichier `vercel.json` contient déjà la bonne configuration :
- `prisma generate` : Génère le client Prisma
- `next build` : Build l'application Next.js

## Problèmes courants

### ❌ Erreur "Prisma Client not generated"

**Solution** : Vérifiez que `prisma generate` est dans le build command (déjà fait dans vercel.json)

### ❌ Erreur de connexion à la base de données

**Solution** : 
- Vérifiez que `DATABASE_URL` est correctement configurée dans Vercel
- **Pour Supabase** : Utilisez **Connection pooling** (port 6543) au lieu de la connexion directe (port 5432)
  - Allez dans Supabase > Settings > Database > Connection string
  - Sélectionnez **Connection pooling** (Mode: Transaction)
  - Copiez l'URL avec le port **6543** et ajoutez `?pgbouncer=true`
  - Voir le fichier `FIX_VERCEL_DATABASE.md` pour plus de détails
- Vérifiez que votre base de données accepte les connexions externes
- Redéployez l'application après avoir mis à jour la variable d'environnement

### ❌ Erreur "Migration not found"

**Solution** : 
- Assurez-vous que les migrations sont commitées dans le repository
- Appliquez les migrations manuellement (voir étape 4)

### ❌ Erreur avec pdf-parse

**Solution** : Le fichier `next.config.js` contient déjà la configuration nécessaire pour pdf-parse

## Mises à jour futures

Pour mettre à jour votre application :

1. Faites vos modifications localement
2. Commitez et pushez sur GitHub
3. Vercel déploiera automatiquement les changements

## Support

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Next.js](https://nextjs.org/docs)

