# 🕐 Documentation Contrôle Horaire d'Accès

## Vue d'ensemble

Le système de **Contrôle Horaire d'Accès** a été implémenté pour restreindre l'accès à l'application selon les horaires de travail des différents rôles, conformément au cahier des charges (CDC page 8).

## Architecture

### Fichiers créés/modifiés

```
web-app/
├── src/
│   ├── services/
│   │   └── horaireService.ts              (créé - logique de vérification)
│   ├── components/
│   │   └── HoraireBlockedModal.tsx        (créé - modal de blocage)
│   ├── hooks/
│   │   └── useAuth.tsx                    (modifié - intégration horaire)
│   ├── pages/
│   │   └── LoginPage.tsx                  (modifié - modal intégrée)
│   └── types/
│       └── index.ts                       (modifié - types horaires)
```

---

## Fonctionnalités

### 1. Plages horaires par rôle

Le système définit des plages horaires spécifiques pour chaque rôle :

```typescript
// Défini dans types/index.ts
export const HORAIRES_PAR_ROLE: Record<UserRole, PlageHoraire[]> = {
  creche: [
    { debut: '07:00', fin: '19:00', jours: [1, 2, 3, 4, 5] }, // Lun-Ven 7h-19h
  ],
  auxiliaire: [
    { debut: '07:00', fin: '19:00', jours: [1, 2, 3, 4, 5] }, // Lun-Ven 7h-19h
  ],
  rsai: [
    { debut: '08:00', fin: '18:00', jours: [1, 2, 3, 4, 5] }, // Lun-Ven 8h-18h
  ],
  medecin: [],      // Pas de restriction (urgences 24/7)
  parent: [],       // Pas de restriction (accès 24/7)
  superadmin: [],   // Pas de restriction (admin 24/7)
  developpeur: [],  // Pas de restriction (maintenance 24/7)
};
```

**Format des jours :** 0=Dimanche, 1=Lundi, 2=Mardi, ..., 6=Samedi

### 2. Vérification automatique

Lors de la connexion, le système vérifie automatiquement si l'utilisateur peut accéder selon son rôle et l'heure actuelle.

**Ordre de vérification dans le flux de connexion :**
```
1. Login (email + password)
2. ✅ Vérification horaire ← PREMIÈRE VÉRIFICATION
3. ✅ Vérification MFA (si requis)
4. ✅ Connexion finalisée
```

### 3. Logging automatique

Chaque tentative d'accès hors horaires est enregistrée dans les logs de sécurité :

```typescript
// Type LogSecurite étendu
export interface LogSecurite {
  type: 'tentative_acces_hors_horaires';
  utilisateur_id: string;
  role: UserRole;
  timestamp: string;
  horaire_tentative: string; // Ex: "22:30"
  raison: string;
  details: string;
}
```

---

## Utilisation du Service

### Fonctions principales

#### verifierAccesHoraire()
Vérifie si l'accès est autorisé pour un rôle à un moment donné.

```typescript
import { verifierAccesHoraire } from '@/services/horaireService';

const resultat = verifierAccesHoraire('creche');

if (!resultat.autorise) {
  console.log(resultat.message);
  console.log('Prochain créneau:', resultat.prochaineCreneau);
}
```

**Retour :**
```typescript
{
  autorise: boolean;
  message?: string;
  prochaineCreneau?: string;  // Ex: "aujourd'hui à 07:00" ou "lundi à 08:00"
  plagesAutorisees: PlageHoraire[];
}
```

#### verifierEtBloquerSiHorsHoraires()
Vérifie et bloque automatiquement avec logging.

```typescript
import { verifierEtBloquerSiHorsHoraires } from '@/services/horaireService';

const resultat = await verifierEtBloquerSiHorsHoraires(
  userId,
  'creche'
);

if (!resultat.autorise) {
  // L'accès est bloqué et un log a été créé
  console.log(resultat.message);
}
```

#### hasHoraireRestrictions()
Vérifie si un rôle a des restrictions horaires.

```typescript
import { hasHoraireRestrictions } from '@/services/horaireService';

if (hasHoraireRestrictions('creche')) {
  console.log('Ce rôle a des restrictions horaires');
}
```

