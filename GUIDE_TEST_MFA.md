# 🔐 Guide de Test - Authentification MFA

## 🎯 Résumé de l'implémentation

L'authentification à double facteur (MFA) a été **entièrement implémentée** pour le frontend avec un **mode démo** permettant de tester sans backend.

### ✅ Ce qui a été fait

1. **Types TypeScript mis à jour** (`types/index.ts`)
   - Ajout des champs MFA dans Medecin, RSAI, SuperAdmin
   - Nouveau type `AuthMethod` et `MFASettings`

2. **Service MFA créé** (`services/mfaService.ts`)
   - Gestion mode démo/production
   - Fonctions sendMFACode, verifyMFACode
   - Code démo fixe : `123456`

3. **Composant MFAVerificationModal** (`components/MFAVerificationModal.tsx`)
   - 6 champs de saisie avec auto-focus
   - Support copier-coller
   - Badge mode démo avec code affiché
   - Compte à rebours pour renvoyer le code (production uniquement)

4. **Hook useAuth modifié** (`hooks/useAuth.tsx`)
   - Détection automatique si MFA requis
   - Flux MFA intégré dans le login
   - Fonction completeMFA pour finaliser la connexion

5. **Page Login mise à jour** (`pages/LoginPage.tsx`)
   - Modal MFA qui s'ouvre automatiquement
   - Gestion de la validation MFA

6. **Variable d'environnement** (`.env`)
   - `VITE_DEMO_MODE=true` activé par défaut

7. **Documentation complète** (`MFA_DOCUMENTATION.md`)

---

## 🧪 Test du MFA en Mode Démo

### Étape 1 : Vérifier la configuration

Ouvrir le fichier `.env` et vérifier :
```bash
VITE_DEMO_MODE=true  # Doit être true pour le mode démo
```

### Étape 2 : Lancer l'application

```bash
cd web-app
npm install  # Si première fois
npm run dev
```

### Étape 3 : Se connecter avec un rôle nécessitant MFA

Les rôles suivants nécessitent MFA :
- ✅ **Médecin** (`medecin`)
- ✅ **Super Admin** (`superadmin`)
- ✅ **RSAI** (`rsai`)

**Utiliser les comptes de test :**

#### Option 1 : Super Admin
```
Email: superadmin@kidsmed.local
Password: Admin123!
```

#### Option 2 : RSAI
```
Email: rsai@demo.com
Password: rsai123
```

#### Option 3 : Médecin (si disponible)
```
Email: medecin@test.com
Password: password123
```

### Étape 4 : Validation du flux MFA

1. **Cliquer sur "Se connecter"**

2. **La modal MFA s'ouvre automatiquement** 🎉
   - Vous devriez voir un badge orange "Mode Démo Actif"
   - Un toast s'affiche avec le code : **123456**

3. **Saisir le code MFA**
   - Soit taper `123456` dans les 6 champs
   - Soit copier-coller `123456` (détection automatique)

4. **Validation automatique**
   - Le code est validé instantanément
   - Un toast vert "Connexion sécurisée établie !"
   - Redirection vers le dashboard

### Étape 5 : Tester les cas d'erreur

#### Test 1 : Code incorrect
- Saisir un code invalide (ex: `111111`)
- ❌ Message d'erreur : "Code incorrect"
- Les champs se vident automatiquement
- Focus revient sur le premier champ

#### Test 2 : Renvoyer le code
- Cliquer sur "Renvoyer le code"
- Un nouveau toast apparaît avec le code **123456**
- En mode démo, pas de compte à rebours

#### Test 3 : Annuler la connexion
- Cliquer sur la croix (X) en haut à droite
- Toast : "Connexion annulée"
- Retour à l'écran de login

---

## 📸 Ce que vous devriez voir

### 1. Modal MFA en Mode Démo
```
┌─────────────────────────────────────────┐
│ 🛡️ Vérification de sécurité        ✕   │
├─────────────────────────────────────────┤
│                                         │
│  ⚠️  Mode Démo Actif                   │
│  Code de test : 123456                  │
│                                         │
│  📧 Un code de vérification a été      │
│      envoyé à votre email              │
│                                         │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ │
│  │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 │ │
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ │
│                                         │
│  [ Renvoyer le code ]                  │
│                                         │
│  [     🛡️ Valider le code      ]      │
│                                         │
│  🔒 Connexion sécurisée - RGPD/HDS    │
│     Ce code est valide 5 minutes       │
└─────────────────────────────────────────┘
```

