-- Migration pour supprimer l'ancienne colonne "montant" si elle existe
-- Cette colonne a été remplacée par montantHT, montantTVA et montantTTC

DO $$
BEGIN
  -- Vérifier si la colonne "montant" existe et la supprimer
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'devis' 
    AND column_name = 'montant'
  ) THEN
    -- Supprimer la contrainte NOT NULL si elle existe
    ALTER TABLE "devis" ALTER COLUMN "montant" DROP NOT NULL;
    
    -- Supprimer la colonne
    ALTER TABLE "devis" DROP COLUMN "montant";
    
    RAISE NOTICE 'Colonne "montant" supprimée avec succès';
  ELSE
    RAISE NOTICE 'Colonne "montant" n''existe pas, aucune action nécessaire';
  END IF;
END $$;


