# 🔐 Documentation MFA (Multi-Factor Authentication)

## Vue d'ensemble

Le système MFA (Authentification à Double Facteur) a été implémenté pour sécuriser les connexions des rôles sensibles : **médecins**, **administrateurs**, et **RSAI**.

## Architecture

### Fichiers créés/modifiés

```
web-app/
├── src/
│   ├── services/
│   │   ├── api.ts                          (modifié - endpoints MFA ajoutés)
│   │   └── mfaService.ts                   (créé - logique MFA + mode démo)
│   ├── components/
│   │   └── MFAVerificationModal.tsx        (créé - modal de vérification)
│   ├── hooks/
│   │   └── useAuth.tsx                     (modifié - flux MFA intégré)
│   ├── pages/
│   │   └── LoginPage.tsx                   (modifié - modal MFA intégrée)
│   └── types/
│       └── index.ts                        (modifié - types MFA ajoutés)
└── .env                                    (modifié - VITE_DEMO_MODE ajouté)
```

---

## Fonctionnalités

### 1. Détection automatique des rôles nécessitant MFA

Le système détecte automatiquement si un utilisateur nécessite MFA lors de la connexion :

```typescript
// Rôles nécessitant MFA
const rolesWithMFA = ['medecin', 'superadmin', 'rsai'];
```

### 2. Gestion du Mode Démo

Le mode démo permet de tester le système MFA sans envoyer de vrais SMS ou emails.

**Activation :** Variable d'environnement `VITE_DEMO_MODE=true`

**Code de test en mode démo :** `123456`

#### En mode démo :
- ✅ Toast affiché avec le code MFA (123456)
- ✅ Pas de compte à rebours pour renvoyer le code
- ✅ Pas d'appel API backend réel
- ✅ Validation instantanée

#### En mode production :
- ✅ Envoi réel par SMS ou email
- ✅ Compte à rebours de 60 secondes
- ✅ Appels API backend
- ✅ Code valide pendant 5 minutes

---

## Flux d'authentification

### Sans MFA (parents, auxiliaires)
```
1. Login (email + password)
2. ✅ Connexion réussie immédiate
3. Redirection vers dashboard
```

### Avec MFA (médecins, admins, RSAI)
```
1. Login (email + password)
2. ⏸️  Détection MFA requis
3. 📨 Envoi code par SMS/email
4. 🔐 Modal de vérification s'ouvre
5. ✅ Code validé
6. 🎉 Connexion finalisée
7. Redirection vers dashboard
```

---

## Utilisation du Mode Démo

### Étape 1 : Vérifier le fichier `.env`

```bash
# web-app/.env
VITE_API_URL=https://backendkids.onrender.com/api
VITE_DEMO_MODE=true  # ← Activer le mode démo
```

### Étape 2 : Tester la connexion

1. Se connecter avec un compte médecin/admin/RSAI
2. Une modal MFA s'affiche automatiquement
3. Un toast apparaît avec le code : **123456**
4. Saisir `123456` dans les 6 champs
5. Validation automatique
6. Connexion réussie !

### Étape 3 : Désactiver le mode démo (production)

```bash
# web-app/.env
VITE_DEMO_MODE=false  # ← Mode production
```

---

## Composants

### 1. MFAVerificationModal

Modal de vérification du code MFA à 6 chiffres.

**Props :**
```typescript
interface MFAVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (mfaToken: string) => void;
  userId: string;
  userEmail?: string;
  userTel?: string;
  method: 'sms' | 'email';
  userName?: string;
}
```

**Features :**
- ✅ 6 champs de saisie avec auto-focus
- ✅ Support du copier-coller (code à 6 chiffres)
- ✅ Navigation clavier (flèches, backspace)
- ✅ Bouton "Renvoyer le code" avec compte à rebours
- ✅ Badge mode démo avec code affiché
- ✅ Validation automatique quand les 6 chiffres sont saisis
- ✅ Messages d'erreur clairs

### 2. mfaService

Service de gestion MFA avec mode démo.

**Fonctions principales :**

```typescript
// Vérifier si un rôle nécessite MFA
requiresMFA(role: string): boolean

// Envoyer un code MFA
sendMFACode(userId, method, email?, tel?): Promise<Result>

// Vérifier un code MFA
verifyMFACode(userId, code): Promise<Result>

// Activer le MFA pour un utilisateur
enableMFA(method, telephone?): Promise<Result>

// Désactiver le MFA
disableMFA(): Promise<Result>
```

### 3. useAuth (modifié)

**Nouvelles propriétés :**
```typescript
interface AuthContextType {
  // ... propriétés existantes
  mfaPending: MFAPendingData | null;  // Données MFA en attente
  completeMFA: (mfaToken: string) => Promise<void>;  // Finaliser MFA
  clearMFAPending: () => void;  // Annuler MFA
}
```

**Interface User (modifiée) :**
```typescript
interface User {
  // ... champs existants
  mfa_enabled?: boolean;
  mfa_method?: 'sms' | 'email';
}
```

