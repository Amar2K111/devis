# 🔧 Appliquer les migrations Prisma sur Supabase

## Problème
```
The column `devis.pdfOriginal` does not exist in the current database.
```

## Solution : Appliquer la migration manuellement

### Méthode 1 : Via Supabase SQL Editor (Recommandé)

1. **Connectez-vous à Supabase**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Ouvrez le SQL Editor**
   - Dans le menu de gauche, cliquez sur **SQL Editor**
   - Cliquez sur **New query**

3. **Exécutez la migration pour ajouter les colonnes PDF**

Copiez et collez ce SQL dans l'éditeur :

```sql
-- Ajouter les colonnes pour stocker le PDF original
ALTER TABLE "devis" 
ADD COLUMN IF NOT EXISTS "pdfOriginal" BYTEA,
ADD COLUMN IF NOT EXISTS "nomFichierPDF" TEXT;
```

4. **Cliquez sur Run** (ou appuyez sur Ctrl+Enter)

5. **Vérifiez que les colonnes ont été ajoutées**

Exécutez cette requête pour vérifier :

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'devis' 
AND column_name IN ('pdfOriginal', 'nomFichierPDF');
```

Vous devriez voir les deux colonnes listées.

### Méthode 2 : Vérifier toutes les migrations

Si vous n'êtes pas sûr que toutes les migrations ont été appliquées, voici toutes les migrations à exécuter dans l'ordre :

#### Migration 1 : Structure de base (si pas déjà fait)
Vérifiez d'abord si les tables existent :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('devis', 'ligne_devis');
```

Si les tables n'existent pas, exécutez la migration complète depuis `prisma/migrations/20250101_add_devis_features/migration.sql`

#### Migration 2 : Ajouter les colonnes PDF (à faire maintenant)

```sql
ALTER TABLE "devis" 
ADD COLUMN IF NOT EXISTS "pdfOriginal" BYTEA,
ADD COLUMN IF NOT EXISTS "nomFichierPDF" TEXT;
```

### Après avoir appliqué la migration

1. **Redéployez sur Vercel** (optionnel, mais recommandé)
   - Allez dans Vercel > Deployments
   - Cliquez sur **Redeploy** du dernier déploiement

2. **Testez à nouveau l'import**
   - L'erreur devrait être résolue
   - Vous pouvez maintenant importer des PDF qui seront stockés dans la base de données

## Vérification rapide

Pour vérifier que tout est correct, exécutez cette requête dans Supabase SQL Editor :

```sql
-- Vérifier la structure de la table devis
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'devis'
ORDER BY ordinal_position;
```

Vous devriez voir `pdfOriginal` (type: bytea) et `nomFichierPDF` (type: text) dans la liste.

