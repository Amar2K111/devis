# 📦 Pousser sur GitHub - Instructions

## ✅ Git est initialisé et le code est commité !

## Étapes pour créer le dépôt et pousser :

### 1. Créer le dépôt sur GitHub

1. Allez sur **https://github.com/new**
2. Nom du repository : `devis-manager` (ou autre)
3. **NE cochez PAS** "Initialize with README"
4. Cliquez sur **"Create repository"**

### 2. Copier l'URL du repository

Vous obtiendrez une URL comme :
```
https://github.com/VOTRE-USERNAME/devis-manager.git
```

### 3. Exécuter ces commandes dans PowerShell

Ouvrez PowerShell dans le dossier du projet et exécutez :

```powershell
# Ajouter le remote (remplacez par votre URL)
git remote add origin https://github.com/VOTRE-USERNAME/devis-manager.git

# Renommer la branche en main
git branch -M main

# Pousser le code
git push -u origin main
```

**Remplacez `VOTRE-USERNAME` par votre nom d'utilisateur GitHub !**

## ✅ C'est fait !

Une fois poussé, vous pouvez déployer sur Vercel en important ce repository.

