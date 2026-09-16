# 🚀 Guide de Démarrage Rapide - Kids'Med IA Web App

## Installation et lancement

### 1. Installation des dépendances

```bash
cd web-app
npm install
```

### 2. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

## 🎯 Navigation et Tests

### Page de Login

Au démarrage, vous arriverez sur la page de sélection de rôle. Trois espaces sont disponibles :

#### 🏠 Espace Crèche
- **Sélectionner** : Crèche
- **Fonctionnalités à tester** :
  - Vue d'ensemble des 5 enfants présents avec badges de santé
  - Cliquer sur le bouton `+` (magenta) pour déclarer un symptôme
  - Cliquer sur le bouton **SOS** (rouge flottant en bas à droite)
  - Consulter les notes internes/globales
  - Voir les alertes du quotidien

#### 🩺 Espace Médecin
- **Sélectionner** : Médecin
- **Fonctionnalités à tester** :
  - Statistiques : enfants suivis, ordonnances, diagnostics IA
  - Timeline des diagnostics IA récents avec indices de confiance
  - Liste des patients avec statut PAI et allergies
  - Bouton "Voir le dossier" sur chaque patient

#### 🛡️ Espace RSAI
- **Sélectionner** : RSAI
- **Fonctionnalités à tester** :
  - **IMPORTANT** : Écran de géofencing verrouillé par défaut
  - Cliquer sur "Simuler présence sur site" pour débloquer l'accès
  - Consulter le registre santé complet (tableau avec PAI, allergies, vaccins)
  - Voir les indicateurs de compliance (PAI actifs, vaccins à jour)
  - Consulter le journal de sécurité
  - Utiliser "Simuler sortie" pour retester le géofencing

## 🎨 Fonctionnalités Design System

### Dark Mode
- Cliquer sur l'icône lune/soleil dans le header
- Le thème est persisté dans localStorage

### Animations
- Toutes les cartes ont une animation d'entrée
- Les boutons ont des effets hover/press
- Les modals ont des transitions fluides

### Composants testés
- **GlassCard** : Effet verre dépoli sur toutes les cartes
- **StatusBadge** : Badges avec glow néon (sain/symptôme/attention)
- **PrimaryButton** : Boutons avec gradients cyan/magenta
- **AppBackground** : Blobs colorés en arrière-plan

## 📊 Données de Démonstration

### Enfants (5)
1. **Emma Dubois** (3 ans, A+) - Sain - PAI Actif (allergie arachides)
2. **Lucas Martin** (2 ans, O+) - Symptôme déclaré
3. **Chloé Bernard** (4 ans, B+) - Surveillance - PAI Actif (asthme)
4. **Hugo Petit** (3 ans, AB+) - Sain
5. **Léa Durand** (2 ans, A-) - Sain - Allergie œufs

### Diagnostics IA (3)
- Lucas : Rhinopharyngite (87% confiance)
- Chloé : Crise d'asthme légère (92% confiance)
- Lucas : Réaction allergique cutanée (74% confiance)

### Notes & Alertes
- 3 notes internes/globales
- 3 alertes quotidien (doudou oublié, stock bas, médicament)

### Logs Sécurité (5)
- Tentatives d'accès RSAI (géofencing)
- Modifications de données sensibles
- Accès hors horaires

## 🐛 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifier que vous êtes dans le bon dossier
cd /Volumes/SSD_ENZO/Crech-main/web-app

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreurs TypeScript
- Les types sont définis dans `/src/types/index.ts`
- Vérifier que `tsconfig.json` est bien configuré

### Problèmes de style
- Tailwind CSS est configuré dans `tailwind.config.js`
- Les classes custom sont dans `/src/styles/globals.css`

## 🔄 Workflow de développement

### Ajouter une nouvelle page
1. Créer le fichier dans `/src/pages/{role}/`
2. Importer dans `App.tsx`
3. Ajouter la route dans `<Routes>`

### Ajouter un composant
1. Créer dans `/src/components/`
2. Utiliser les tokens du Design System (couleurs, spacing, radius)
3. Importer `GlassCard` ou `PrimaryButton` comme base

### Modifier les données
- Éditer `/src/data/mockData.ts`
- Les changements sont immédiats (HMR)

## 📦 Build Production

```bash
npm run build
```

Le dossier `/dist` contiendra l'application optimisée.

### Déploiement recommandé
- **Vercel** : `vercel deploy`
- **Netlify** : Drag & drop du dossier `/dist`
- **AWS S3 + CloudFront** : Upload du `/dist`

## ✅ Checklist de validation

- [ ] Page de login s'affiche correctement
- [ ] Dark mode fonctionne
- [ ] Espace Crèche : dashboard + modal symptômes + SOS
- [ ] Espace Médecin : liste patients + diagnostics IA
- [ ] Espace RSAI : géofencing lock + toggle simulation
- [ ] Animations fluides sur les cartes
- [ ] Badges de statut avec glow
- [ ] Responsive sur mobile (< 768px)

## 🎓 Pour aller plus loin

### Backend à développer
1. API REST Node.js + Express
2. Base MongoDB avec les collections définies
3. WebSocket pour notifications temps réel
4. Authentification JWT
5. API géolocalisation pour RSAI

### Améliorations futures
- Pagination des listes
- Filtres avancés
- Export PDF des registres
- Upload de photos
- Notifications push web
- Mode offline (PWA)

---

**Bon développement ! 🚀**

Si vous rencontrez un problème, vérifiez d'abord :
1. Les dépendances sont installées (`node_modules/` existe)
2. Le port 3000 est libre
3. La console navigateur pour les erreurs