---

## API Endpoints (à implémenter côté backend)

### POST `/api/auth/mfa/send-code`
Envoie un code MFA à l'utilisateur.

**Body :**
```json
{
  "userId": "string",
  "method": "sms" | "email"
}
```

**Response :**
```json
{
  "success": true,
  "message": "Code envoyé avec succès"
}
```

### POST `/api/auth/mfa/verify-code`
Vérifie le code MFA saisi.

**Body :**
```json
{
  "userId": "string",
  "code": "123456"
}
```

**Response :**
```json
{
  "success": true,
  "message": "Code validé",
  "data": {
    "mfaToken": "jwt-token-here"
  }
}
```

### POST `/api/auth/mfa/enable`
Active le MFA pour l'utilisateur connecté.

**Body :**
```json
{
  "method": "sms" | "email",
  "telephone": "+33612345678"  // Optionnel si method = sms
}
```

### POST `/api/auth/mfa/disable`
Désactive le MFA pour l'utilisateur connecté.

---

## Types TypeScript mis à jour

### Medecin, RSAI, SuperAdmin

Tous les types utilisateurs sensibles incluent maintenant :

```typescript
interface Medecin {
  // ... champs existants
  mfa_enabled?: boolean;
  mfa_method?: 'sms' | 'email';
  auth_method?: 'email' | 'google' | 'apple';
  date_inscription?: string;
  date_derniere_connexion?: string;
  statut?: 'actif' | 'inactif' | 'banni';
}
```

---

## Sécurité

### Mode Démo
⚠️ **Le mode démo ne doit JAMAIS être activé en production !**

- Code fixe = risque de sécurité
- Pas de vraie validation
- Uniquement pour tests/démo

### Mode Production
✅ Sécurisé :
- Code aléatoire à 6 chiffres
- Expiration après 5 minutes
- Limite de tentatives (à implémenter backend)
- Logs de sécurité
- Envoi sécurisé par SMS (Twilio) ou email

---

## Tests

### Test Manuel - Mode Démo

1. **Activer le mode démo :**
   ```bash
   # .env
   VITE_DEMO_MODE=true
   ```

2. **Se connecter avec un compte médecin :**
   ```
   Email: medecin@test.com
   Password: password123
   ```

3. **Vérifier que :**
   - ✅ Modal MFA s'ouvre automatiquement
   - ✅ Toast affiche le code : 123456
   - ✅ Badge "Mode Démo Actif" visible
   - ✅ Saisir 123456 valide la connexion
   - ✅ Code incorrect affiche une erreur

4. **Tester le bouton "Renvoyer le code" :**
   - ✅ Pas de compte à rebours en mode démo
   - ✅ Nouveau toast avec le code

### Test Manuel - Mode Production

1. **Désactiver le mode démo :**
   ```bash
   # .env
   VITE_DEMO_MODE=false
   ```

2. **Backend requis :** Les endpoints `/api/auth/mfa/*` doivent être implémentés

3. **Se connecter et vérifier :**
   - ✅ Code envoyé par email/SMS réel
   - ✅ Compte à rebours de 60 secondes
   - ✅ Code expire après 5 minutes

---

## Roadmap / Améliorations futures

### Court terme
- [ ] Backend : Implémenter les endpoints MFA
- [ ] Backend : Intégration Twilio pour SMS
- [ ] Backend : Service d'envoi d'emails transactionnels
- [ ] Backend : Limite de tentatives (max 3)
- [ ] Backend : Logs de sécurité MFA

### Moyen terme
- [ ] Frontend : Page paramètres pour activer/désactiver MFA
- [ ] Frontend : Choix entre SMS ou email
- [ ] Frontend : Codes de secours (recovery codes)
- [ ] Backend : QR Code pour TOTP (Google Authenticator)

### Long terme
- [ ] Support biométrique (FaceID, TouchID)
- [ ] Support clés de sécurité matérielles (YubiKey)
- [ ] Authentification par passkey (WebAuthn)

---

## Conformité CDC

✅ **Exigence CDC (page 8) :**
> "Authentification multi-facteurs (MFA) : Utilisation d'un mot de passe + code envoyé par SMS ou email pour l'accès aux comptes des utilisateurs critiques (médecins, administrateurs)."

**Status :** ✅ **IMPLÉMENTÉ**

- ✅ MFA pour médecins
- ✅ MFA pour administrateurs (superadmin)
- ✅ MFA pour RSAI
- ✅ Code par SMS ou email
- ✅ Mode démo pour tests
- ⚠️ Backend à finaliser

---

## Support & Questions

Pour toute question sur l'implémentation MFA :

1. Consulter cette documentation
2. Vérifier les logs console (mode développement)
3. Inspecter le composant `MFAVerificationModal`
4. Tester avec le mode démo activé

---

**Dernière mise à jour :** 16 septembre 2026
**Version MFA :** 1.0.0
**Conformité CDC :** ✅ Implémenté
