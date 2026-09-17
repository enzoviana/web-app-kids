# Guide de Test - DiagnosticIAPage

## Prérequis

1. Le backend doit être démarré sur `https://backendkids.onrender.com`
2. Un utilisateur médecin ou RSAI doit être connecté
3. L'établissement `test-creche-001` doit exister avec des enfants

## Configuration

### Variables d'environnement
```
VITE_API_URL=https://backendkids.onrender.com/api
```

### ID d'établissement par défaut
```typescript
const DEFAULT_ETABLISSEMENT_ID = 'test-creche-001';
```

## Scénarios de test

### 1. Test de chargement initial

**Étapes:**
1. Naviguer vers `/medecin/diagnostic-ia`
2. Vérifier que le loader s'affiche brièvement
3. Vérifier que la liste des enfants se charge

**Résultat attendu:**
- ✅ Un loader avec icône IoPulseOutline s'affiche
- ✅ La liste des enfants (max 8) s'affiche dans la sidebar
- ✅ Le premier enfant est sélectionné par défaut
- ✅ Les statistiques s'affichent dans le header
- ✅ Le chat IA affiche le message d'accueil

**En cas d'erreur:**
- ❌ Message d'erreur avec icône IoAlertCircleOutline
- ❌ Bouton "Réessayer" disponible

### 2. Test de sélection d'enfant

**Étapes:**
1. Cliquer sur différents enfants dans la liste
2. Observer les changements dans la fiche patient

**Résultat attendu:**
- ✅ L'enfant sélectionné est surligné en bleu (bg-sky-50)
- ✅ La fiche patient se met à jour avec:
  - Groupe sanguin
  - PAI actif ou non
  - Statut des vaccins
  - Allergies
- ✅ Le placeholder du chat change avec le prénom de l'enfant
- ✅ Les diagnostics de l'enfant se chargent

### 3. Test de création de diagnostic

**Étapes:**
1. Sélectionner un enfant
2. Saisir un symptôme dans le textarea (ex: "Fièvre de 38.5°C depuis ce matin")
3. Appuyer sur Entrée ou cliquer sur le bouton Envoyer

**Résultat attendu:**
- ✅ Le message utilisateur s'affiche immédiatement
- ✅ Un loader "Analyse des bases de données médicales en cours..." s'affiche
- ✅ Après ~1.4s, la réponse de l'IA s'affiche avec:
  - Badge "Niveau de vigilance recommandé : Moyen"
  - Analyse clinique personnalisée
  - ID du diagnostic enregistré
- ✅ Le compteur d'historique s'incrémente
- ✅ Les statistiques se mettent à jour

**Appel API:**
```
POST /api/diagnostics
Body: {
  enfantId: "...",
  medecinId: "...",
  symptomes: "...",
  niveauUrgence: "vigilance",
  recommandations: "En cours d'analyse..."
}
```

### 4. Test des prompts rapides

**Étapes:**
1. Cliquer sur "+ Fièvre > 38.5°C"
2. Observer le message envoyé automatiquement

**Résultat attendu:**
- ✅ Le texte pré-rempli est envoyé: "Hyperthermie récente (>38.5°C) depuis 2h chez [Prénom]."
- ✅ Le diagnostic est créé comme dans le test 3

**Autres prompts:**
- "+ Éruption Cutanée"
- "+ Gêne Respiratoire"

### 5. Test d'affichage de l'historique

**Étapes:**
1. Créer 2-3 diagnostics
2. Cliquer sur "Historique (X)"
3. Vérifier l'affichage

**Résultat attendu:**
- ✅ Une section "Historique Diagnostics" s'affiche dans la sidebar
- ✅ Les 5 derniers diagnostics sont affichés avec:
  - Badge de niveau d'urgence (routine/vigilance/urgence)
  - Date de création
  - Symptômes (tronqués à 2 lignes)
- ✅ La section est scrollable si plus de 5 diagnostics

### 6. Test de gestion d'erreur réseau

**Étapes:**
1. Arrêter le backend
2. Essayer de créer un diagnostic
3. Redémarrer le backend

**Résultat attendu:**
- ✅ Message d'erreur dans le chat: "**Erreur:** [message d'erreur]"
- ✅ Le message utilisateur reste affiché
- ✅ Le loader disparaît
- ✅ L'utilisateur peut réessayer

### 7. Test sans enfants

