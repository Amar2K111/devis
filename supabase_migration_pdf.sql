-- Migration pour ajouter le stockage PDF aux devis
-- À exécuter dans Supabase SQL Editor

-- Ajouter les colonnes pour stocker le PDF original
ALTER TABLE "devis" 
ADD COLUMN IF NOT EXISTS "pdfOriginal" BYTEA,
ADD COLUMN IF NOT EXISTS "nomFichierPDF" TEXT;

-- Vérification : afficher les colonnes ajoutées
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'devis' 
AND column_name IN ('pdfOriginal', 'nomFichierPDF');

