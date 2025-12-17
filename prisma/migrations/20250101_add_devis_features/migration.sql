-- Migration pour ajouter les nouveaux champs aux devis existants

-- 1. Ajouter les nouveaux champs avec des valeurs par défaut temporaires
ALTER TABLE "devis" 
  ADD COLUMN IF NOT EXISTS "numeroDevis" TEXT,
  ADD COLUMN IF NOT EXISTS "clientAdresse" TEXT,
  ADD COLUMN IF NOT EXISTS "clientTelephone" TEXT,
  ADD COLUMN IF NOT EXISTS "clientEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "clientSiret" TEXT,
  ADD COLUMN IF NOT EXISTS "dateValidite" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "dateDebutTravaux" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "montantHT" DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "tauxTVA" DOUBLE PRECISION DEFAULT 20.0,
  ADD COLUMN IF NOT EXISTS "montantTVA" DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "montantTTC" DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- 2. Migrer les données existantes
-- Si l'ancien champ "montant" existe, on le migre vers montantTTC
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='devis' AND column_name='montant') THEN
    -- Calculer les montants depuis l'ancien champ montant (considéré comme TTC)
    UPDATE "devis" 
    SET 
      "montantTTC" = COALESCE("montant", 0),
      "montantHT" = COALESCE("montant", 0) / 1.20,
      "montantTVA" = COALESCE("montant", 0) - (COALESCE("montant", 0) / 1.20),
      "tauxTVA" = 20.0,
      "updatedAt" = COALESCE("createdAt", CURRENT_TIMESTAMP)
    WHERE "montantTTC" = 0 OR "montantTTC" IS NULL;
  END IF;
END $$;

-- 3. Générer les numéros de devis pour les devis existants
DO $$
DECLARE
  devis_record RECORD;
  current_year TEXT;
  counter INTEGER := 1;
  new_numero TEXT;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  FOR devis_record IN 
    SELECT id, "createdAt" 
    FROM "devis" 
    WHERE "numeroDevis" IS NULL OR "numeroDevis" = ''
    ORDER BY "createdAt" ASC
  LOOP
    new_numero := 'DEV-' || current_year || '-' || LPAD(counter::TEXT, 3, '0');
    
    -- Vérifier que le numéro n'existe pas déjà
    WHILE EXISTS (SELECT 1 FROM "devis" WHERE "numeroDevis" = new_numero) LOOP
      counter := counter + 1;
      new_numero := 'DEV-' || current_year || '-' || LPAD(counter::TEXT, 3, '0');
    END LOOP;
    
    UPDATE "devis" 
    SET "numeroDevis" = new_numero 
    WHERE id = devis_record.id;
    
    counter := counter + 1;
  END LOOP;
END $$;

-- 4. Mettre à jour le statut par défaut si nécessaire
UPDATE "devis" 
SET "statut" = CASE 
  WHEN "statut" = 'en attente' THEN 'brouillon'
  WHEN "statut" = 'validé' THEN 'accepté'
  ELSE COALESCE("statut", 'brouillon')
END
WHERE "statut" IN ('en attente', 'validé') OR "statut" IS NULL;

-- 5. Rendre les champs obligatoires non-nullables
ALTER TABLE "devis" 
  ALTER COLUMN "numeroDevis" SET NOT NULL,
  ALTER COLUMN "montantHT" SET NOT NULL,
  ALTER COLUMN "tauxTVA" SET NOT NULL,
  ALTER COLUMN "montantTVA" SET NOT NULL,
  ALTER COLUMN "montantTTC" SET NOT NULL,
  ALTER COLUMN "updatedAt" SET NOT NULL,
  ALTER COLUMN "statut" SET DEFAULT 'brouillon';

-- 6. Créer l'index unique sur numeroDevis
CREATE UNIQUE INDEX IF NOT EXISTS "devis_numeroDevis_key" ON "devis"("numeroDevis");

-- 7. Créer la table ligne_devis si elle n'existe pas
CREATE TABLE IF NOT EXISTS "ligne_devis" (
  "id" TEXT NOT NULL,
  "devisId" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "quantite" DOUBLE PRECISION NOT NULL,
  "unite" TEXT NOT NULL DEFAULT 'unité',
  "prixUnitaire" DOUBLE PRECISION NOT NULL,
  "tauxTVA" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
  "montantHT" DOUBLE PRECISION NOT NULL,
  "montantTVA" DOUBLE PRECISION NOT NULL,
  "montantTTC" DOUBLE PRECISION NOT NULL,
  "ordre" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "ligne_devis_pkey" PRIMARY KEY ("id")
);

-- 8. Créer l'index et la foreign key pour ligne_devis
CREATE INDEX IF NOT EXISTS "ligne_devis_devisId_idx" ON "ligne_devis"("devisId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ligne_devis_devisId_fkey'
  ) THEN
    ALTER TABLE "ligne_devis" 
    ADD CONSTRAINT "ligne_devis_devisId_fkey" 
    FOREIGN KEY ("devisId") REFERENCES "devis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

