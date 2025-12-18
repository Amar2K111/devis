# 🏢 Architecture Multi-Tenant pour SaaS Multi-Entreprises

## Problématique

Pour un SaaS multi-entreprises, il faut **isoler les données** de chaque entreprise pour :
- Sécurité : une entreprise ne doit pas voir les données d'une autre
- Conformité : respect du RGPD et confidentialité
- Scalabilité : gérer la croissance

## Solutions d'Architecture Multi-Tenant

### Option 1 : Isolation par Organisation (Recommandé) ⭐

**Principe** : Une colonne `organisationId` sur chaque table pour isoler les données.

**Avantages** :
- ✅ Simple à implémenter
- ✅ Une seule base de données (coût réduit)
- ✅ Facile à maintenir
- ✅ Performance correcte avec des index

**Inconvénients** :
- ⚠️ Risque d'erreur si on oublie le filtre (mitigé par des middlewares)
- ⚠️ Toutes les données dans la même base

**Coût estimé** :
- Supabase Free : 500 MB, 2 projets max → **Gratuit** (pour commencer)
- Supabase Pro : $25/mois → 8 GB, illimité → **$25/mois**
- Vercel : Gratuit jusqu'à 100 GB bandwidth → **Gratuit** (pour commencer)
- **Total estimé pour débuter : GRATUIT** 🎉

### Option 2 : Base de données séparée par entreprise

**Principe** : Chaque entreprise a sa propre base de données.

**Avantages** :
- ✅ Isolation totale
- ✅ Facile à exporter/migrer une entreprise

**Inconvénients** :
- ❌ Coût élevé (une DB par entreprise)
- ❌ Complexe à gérer
- ❌ Migration difficile

**Coût estimé** :
- Supabase Pro : $25/mois par entreprise
- Pour 10 entreprises : **$250/mois** 💰
- Non recommandé pour un SaaS

### Option 3 : Schéma séparé par entreprise (PostgreSQL)

**Principe** : Un schéma PostgreSQL par entreprise dans la même base.

**Avantages** :
- ✅ Bonne isolation
- ✅ Une seule base de données

**Inconvénients** :
- ⚠️ Plus complexe à gérer
- ⚠️ Migrations plus difficiles

**Coût estimé** :
- Similaire à l'Option 1 : **$25/mois** (Supabase Pro)

## Recommandation : Option 1 (Isolation par Organisation)

### Architecture proposée

```
Organisation (Entreprise)
  ├── Utilisateurs (Users)
  │   └── Rôles (admin, membre, etc.)
  ├── Devis
  │   └── LigneDevis
  └── Clients
```

### Modèle de données

```prisma
model Organisation {
  id          String   @id @default(uuid())
  nom         String   // Nom de l'entreprise
  siret       String?  // SIRET
  adresse     String?
  email       String?
  telephone   String?
  plan        String   @default("free") // free, pro, enterprise
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  users       User[]
  devis       Devis[]
  clients     Client[]
}

model User {
  id             String        @id @default(uuid())
  email          String        @unique
  nom            String
  organisationId String
  role           String        @default("membre") // admin, membre
  createdAt      DateTime      @default(now())
  
  organisation   Organisation  @relation(fields: [organisationId], references: [id])
}

model Devis {
  // ... champs existants
  organisationId String
  organisation   Organisation @relation(fields: [organisationId], references: [id])
  
  @@index([organisationId]) // Important pour les performances
}
```

### Sécurité

1. **Middleware Prisma** : Filtre automatique par `organisationId`
2. **Middleware Next.js** : Vérifie l'appartenance à l'organisation
3. **Index sur `organisationId`** : Performance optimale

## Coûts détaillés

### Phase 1 : Démarrage (0-10 entreprises)

| Service | Plan | Coût/mois |
|---------|------|-----------|
| Supabase | Free | **$0** |
| Vercel | Hobby | **$0** |
| **Total** | | **$0/mois** 🎉 |

**Limites** :
- Supabase Free : 500 MB DB, 2 projets
- Vercel : 100 GB bandwidth/mois

### Phase 2 : Croissance (10-100 entreprises)

| Service | Plan | Coût/mois |
|---------|------|-----------|
| Supabase | Pro | **$25** |
| Vercel | Pro | **$20** |
| **Total** | | **$45/mois** 💰 |

**Limites** :
- Supabase Pro : 8 GB DB, illimité projets
- Vercel Pro : 1 TB bandwidth/mois

### Phase 3 : Scale (100+ entreprises)

| Service | Plan | Coût/mois |
|---------|------|-----------|
| Supabase | Team | **$599** |
| Vercel | Enterprise | **$20-40** |
| **Total** | | **$619-639/mois** 💰💰 |

## Estimation de stockage

Par entreprise (moyenne) :
- 800 devis/an × 50 KB (avec PDF) = 40 MB/an
- 200 clients = 0.5 MB
- **Total : ~40 MB/entreprise/an**

Avec Supabase Pro (8 GB) :
- **~200 entreprises** peuvent être stockées (1 an de données)
- Ou **~2 ans** pour 100 entreprises

Avec Supabase Team (50 GB) :
- **~1250 entreprises** (1 an de données)
- Ou **~12 ans** pour 100 entreprises

## Recommandation finale

**Commencer avec l'Option 1 (Isolation par Organisation)** :
- ✅ Gratuit au début
- ✅ Simple à implémenter
- ✅ Scalable jusqu'à 100+ entreprises
- ✅ Coût raisonnable ($45/mois pour 10-100 entreprises)

**Passer à l'Option 3 ou base séparée** seulement si :
- Plus de 1000 entreprises
- Besoin d'isolation réglementaire stricte
- Budget important

