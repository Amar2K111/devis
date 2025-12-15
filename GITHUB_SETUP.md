# 🚀 Créer le dépôt GitHub et pousser le code

## ✅ Git est déjà initialisé et le commit est fait !

## Étapes pour créer le dépôt GitHub :

### Option 1 : Via le script PowerShell (recommandé)

Exécutez dans PowerShell :
```powershell
.\push-to-github.ps1
```

Le script vous guidera étape par étape.

### Option 2 : Manuellement

1. **Créez le dépôt sur GitHub** :
   - Allez sur https://github.com/new
   - Nom du repository : `devis-manager` (ou autre nom)
   - **NE cochez PAS** "Initialize with README"
   - Cliquez sur "Create repository"

2. **Poussez le code** :
   ```bash
   git remote add origin https://github.com/VOTRE-USERNAME/devis-manager.git
   git branch -M main
   git push -u origin main
   ```

   Remplacez `VOTRE-USERNAME` par votre nom d'utilisateur GitHub.

## ✅ Une fois poussé sur GitHub

Vous pouvez déployer sur Vercel :
1. Allez sur https://vercel.com/new
2. Importez votre repository GitHub
3. Configurez `DATABASE_URL`
4. Déployez !