### 2. Toast avec le code
```
┌─────────────────────────────────────┐
│ 🔐 Mode Démo - MFA Simulé          │
│                                     │
│ Code de vérification : 123456       │
│ (Valide pour 5 minutes)             │
└─────────────────────────────────────┘
```

### 3. Toast de validation
```
┌─────────────────────────────────────┐
│ ✅ Code MFA validé                  │
│                                     │
│ Connexion sécurisée établie         │
└─────────────────────────────────────┘
```

---

## 🔄 Passer en Mode Production

### Étape 1 : Modifier le .env
```bash
# .env
VITE_DEMO_MODE=false  # Désactiver le mode démo
```

### Étape 2 : Implémenter les endpoints backend

Le backend doit implémenter les endpoints suivants :

```
POST /api/auth/mfa/send-code
POST /api/auth/mfa/verify-code
POST /api/auth/mfa/enable
POST /api/auth/mfa/disable
```

Voir `MFA_DOCUMENTATION.md` pour les détails complets.

### Étape 3 : Configurer l'envoi de SMS/Email

**SMS (recommandé) :**
- Intégrer Twilio
- Configurer les credentials dans le backend
- Format du SMS : "Votre code de vérification Kids'Med : 123456"

**Email :**
- Service SMTP transactionnel (SendGrid, AWS SES, etc.)
- Template email professionnel

---

## 🐛 Dépannage

### Problème : La modal MFA ne s'ouvre pas

**Solutions :**
1. Vérifier que le rôle nécessite MFA (médecin, superadmin, rsai)
2. Vérifier la console navigateur pour les erreurs
3. Vérifier que `VITE_DEMO_MODE=true` dans `.env`
4. Relancer le serveur de dev (`npm run dev`)

### Problème : Le code 123456 ne fonctionne pas

**Solutions :**
1. Vérifier que `VITE_DEMO_MODE=true` dans `.env`
2. Vider le cache navigateur (Ctrl+Shift+R)
3. Vérifier les logs console

### Problème : Toast ne s'affiche pas

**Solutions :**
1. Vérifier que le composant `Toaster` de Sonner est bien présent dans `App.tsx`
2. Installer la dépendance : `npm install sonner`

---

## 📊 Checklist de validation

- [ ] Le mode démo est activé (`VITE_DEMO_MODE=true`)
- [ ] La connexion avec superadmin ouvre la modal MFA
- [ ] Le toast affiche le code **123456**
- [ ] Le badge "Mode Démo Actif" est visible
- [ ] La saisie de **123456** valide la connexion
- [ ] Un code incorrect affiche une erreur
- [ ] Le bouton "Renvoyer le code" fonctionne
- [ ] Le bouton croix annule la connexion
- [ ] La redirection vers le dashboard fonctionne
- [ ] Les rôles parent/auxiliaire ne voient pas la modal MFA

---

## 📚 Ressources

- **Documentation complète :** `MFA_DOCUMENTATION.md`
- **Rapport de conformité :** `RAPPORT_CONFORMITE_DATAFUSE.md`
- **Code source MFA :**
  - Service : `src/services/mfaService.ts`
  - Modal : `src/components/MFAVerificationModal.tsx`
  - Hook : `src/hooks/useAuth.tsx`

---

## ✅ Prochaines étapes

1. **Tester le MFA en mode démo** (maintenant)
2. **Valider le flux utilisateur** avec l'équipe
3. **Implémenter les endpoints backend** (1-2 jours)
4. **Intégrer Twilio pour SMS** (1 jour)
5. **Tester en mode production** (1 jour)
6. **Déployer** 🚀

---

**Dernière mise à jour :** 16 septembre 2026
**Status :** ✅ Prêt pour les tests
**Mode :** 🧪 Démo activé

🎉 **Le MFA est maintenant opérationnel en mode démo !**
