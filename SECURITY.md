# 🔒 Guide de Sécurité - Projet Agence

## ⚠️ INCIDENT DE SÉCURITÉ RÉSOLU

**Date**: 20 novembre 2025  
**Type**: Exposition d'identifiants SMTP dans le dépôt Git  
**Statut**: En cours de résolution

### Identifiants Compromis
- ❌ Email SMTP: `princeaman635@gmail.com`
- ❌ Mot de passe d'application Gmail
- ❌ URI MongoDB avec credentials
- ❌ Secrets JWT

---

## 🚨 ACTIONS IMMÉDIATES REQUISES

### 1️⃣ Révoquer les Identifiants Compromis (URGENT)

#### Gmail - Mot de passe d'application
```
1. Visitez: https://myaccount.google.com/security
2. Section "Connexion à Google" → "Mots de passe des applications"
3. SUPPRIMEZ le mot de passe: uczv csdz qaus yjor
4. Générez un NOUVEAU mot de passe d'application
5. Mettez à jour backend/.env avec le nouveau mot de passe
```

#### MongoDB Atlas
```
1. Connectez-vous à MongoDB Atlas
2. Database Access → Modifiez le mot de passe de l'utilisateur: amanprince005_db_user
3. Mettez à jour MONGO_URI dans backend/.env
```

#### JWT Secrets
```
1. Générez de nouveaux secrets:
   
   # PowerShell
   [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
   
2. Remplacez JWT_SECRET et REFRESH_TOKEN_SECRET dans backend/.env
3. ATTENTION: Cela invalidera toutes les sessions utilisateur actives
```

### 2️⃣ Nettoyer l'Historique Git

Les secrets sont encore présents dans l'historique Git sur GitHub. Pour les supprimer :

```powershell
# Exécutez le script de nettoyage
.\clean-git-secrets.ps1

# Suivez les instructions à l'écran
# ⚠️ ATTENTION: Cela réécrit l'historique et nécessite un force push
```

**Alternative manuelle** (si le script échoue):
```powershell
# Installer git-filter-repo
pip install git-filter-repo

# Créer une sauvegarde
git clone --mirror . ../agence-backup

# Supprimer backend/.env de l'historique
git filter-repo --path backend/.env --invert-paths --force

# Re-ajouter le remote
git remote add origin https://github.com/Princeaman007/agence.git

# Force push (⚠️ AVERTIR L'ÉQUIPE AVANT)
git push origin --force --all
git push origin --force --tags
```

### 3️⃣ Informer l'Équipe

Si d'autres développeurs travaillent sur le projet :

```powershell
# Chaque membre doit faire:
git fetch origin
git reset --hard origin/main  # ou leur branche de travail
```

### 4️⃣ Résoudre l'Alerte GitGuardian

1. Allez sur [GitGuardian Dashboard](https://dashboard.gitguardian.com)
2. Marquez l'incident comme **"Résolu - Credentials rotated"**
3. Ajoutez une note expliquant les actions prises

---

## ✅ PROTECTIONS MISES EN PLACE

### Pre-commit Hook
Un hook Git a été installé pour détecter automatiquement les secrets avant chaque commit.

**Test du hook:**
```powershell
# Créer un fichier de test avec un secret
echo "PASSWORD=secret123" > test-secret.txt
git add test-secret.txt
git commit -m "test"  # Devrait être BLOQUÉ

# Nettoyer
git reset HEAD test-secret.txt
rm test-secret.txt
```

**Contourner le hook** (NON RECOMMANDÉ):
```powershell
git commit --no-verify  # À utiliser seulement si absolument nécessaire
```

### .gitignore Amélioré
Le `.gitignore` a été renforcé pour bloquer:
- Tous les fichiers `.env` (sauf `.env.example`)
- Clés privées et certificats
- Dumps de base de données
- Fichiers de credentials

### Fichier .env.example
Un template sans valeurs réelles a été créé dans `backend/.env.example`

---

## 📋 BONNES PRATIQUES DE SÉCURITÉ

### ✅ À FAIRE

1. **Variables d'environnement**
   - Utilisez TOUJOURS des fichiers `.env` pour les secrets
   - Ne commitez JAMAIS de fichiers `.env`
   - Créez des fichiers `.env.example` avec des valeurs fictives

2. **Secrets forts**
   ```powershell
   # Générer un secret fort (32 bytes)
   [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
   ```

3. **Rotation régulière**
   - Changez les mots de passe tous les 3-6 mois
   - Rotation immédiate en cas de suspicion de compromission

4. **Authentification renforcée**
   - Activez 2FA sur tous les comptes (GitHub, Gmail, MongoDB Atlas, etc.)
   - Utilisez des mots de passe d'application spécifiques

5. **Vérification avant commit**
   ```powershell
   # Vérifiez ce que vous commitez
   git diff --cached
   
   # Listez les fichiers staged
   git status
   ```

### ❌ À NE JAMAIS FAIRE

- ❌ Commiter des fichiers `.env`
- ❌ Mettre des secrets en dur dans le code
- ❌ Partager des secrets via Slack/Discord/Email
- ❌ Utiliser le même mot de passe partout
- ❌ Pousser vers GitHub sans vérifier les fichiers
- ❌ Désactiver le pre-commit hook sans raison valable

---

## 🛠️ CONFIGURATION INITIALE POUR NOUVEAUX DÉVELOPPEURS

### 1. Cloner le dépôt
```powershell
git clone https://github.com/Princeaman007/agence.git
cd agence
```

### 2. Configurer l'environnement

**Backend:**
```powershell
cd backend
cp .env.example .env

# Éditez .env et remplissez avec VOS identifiants
# NE PARTAGEZ PAS ce fichier !
```

**Client:**
```powershell
cd client
npm install
```

### 3. Vérifier que le hook est actif
```powershell
# Le hook devrait déjà être dans .git/hooks/pre-commit
# S'il n'est pas exécutable:
# Linux/Mac: chmod +x .git/hooks/pre-commit
```

### 4. Obtenir les credentials

**Demandez à l'administrateur:**
- Accès MongoDB Atlas (créer un utilisateur unique)
- Configuration SMTP (chaque dev devrait avoir son propre compte de test)
- Secrets JWT (à partager de manière sécurisée, pas via Git)

---

## 🔍 AUDIT DE SÉCURITÉ

### Vérification régulière

```powershell
# Vérifier qu'aucun .env n'est suivi
git ls-files | Select-String "\.env$"

# Vérifier les secrets dans les fichiers trackés
.\scan-secrets.ps1  # Si disponible

# Audit des dépendances
npm audit
```

### Outils recommandés

- **GitGuardian**: Monitoring continu (déjà actif)
- **git-secrets**: Prévention locale des fuites
- **TruffleHog**: Scan de l'historique Git
- **GitHub Secret Scanning**: Activer dans Settings → Security

---

## 📞 EN CAS DE PROBLÈME

### Nouveau secret exposé
1. **STOP** - Ne pas faire de nouveaux commits
2. Révoquez immédiatement le secret compromis
3. Nettoyez l'historique Git avec `clean-git-secrets.ps1`
4. Informez l'équipe et l'administrateur

### Questions
Contactez l'administrateur du projet : **princeaman635@gmail.com**

---

## 📚 RESSOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Git Secret Management](https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

---

**Dernière mise à jour**: 20 novembre 2025  
**Version**: 1.0
