# Guide de déploiement sur Vercel

## Prérequis

1. Un compte Vercel (gratuit) : https://vercel.com
2. Une base de données PostgreSQL (Supabase recommandé)
3. Votre projet sur GitHub, GitLab ou Bitbucket

## Étapes de déploiement

### 1. Préparer votre base de données

Assurez-vous que votre base de données PostgreSQL est accessible depuis Internet (Supabase le fait automatiquement).

### 2. Pousser votre code sur Git

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <votre-repo-url>
git push -u origin main
```

### 3. Déployer sur Vercel

#### Option A : Via l'interface Vercel

1. Allez sur https://vercel.com/new
2. Connectez votre compte GitHub/GitLab/Bitbucket
3. Importez votre repository
4. Configurez les variables d'environnement :
   - `DATABASE_URL` : Votre URL de connexion PostgreSQL
   - `NEXT_PUBLIC_APP_URL` : L'URL de votre app (optionnel)
5. Cliquez sur "Deploy"

#### Option B : Via la CLI Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Ajouter les variables d'environnement
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_APP_URL
```

### 4. Configurer les variables d'environnement

Dans le dashboard Vercel de votre projet :

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez :
   - `DATABASE_URL` : Votre URL PostgreSQL complète
   - `NEXT_PUBLIC_APP_URL` : L'URL de votre app (ex: https://votre-app.vercel.app)

### 5. Exécuter les migrations Prisma

Après le premier déploiement, vous devez exécuter les migrations :

```bash
# Via Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy

# Ou via le dashboard Vercel → Settings → Environment Variables
# Puis redéployer
```

### 6. Vérifier le déploiement

Une fois déployé, Vercel vous donnera une URL. Visitez-la pour vérifier que tout fonctionne.

## Configuration de la base de données

### Avec Supabase

1. Créez un projet sur https://supabase.com
2. Allez dans **Settings** → **Database**
3. Copiez la **Connection string** (URI)
4. Remplacez `[YOUR-PASSWORD]` par votre mot de passe
5. Ajoutez `?pgbouncer=true` à la fin pour utiliser le pooler (recommandé)

Exemple :
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Commandes utiles

```bash
# Voir les logs
vercel logs

# Redéployer
vercel --prod

# Ouvrir le dashboard
vercel dashboard
```

## Dépannage

### Erreur "Can't reach database server"
- Vérifiez que votre `DATABASE_URL` est correcte
- Vérifiez que votre base de données accepte les connexions externes
- Pour Supabase, utilisez le pooler avec `?pgbouncer=true`

### Erreur Prisma "Schema engine"
- Vérifiez que `prisma generate` s'exécute dans le build
- Vérifiez que les migrations sont déployées

### Build échoue
- Vérifiez les logs dans Vercel Dashboard → Deployments
- Assurez-vous que toutes les dépendances sont dans `package.json`

