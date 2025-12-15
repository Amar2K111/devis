# Déploiement rapide sur Vercel

## 🚀 Déploiement en 5 minutes

### 1. Préparer votre base de données
- Créez un compte sur [Supabase](https://supabase.com) (gratuit)
- Créez un nouveau projet
- Allez dans **Settings** → **Database**
- Copiez la **Connection string** (URI)

### 2. Pousser sur GitHub
```bash
git init
git add .
git commit -m "Ready for deployment"
git remote add origin <votre-repo-github>
git push -u origin main
```

### 3. Déployer sur Vercel
1. Allez sur https://vercel.com/new
2. Connectez votre compte GitHub
3. Importez votre repository
4. **Configurez les variables d'environnement** :
   - `DATABASE_URL` : Collez votre Connection string Supabase
   - Ajoutez `?pgbouncer=true` à la fin de l'URL pour Supabase
5. Cliquez sur **Deploy**

### 4. Exécuter les migrations
Après le premier déploiement, dans le terminal Vercel ou en local :

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Lier le projet
vercel link

# Exécuter les migrations
npx prisma migrate deploy
```

Ou via le dashboard Vercel :
- Allez dans votre projet → **Settings** → **Environment Variables**
- Vérifiez que `DATABASE_URL` est bien configurée
- Redéployez le projet

## ✅ Votre app est en ligne !

Vercel vous donnera une URL comme : `https://votre-app.vercel.app`

## 📝 Notes importantes

- **DATABASE_URL** : Doit être au format PostgreSQL complet
- **Supabase** : Utilisez le pooler avec `?pgbouncer=true` pour de meilleures performances
- **Migrations** : Exécutez `prisma migrate deploy` après le premier déploiement
- **Variables d'environnement** : Ne jamais commit `.env` dans Git

## 🔧 Commandes utiles

```bash
# Voir les logs en temps réel
vercel logs

# Redéployer en production
vercel --prod

# Ouvrir le dashboard
vercel dashboard
```