**Étapes:**
1. Utiliser un établissement sans enfants
2. Naviguer vers la page

**Résultat attendu:**
- ✅ Message "Aucun enfant trouvé"
- ✅ Icône IoPersonOutline affichée
- ✅ Message explicatif

### 8. Test de chargement des statistiques

**Étapes:**
1. Vérifier le header après chargement initial
2. Créer quelques diagnostics
3. Observer la mise à jour

**Résultat attendu:**
- ✅ Badge "Stats: X diagnostics" affiché
- ✅ Le compteur se met à jour après chaque création
- ✅ Les stats incluent total et par niveau d'urgence

## Points de vérification technique

### Console du navigateur
```javascript
// Logs attendus
✅ Connexion réussie: { id: "...", email: "...", role: "medecin" }

// Logs de debug (optionnels)
console.log('Enfants chargés:', enfants.length);
console.log('Diagnostics chargés:', diagnostics.length);
console.log('Stats:', stats);
```

### Appels réseau (DevTools > Network)
```
✅ GET /api/enfants/etablissement/test-creche-001 → 200
✅ GET /api/diagnostics/stats/test-creche-001 → 200
✅ GET /api/diagnostics/enfant/{enfantId} → 200
✅ POST /api/diagnostics → 201
✅ DELETE /api/diagnostics/{id} → 200 (si implémenté)
```

### États React (React DevTools)
```
DiagnosticIAPage
  ├─ user: { id, email, role, profile }
  ├─ selectedEnfantId: "..."
  ├─ enfants: Enfant[] (max 8 affichés)
  ├─ diagnostics: any[]
  ├─ stats: DiagnosticStats | null
  ├─ loading: false
  ├─ error: null
  ├─ showHistory: boolean
  ├─ messages: Message[]
  ├─ input: string
  └─ isLoading: boolean
```

## Tests de régression

### Vérifier que l'UI d'origine est préservée
- ✅ Les couleurs et styles sont identiques
- ✅ Les animations fonctionnent (spin, pulse)
- ✅ Les badges de certification s'affichent
- ✅ Le layout responsive fonctionne
- ✅ Le dark mode fonctionne (si implémenté)

### Vérifier les fonctionnalités existantes
- ✅ Scroll automatique vers le bas du chat
- ✅ Envoi avec Entrée (pas Shift+Enter)
- ✅ Désactivation du bouton pendant le chargement
- ✅ Placeholder dynamique avec prénom de l'enfant
- ✅ Affichage des timestamps
- ✅ Avatar IA et utilisateur

## Cas limites à tester

1. **Enfant sans photo**
   - ✅ AvatarFallback avec première lettre du prénom

2. **Enfant sans allergies**
   - ✅ Affichage "Aucune"

3. **Enfant sans PAI**
   - ✅ Affichage "Aucun"

4. **Enfant sans groupe sanguin**
   - ✅ Badge vide ou "N/A"

5. **Très long texte de symptômes**
   - ✅ Affichage correct sans débordement

6. **Création rapide de plusieurs diagnostics**
   - ✅ Pas de race condition
   - ✅ Tous les diagnostics sont sauvegardés

## Checklist finale

- [ ] Le chargement initial fonctionne
- [ ] La sélection d'enfant fonctionne
- [ ] La création de diagnostic fonctionne
- [ ] Les prompts rapides fonctionnent
- [ ] L'historique s'affiche correctement
- [ ] Les erreurs sont gérées gracieusement
- [ ] Les stats se mettent à jour
- [ ] L'UI est responsive
- [ ] Les performances sont bonnes (<3s pour chargement initial)
- [ ] Pas de console errors

## Commandes utiles

```bash
# Démarrer le backend
cd api
npm run dev

# Démarrer le frontend
cd web-app
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview
```

## Dépannage

### Erreur "Cannot read property '_id' of undefined"
→ Vérifier que `enfants.length > 0` avant d'accéder à `selectedEnfant`

### Erreur CORS
→ Vérifier que le backend autorise `http://localhost:5173`

### Erreur 401 Unauthorized
→ Vérifier que l'utilisateur est connecté et que le token est valide

### Erreur 404 Not Found
→ Vérifier que les routes backend existent et correspondent aux appels

### Pas de données affichées
→ Vérifier que `DEFAULT_ETABLISSEMENT_ID` existe dans la base de données
