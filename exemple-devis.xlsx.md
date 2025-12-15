# Exemple de fichier Excel pour l'import

Ce fichier décrit la structure d'un fichier Excel valide pour l'import de devis.

## Structure des colonnes

Créez un fichier Excel (.xlsx) avec les colonnes suivantes :

| client | typeTravaux | dateDevis | montant | statut | materiaux | notes |
|--------|-------------|-----------|---------|--------|-----------|-------|
| Dupont Jean | carrelage | 2024-01-15 | 2500 | en attente | Carrelage grès cérame | Travaux salle de bain |
| Martin Sophie | peinture | 2024-01-20 | 1200 | validé | Peinture acrylique | Chambre principale |
| Bernard Pierre | plomberie | 2024-01-25 | 3500 | en attente | Tuyaux PVC, robinets | Rénovation complète |
| Dubois Marie | carrelage | 2024-02-01 | 1800 | validé | Carrelage faïence | Cuisine |
| Leroy Thomas | peinture | 2024-02-05 | 950 | annulé | Peinture glycéro | Salon |

## Notes importantes

1. **Noms de colonnes** : Les noms sont insensibles à la casse et aux espaces
   - `client`, `Client`, `CLIENT` fonctionnent tous
   - `typeTravaux`, `Type Travaux`, `TYPE TRAVAUX` fonctionnent tous

2. **Dates** : Format accepté
   - `2024-01-15` (format ISO)
   - Format Excel standard (sera automatiquement converti)

3. **Montants** : Doivent être des nombres
   - `2500` ou `2500.50` fonctionnent

4. **Statuts** : Doivent être exactement
   - `en attente`
   - `validé`
   - `annulé`

5. **Colonnes optionnelles** : `materiaux` et `notes` peuvent être vides

## Créer le fichier Excel

1. Ouvrez Excel (ou Google Sheets, LibreOffice Calc)
2. Créez les colonnes dans la première ligne
3. Remplissez les données
4. Enregistrez au format `.xlsx` ou `.xls`
5. Importez via l'application

