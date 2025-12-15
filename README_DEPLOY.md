# 🚀 Déploiement Vercel - Guide Rapide

## Étapes rapides

### 1️⃣ Préparer la base de données
- Créez un compte [Supabase](https://supabase.com)
- Créez un projet
- **Settings** → **Database** → Copiez la **Connection string**
- Format : `postgresql://postgres.xxx:[PASSWORD]@aws-0-xxx.pooler.supabase.com:6543/postgres?pgbouncer=true`

### 2️⃣ Pousser sur GitHub
```bash
git init
git add .
git commit -m "Ready for Vercel"
git remote add origin <votre-repo>
git push -u origin main
```

### 3️⃣ Déployer sur Vercel
1. https://vercel.com/new
2. Connectez GitHub
3. Importez votre repo
4. **Variables d'environnement** :
   - `DATABASE_URL` = Votre Connection string Supabase
5. **Deploy**

### 4️⃣ Migrations Prisma
Après le déploiement, exécutez :
```bash
npx prisma migrate deploy
```

Ou via Vercel CLI :
```bash
npm i -g vercel
vercel login
vercel link
npx prisma migrate deploy
```

## ✅ C'est tout !

Votre app sera disponible sur `https://votre-app.vercel.app`

