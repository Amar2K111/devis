# 🔧 Fix : Erreur de connexion à la base de données sur Vercel

## Problème
```
Can't reach database server at `db.xpmoizizxrkxiitrkgnx.supabase.co:5432`
```

## Solution : Utiliser Connection Pooling de Supabase

Pour Vercel (environnement serverless), Supabase nécessite l'utilisation de **Connection Pooling** au lieu d'une connexion directe.

### Étapes pour corriger

#### 1. Obtenir l'URL avec Connection Pooling

1. Allez sur votre projet Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Settings** > **Database**
4. Faites défiler jusqu'à **Connection string**
5. Sélectionnez **Connection pooling** (Mode: Transaction)
6. Copiez l'URL qui ressemble à :
   ```
   postgresql://postgres.xpmoizizxrkxiitrkgnx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
   
   **Note importante** : 
   - Le port est **6543** (pas 5432)
   - L'URL contient `pooler.supabase.com` (pas directement l'host de la DB)
   - Ajoutez `?pgbouncer=true` à la fin si ce n'est pas déjà inclus

#### 2. Mettre à jour la variable d'environnement sur Vercel

1. Allez sur votre projet Vercel : https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Settings** > **Environment Variables**
4. Trouvez `DATABASE_URL` ou créez-la si elle n'existe pas
5. Remplacez la valeur par l'URL avec connection pooling
6. Format complet :
   ```
   postgresql://postgres.xpmoizizxrkxiitrkgnx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
7. Sélectionnez tous les environnements : **Production**, **Preview**, **Development**
8. Cliquez sur **Save**

#### 3. Redéployer l'application

Après avoir mis à jour la variable d'environnement :

1. Allez dans **Deployments**
2. Cliquez sur les **3 points** du dernier déploiement
3. Sélectionnez **Redeploy**
4. Ou faites un nouveau commit et push (Vercel redéploiera automatiquement)

## Vérification

Après le redéploiement, testez à nouveau l'import d'un fichier. L'erreur de connexion devrait être résolue.

## Alternative : Vérifier les paramètres Supabase

Si le problème persiste :

1. Dans Supabase, allez dans **Settings** > **Database**
2. Vérifiez que **Connection pooling** est activé
3. Vérifiez que **Allow connections from any IP** est activé (ou ajoutez les IPs de Vercel)

## Format de l'URL complète

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[POOLER_HOST]:6543/postgres?pgbouncer=true
```

Exemple :
```
postgresql://postgres.xpmoizizxrkxiitrkgnx:VotreMotDePasse@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## ⚠️ Important

- **Ne jamais** commiter la `DATABASE_URL` dans le code
- Utilisez toujours les **Environment Variables** de Vercel
- Pour le développement local, utilisez un fichier `.env.local` (déjà dans `.gitignore`)

