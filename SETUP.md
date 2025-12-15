# Guide de configuration rapide

## Configuration de l'environnement

### 1. Créer le fichier `.env`

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Configuration Supabase

Si vous utilisez Supabase :

1. Créez un compte sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Allez dans **Settings** → **Database**
4. Copiez la **Connection string** (URI)
5. Remplacez `[YOUR-PASSWORD]` par le mot de passe de votre base de données
6. Collez la chaîne dans votre fichier `.env`

Exemple de chaîne Supabase :
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### 3. Installation et migration

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npm run prisma:generate

# Créer les tables en base de données
npm run prisma:migrate
```

Lors de la première migration, Prisma vous demandera un nom. Utilisez : `init`

### 4. Lancer l'application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Vérification

Pour vérifier que tout fonctionne :

1. Allez sur la page d'import Excel
2. Créez un fichier Excel de test avec les colonnes requises
3. Importez-le
4. Vérifiez que les devis apparaissent dans la liste

## Prisma Studio (optionnel)

Pour visualiser et gérer votre base de données via une interface graphique :

```bash
npm run prisma:studio
```

Cela ouvrira Prisma Studio sur [http://localhost:5555](http://localhost:5555)

## Dépannage

### Erreur "Can't reach database server"
- Vérifiez que votre `DATABASE_URL` est correcte
- Vérifiez que votre base de données est accessible
- Pour Supabase, vérifiez que le pooler est activé si nécessaire

### Erreur Prisma "Schema engine"
- Exécutez `npm run prisma:generate`
- Vérifiez que Prisma est bien installé : `npx prisma --version`

### Erreur lors de l'import Excel
- Vérifiez que le fichier contient les colonnes obligatoires
- Vérifiez que les dates sont au format valide
- Vérifiez que les montants sont des nombres

