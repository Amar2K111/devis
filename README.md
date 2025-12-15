# Application de Gestion des Devis

Application web professionnelle pour gérer les devis d'une entreprise de construction, développée avec Next.js, Prisma et PostgreSQL.

## 🚀 Technologies utilisées

- **Next.js 14** (App Router)
- **React 18**
- **PostgreSQL** (hébergé sur Supabase)
- **Prisma ORM**
- **xlsx** (import Excel)
- **TypeScript**

## 📋 Fonctionnalités

- ✅ Import de devis depuis un fichier Excel
- ✅ Liste et affichage de tous les devis
- ✅ Recherche et filtres avancés (client, type de travaux, date, statut)
- ✅ Suppression de devis
- ✅ Interface utilisateur moderne et intuitive

## 🛠️ Installation

### Prérequis

- Node.js 18+ installé
- Compte Supabase (ou autre base PostgreSQL)
- npm ou yarn

### Étapes d'installation

1. **Cloner ou télécharger le projet**

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer la base de données**

   Créez un fichier `.env` à la racine du projet :
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
   ```
   
   Pour Supabase :
   - Allez dans votre projet Supabase
   - Settings → Database
   - Copiez la "Connection string" (URI)
   - Remplacez `[YOUR-PASSWORD]` par votre mot de passe

4. **Générer le client Prisma**
   ```bash
   npm run prisma:generate
   ```

5. **Créer les tables en base de données**
   ```bash
   npm run prisma:migrate
   ```
   
   Lors de la première migration, Prisma vous demandera un nom. Utilisez par exemple : `init`

6. **Lancer l'application**
   ```bash
   npm run dev
   ```

7. **Ouvrir dans le navigateur**
   ```
   http://localhost:3000
   ```

## 📊 Format Excel pour l'import

Le fichier Excel doit contenir les colonnes suivantes (les noms sont insensibles à la casse) :

| Colonne | Obligatoire | Description |
|---------|-------------|-------------|
| `client` | ✅ | Nom du client |
| `typeTravaux` | ✅ | Type de travaux (ex: carrelage, peinture, plomberie) |
| `dateDevis` | ✅ | Date au format YYYY-MM-DD ou format Excel |
| `montant` | ✅ | Montant du devis (nombre) |
| `statut` | ✅ | Statut : `en attente`, `validé` ou `annulé` |
| `materiaux` | ❌ | Matériaux utilisés |
| `notes` | ❌ | Notes additionnelles |

### Exemple de fichier Excel

```
client          | typeTravaux | dateDevis   | montant | statut     | materiaux        | notes
----------------|-------------|-------------|---------|------------|------------------|------------------
Dupont Jean     | carrelage   | 2024-01-15  | 2500    | en attente | Carrelage grès   | Travaux salle de bain
Martin Sophie   | peinture    | 2024-01-20  | 1200    | validé     | Peinture acrylique | Chambre principale
```

## 🗂️ Structure du projet

```
devis-base-de-donée/
├── app/
│   ├── api/
│   │   └── devis/
│   │       ├── import/
│   │       │   └── route.ts      # API import Excel
│   │       ├── [id]/
│   │       │   └── route.ts      # API devis par ID (GET, PUT)
│   │       └── route.ts          # API liste et suppression (GET, DELETE)
│   ├── devis/
│   │   └── page.tsx              # Page liste des devis
│   ├── import/
│   │   └── page.tsx              # Page import Excel
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Page d'accueil
│   └── globals.css               # Styles globaux
├── lib/
│   └── prisma.ts                 # Client Prisma singleton
├── prisma/
│   └── schema.prisma             # Schéma de base de données
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## 🔌 API Routes

### POST `/api/devis/import`
Importe un fichier Excel et crée des devis.

**Body**: `FormData` avec un champ `file`

**Réponse**:
```json
{
  "success": true,
  "message": "5 devis créés avec succès",
  "count": 5
}
```

### GET `/api/devis`
Liste tous les devis avec filtres optionnels.

**Query parameters**:
- `search` : Recherche globale
- `client` : Filtrer par client
- `typeTravaux` : Filtrer par type de travaux
- `statut` : Filtrer par statut
- `dateDebut` : Date de début (YYYY-MM-DD)
- `dateFin` : Date de fin (YYYY-MM-DD)

**Réponse**:
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

### DELETE `/api/devis?id=xxx`
Supprime un devis par son ID.

**Réponse**:
```json
{
  "success": true,
  "message": "Devis supprimé avec succès"
}
```

### GET `/api/devis/[id]`
Récupère un devis par son ID.

### PUT `/api/devis/[id]`
Met à jour un devis.

**Body**:
```json
{
  "client": "Nouveau client",
  "montant": 3000,
  "statut": "validé",
  ...
}
```

## 🎨 Utilisation

1. **Importer des devis**
   - Allez sur la page "Importer Excel"
   - Sélectionnez votre fichier Excel
   - Cliquez sur "Importer"
   - Les devis seront créés en base de données

2. **Consulter les devis**
   - Allez sur la page "Liste des Devis"
   - Utilisez la barre de recherche pour rechercher
   - Utilisez les filtres pour affiner les résultats
   - Cliquez sur "Supprimer" pour supprimer un devis

## 🔧 Commandes disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start

# Générer le client Prisma
npm run prisma:generate

# Créer une migration
npm run prisma:migrate

# Ouvrir Prisma Studio (interface graphique pour la base)
npm run prisma:studio
```

## 📝 Modèle de données

Le modèle `Devis` contient les champs suivants :

- `id` : UUID (clé primaire)
- `client` : String
- `typeTravaux` : String
- `dateDevis` : DateTime
- `montant` : Float
- `statut` : String (en attente, validé, annulé)
- `materiaux` : String? (optionnel)
- `notes` : String? (optionnel)
- `createdAt` : DateTime (automatique)

## 🚧 Fonctionnalités futures (préparées)

- **Export PDF** : Structure prête pour l'ajout d'export PDF
- **Authentification** : Structure prête pour l'ajout d'authentification utilisateurs

## 🐛 Dépannage

### Erreur de connexion à la base de données
- Vérifiez que votre `DATABASE_URL` dans `.env` est correcte
- Vérifiez que votre base de données PostgreSQL est accessible
- Pour Supabase, vérifiez que le pooler est activé si nécessaire

### Erreur lors de l'import Excel
- Vérifiez que le fichier contient les colonnes obligatoires
- Vérifiez que les dates sont au bon format
- Vérifiez que les montants sont des nombres valides
- Vérifiez que les statuts sont : `en attente`, `validé` ou `annulé`

### Erreur Prisma
- Exécutez `npm run prisma:generate` pour régénérer le client
- Vérifiez que les migrations sont à jour : `npm run prisma:migrate`

## 📄 Licence

Ce projet est un exemple d'application de gestion de devis.

