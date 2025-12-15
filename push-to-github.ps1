# Script pour créer un dépôt GitHub et pousser le code

Write-Host "=== Création du dépôt GitHub ===" -ForegroundColor Green
Write-Host ""

# Vérifier si Git est initialisé
if (-not (Test-Path .git)) {
    Write-Host "Initialisation de Git..." -ForegroundColor Yellow
    git init
}

# Vérifier si des fichiers sont à committer
$status = git status --porcelain
if ($status) {
    Write-Host "Ajout des fichiers..." -ForegroundColor Yellow
    git add .
    git commit -m "Initial commit - Devis Manager avec Tailwind CSS"
}

Write-Host ""
Write-Host "=== Instructions pour créer le dépôt GitHub ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Allez sur https://github.com/new" -ForegroundColor White
Write-Host "2. Créez un nouveau repository (ex: devis-manager)" -ForegroundColor White
Write-Host "3. NE cochez PAS 'Initialize with README'" -ForegroundColor Yellow
Write-Host "4. Copiez l'URL du repository (ex: https://github.com/votre-username/devis-manager.git)" -ForegroundColor White
Write-Host ""
Write-Host "Ensuite, exécutez ces commandes :" -ForegroundColor Cyan
Write-Host ""
Write-Host '  git remote add origin https://github.com/votre-username/devis-manager.git' -ForegroundColor Green
Write-Host '  git branch -M main' -ForegroundColor Green
Write-Host '  git push -u origin main' -ForegroundColor Green
Write-Host ""
Write-Host "Ou entrez l'URL de votre repository maintenant :" -ForegroundColor Yellow
$repoUrl = Read-Host "URL du repository GitHub"

if ($repoUrl) {
    Write-Host ""
    Write-Host "Ajout du remote et push..." -ForegroundColor Yellow
    
    # Vérifier si remote existe déjà
    $existingRemote = git remote get-url origin 2>$null
    if ($existingRemote) {
        Write-Host "Remote 'origin' existe déjà. Voulez-vous le remplacer ? (O/N)" -ForegroundColor Yellow
        $replace = Read-Host
        if ($replace -eq "O" -or $replace -eq "o") {
            git remote set-url origin $repoUrl
        }
    } else {
        git remote add origin $repoUrl
    }
    
    git branch -M main
    git push -u origin main
    
    Write-Host ""
    Write-Host "✅ Code poussé sur GitHub avec succès !" -ForegroundColor Green
    Write-Host "Vous pouvez maintenant déployer sur Vercel : https://vercel.com/new" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Vous pouvez créer le dépôt manuellement plus tard." -ForegroundColor Yellow
}

