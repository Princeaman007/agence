# ============================================================================
# Script de nettoyage des secrets dans l'historique Git
# ============================================================================
# ATTENTION : Ce script réécrit l'historique Git. Utilisez avec précaution !
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
Write-Host "║  AVERTISSEMENT - NETTOYAGE DE L'HISTORIQUE GIT                ║" -ForegroundColor Red
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
Write-Host ""
Write-Host "Ce script va:" -ForegroundColor Yellow
Write-Host "  1. Supprimer le fichier backend/.env de TOUT l'historique Git" -ForegroundColor Yellow
Write-Host "  2. Réécrire TOUS les commits" -ForegroundColor Yellow
Write-Host "  3. Nécessiter un FORCE PUSH vers GitHub" -ForegroundColor Yellow
Write-Host ""
Write-Host "AVANT DE CONTINUER:" -ForegroundColor Cyan
Write-Host "  ✓ Assurez-vous d'avoir révoqué les mots de passe compromis" -ForegroundColor Cyan
Write-Host "  ✓ Créez une sauvegarde : git clone --mirror" -ForegroundColor Cyan
Write-Host "  ✓ Informez votre équipe du rebase à venir" -ForegroundColor Cyan
Write-Host ""

$confirmation = Read-Host "Voulez-vous continuer ? (tapez 'OUI JE SUIS SUR' pour continuer)"

if ($confirmation -ne "OUI JE SUIS SUR") {
    Write-Host "Opération annulée." -ForegroundColor Green
    exit 0
}

# Vérifier si git-filter-repo est installé
Write-Host "`n[1/5] Vérification des outils..." -ForegroundColor Cyan
$gitFilterRepo = Get-Command git-filter-repo -ErrorAction SilentlyContinue

if (-not $gitFilterRepo) {
    Write-Host "git-filter-repo n'est pas installé." -ForegroundColor Yellow
    Write-Host "Installation via pip..." -ForegroundColor Yellow
    
    try {
        pip install git-filter-repo
        Write-Host "✓ git-filter-repo installé avec succès" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Échec de l'installation de git-filter-repo" -ForegroundColor Red
        Write-Host "Installez-le manuellement : pip install git-filter-repo" -ForegroundColor Yellow
        exit 1
    }
}
else {
    Write-Host "✓ git-filter-repo est disponible" -ForegroundColor Green
}

# Créer une sauvegarde
Write-Host "`n[2/5] Création d'une sauvegarde..." -ForegroundColor Cyan
$backupPath = "../agence-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
try {
    git clone --mirror . "$backupPath"
    Write-Host "✓ Sauvegarde créée : $backupPath" -ForegroundColor Green
}
catch {
    Write-Host "✗ Échec de la création de sauvegarde" -ForegroundColor Red
    exit 1
}

# Nettoyer le fichier .env de l'historique
Write-Host "`n[3/5] Suppression de backend/.env de l'historique..." -ForegroundColor Cyan
try {
    git filter-repo --path backend/.env --invert-paths --force
    Write-Host "✓ backend/.env supprimé de l'historique" -ForegroundColor Green
}
catch {
    Write-Host "✗ Échec du nettoyage" -ForegroundColor Red
    Write-Host "Vous pouvez restaurer depuis : $backupPath" -ForegroundColor Yellow
    exit 1
}

# Ajouter le remote
Write-Host "`n[4/5] Reconfiguration du remote..." -ForegroundColor Cyan
git remote add origin https://github.com/Princeaman007/agence.git 2>$null

# Informations finales
Write-Host "`n[5/5] Nettoyage terminé !" -ForegroundColor Green
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  PROCHAINES ÉTAPES                                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "1. Vérifiez que backend/.env est toujours présent localement:" -ForegroundColor Yellow
Write-Host "   ls backend/.env" -ForegroundColor White
Write-Host ""
Write-Host "2. Poussez les changements (FORCE PUSH requis) :" -ForegroundColor Yellow
Write-Host "   git push origin --force --all" -ForegroundColor White
Write-Host "   git push origin --force --tags" -ForegroundColor White
Write-Host ""
Write-Host "3. Informez votre équipe de faire :" -ForegroundColor Yellow
Write-Host "   git fetch origin" -ForegroundColor White
Write-Host "   git reset --hard origin/main  # ou leur branche" -ForegroundColor White
Write-Host ""
Write-Host "4. Sur GitHub, allez dans Settings → Security → Secret scanning" -ForegroundColor Yellow
Write-Host "   et marquez l'alerte comme résolue une fois le push effectué." -ForegroundColor Yellow
Write-Host ""
Write-Host "Sauvegarde disponible dans : $backupPath" -ForegroundColor Cyan