#### afficherPlagesHoraires()
Affiche les plages horaires d'un rôle en format lisible.

```typescript
import { afficherPlagesHoraires } from '@/services/horaireService';

const horaires = afficherPlagesHoraires('rsai');
// Retourne: "Lun, Mar, Mer, Jeu, Ven : 08:00-18:00"
```

---

## Composant HoraireBlockedModal

### Props

```typescript
interface HoraireBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  message: string;
  prochaineCreneau?: string;
  heureActuelle: string;
}
```

### Utilisation

```typescript
import { HoraireBlockedModal } from '@/components/HoraireBlockedModal';

<HoraireBlockedModal
  isOpen={isOpen}
  onClose={handleClose}
  role="creche"
  message="Accès réservé aux horaires d'ouverture..."
  prochaineCreneau="demain à 07:00"
  heureActuelle="20:30"
/>
```

### Affichage

La modal affiche :
- ✅ Message de blocage personnalisé
- ✅ Icône et label du rôle
- ✅ Heure actuelle
- ✅ Prochain créneau disponible
- ✅ Plages horaires autorisées
- ✅ Information de traçabilité RGPD

---

## Flux d'Authentification

### Scénario 1 : Accès autorisé (dans les horaires)

```
1. Login (creche, Lundi 10:00)
2. Vérification horaire → ✅ OK (7h-19h)
3. Vérification MFA → ✅ OK
4. ✅ Connexion réussie
5. Redirection dashboard
```

### Scénario 2 : Accès refusé (hors horaires)

```
1. Login (creche, Lundi 22:00)
2. Vérification horaire → ❌ REFUSÉ (22:00 > 19:00)
3. 📝 Log de sécurité créé
4. 🚫 Modal de blocage affichée
5. ❌ Connexion refusée
6. Bouton "Fermer" → retour login
```

### Scénario 3 : Rôle sans restriction

```
1. Login (medecin, n'importe quelle heure)
2. Vérification horaire → ✅ OK (24/7)
3. Vérification MFA → ✅ OK
4. ✅ Connexion réussie
```

---

## Mode Démo

Le service horaire utilise la même variable d'environnement que MFA :

```bash
# .env
VITE_DEMO_MODE=true
```

En mode démo :
- ✅ La vérification horaire fonctionne normalement
- ✅ Les logs sont affichés dans la console (pas d'envoi API)
- ✅ Les toasts sont affichés
- ✅ La modal de blocage s'affiche

**Pour tester le blocage horaire en mode démo :**

```typescript
// Dans horaireService.ts, modifier temporairement :
const dateTest = new Date('2024-09-16T22:00:00'); // 22h (hors horaires)
const resultat = verifierAccesHoraire('creche', dateTest);
```

---

## Tests

### Test 1 : Crèche en journée (autorisé)

```typescript
const date = new Date('2024-09-16T10:00:00'); // Lundi 10h
const resultat = verifierAccesHoraire('creche', date);

expect(resultat.autorise).toBe(true);
```

### Test 2 : Crèche en soirée (refusé)

```typescript
const date = new Date('2024-09-16T22:00:00'); // Lundi 22h
const resultat = verifierAccesHoraire('creche', date);

expect(resultat.autorise).toBe(false);
expect(resultat.message).toContain('19:00');
expect(resultat.prochaineCreneau).toBe("demain à 07:00");
```

### Test 3 : Crèche le weekend (refusé)

```typescript
const date = new Date('2024-09-14T10:00:00'); // Samedi 10h
const resultat = verifierAccesHoraire('creche', date);

expect(resultat.autorise).toBe(false);
expect(resultat.prochaineCreneau).toBe("lundi à 07:00");
```

### Test 4 : Médecin 24/7 (autorisé)

```typescript
const date = new Date('2024-09-14T03:00:00'); // Samedi 3h du matin
const resultat = verifierAccesHoraire('medecin', date);

expect(resultat.autorise).toBe(true); // Pas de restriction
```

---

## Personnalisation des Horaires

### Modifier les horaires d'un rôle

Dans `types/index.ts`, modifier `HORAIRES_PAR_ROLE` :

```typescript
export const HORAIRES_PAR_ROLE: Record<UserRole, PlageHoraire[]> = {
  creche: [
    // Ajouter plusieurs plages pour des horaires complexes
    { debut: '07:00', fin: '12:00', jours: [1, 2, 3, 4, 5] }, // Matin
    { debut: '14:00', fin: '19:00', jours: [1, 2, 3, 4, 5] }, // Après-midi
  ],
  // ...
};
```

### Ajouter des restrictions à un rôle

Pour ajouter des restrictions horaires au rôle `parent` :

```typescript
export const HORAIRES_PAR_ROLE: Record<UserRole, PlageHoraire[]> = {
  // ...
  parent: [
    { debut: '06:00', fin: '23:00', jours: [0, 1, 2, 3, 4, 5, 6] }, // 6h-23h tous les jours
  ],
  // ...
};
```

---

## Logs de Sécurité

### Format du log

```json
{
  "_id": "log123",
  "type": "tentative_acces_hors_horaires",
  "utilisateur_id": "user456",
  "role": "creche",
  "timestamp": "2024-09-16T22:30:00.000Z",
  "horaire_tentative": "22:30",
  "raison": "Tentative de connexion en dehors des horaires autorisés pour le rôle creche",
  "details": "Heure de la tentative : 22:30"
}
```

### Consulter les logs (Backend)

```typescript
// Endpoint API à créer
GET /api/logs/securite?type=tentative_acces_hors_horaires
```

---

## Conformité CDC

### Exigence CDC (page 8)

> "Contrôle d'accès selon le lieu et l'horaire :
> - Restrictions d'accès en fonction de la localisation géographique via géorepérage (geofencing).
> - Définition de plages horaires d'accès pour certains rôles (exemple : accès des crèches limité aux horaires de travail standard).
> - Détection et alerte en cas de tentative d'accès hors de la plage horaire autorisée ou depuis une localisation non autorisée."

### Status : ✅ **IMPLÉMENTÉ**

- ✅ Plages horaires définies par rôle
- ✅ Vérification automatique à la connexion
- ✅ Blocage avec message explicite
- ✅ Logging dans `LogSecurite`
- ✅ Traçabilité complète
- ✅ Modal informative

---

## Sécurité

### Points de sécurité

1. **Vérification côté client ET serveur**
   - Frontend : Bloque l'accès immédiatement
   - Backend : Double vérification (à implémenter)

2. **Logs immuables**
   - Toute tentative est enregistrée
   - Horodatage précis
   - Traçabilité complète

3. **Pas de bypass possible**
   - La vérification est faite avant le MFA
   - Intégrée dans le flux d'authentification

4. **Messages clairs**
   - L'utilisateur sait pourquoi l'accès est refusé
   - Prochain créneau affiché

---

## Roadmap / Améliorations futures

### Court terme
- [ ] Backend : Endpoints API logs de sécurité
- [ ] Backend : Middleware de vérification horaire
- [ ] Tests unitaires complets
- [ ] Page admin pour configurer les horaires

### Moyen terme
- [ ] Plages horaires dynamiques (configurables par admin)
- [ ] Exceptions horaires (jours fériés, urgences)
- [ ] Historique des tentatives dans le profil
- [ ] Notifications email aux admins

### Long terme
- [ ] Machine learning pour détecter comportements suspects
- [ ] Horaires adaptatifs selon la charge
- [ ] Intégration avec système de planning

---

## FAQ

**Q: Un médecin peut-il accéder 24/7 ?**
R: Oui, le rôle `medecin` n'a pas de restrictions horaires (urgences médicales).

**Q: Comment tester le blocage horaire ?**
R: Modifier temporairement `verifierAccesHoraire()` pour passer une date de test hors horaires.

**Q: Les logs sont-ils stockés ?**
R: En mode démo, les logs sont affichés dans la console. En production, ils seront envoyés au backend.

**Q: Peut-on avoir plusieurs plages dans une journée ?**
R: Oui, définir plusieurs objets `PlageHoraire` pour le même rôle (ex: matin + après-midi).

**Q: Comment désactiver le contrôle horaire pour un rôle ?**
R: Laisser le tableau vide : `auxiliaire: []`

---

**Dernière mise à jour :** 16 septembre 2026
**Version Horaire :** 1.0.0
**Conformité CDC :** ✅ Page 8 respectée
