# Kids'Med IA - Web Dashboards

Application web professionnelle pour les dashboards **Crèche**, **Médecin** et **RSAI** du projet Kids'Med IA.

## 🎨 Design System

Cette application web utilise **exactement le même Design System** que l'application mobile React Native pour une cohérence parfaite de marque :

- **Palette de couleurs** : Cyan `#0099FF`, Magenta `#FF007A`, Lime `#8BC34A`
- **Glassmorphism** : Cartes avec effet dépoli et borders translucides
- **Neon Glow** : Ombres colorées sur les éléments d'accent
- **Typographie** : Fonts ultra-bold (700-900) pour la hiérarchie
- **Animations** : Transitions fluides avec Framer Motion

## 🚀 Stack Technique

- **Framework** : React 18 + Vite 5
- **Styling** : Tailwind CSS 3 avec configuration custom
- **Router** : React Router v6
- **Animations** : Framer Motion
- **Icons** : React Icons (Ionicons)
- **Date** : date-fns avec locale française
- **TypeScript** : Configuration stricte

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build production
npm run build

# Preview du build
npm run preview
```

L'application sera accessible sur `http://localhost:3000`

## 🏗️ Architecture

```
/src
├── components/          # Composants Design System réutilisables
│   ├── AppBackground.tsx
│   ├── GlassCard.tsx
│   ├── PrimaryButton.tsx
│   ├── StatusBadge.tsx
│   └── Header.tsx
├── pages/               # Pages par rôle
│   ├── LoginPage.tsx
│   ├── creche/          # Espace Crèche
│   ├── medecin/         # Espace Médecin
│   └── rsai/            # Espace RSAI
├── data/
│   └── mockData.ts      # Données de démonstration
├── hooks/               # Hooks personnalisés
│   ├── useAuth.tsx
│   └── useTheme.tsx
├── types/
│   └── index.ts         # Types TypeScript (MongoDB)
└── styles/
    └── globals.css      # Styles globaux + Tailwind
```

## 👥 Espaces Fonctionnels

### 🏠 Espace Crèche

- **Dashboard** : Vue d'ensemble des enfants présents avec badges de santé
- **Déclaration de symptômes** : Modal multi-select avec transfert vers IA
- **Bouton SOS** : Alerte d'urgence avec countdown
- **Système de notes** : Double niveau (Interne / Globale)
- **Alertes quotidien** : Doudou oublié, stock bas, etc.

### 🩺 Espace Médecin

- **Dashboard** : Liste des enfants suivis et statistiques
- **Diagnostics IA** : Timeline avec indices de confiance
- **Dossiers médicaux** : Allergies, vaccins, PAI, antécédents
- **Ordonnances** : Création et suivi des traitements

### 🛡️ Espace RSAI (Inspecteur Santé)

- **Géofencing** : Écran de verrouillage avec simulation de localisation
- **Registres santé** : Tableau complet avec export PDF
- **Compliance** : Indicateurs PAI, vaccins, conformité
- **Logs sécurité** : Journal d'accès et modifications sensibles

## 🔐 Authentification

L'authentification est simulée avec localStorage. En production, elle devrait être remplacée par un système JWT/OAuth sécurisé.

**Comptes de test** :
- **Crèche** : Les Petits Lutins
- **Médecin** : Dr Claire Martin
- **RSAI** : Carlos Garcia

## 🎯 Fonctionnalités Clés

### Design System

- **GlassCard** : Composant de carte avec effet verre dépoli
- **PrimaryButton** : Boutons avec gradients néon (cyan, magenta)
- **StatusBadge** : Badges de statut avec glow (sain, symptôme, attention)
- **AppBackground** : Fond avec blobs colorés animés

### Interactions

- **Dark Mode** : Switch automatique avec préférence utilisateur
- **Animations** : Entrées/sorties fluides avec Framer Motion
- **Responsive** : Adapté desktop-first avec fallback mobile

### Données

Toutes les données proviennent de `/src/data/mockData.ts` qui simule les collections MongoDB :
- `enfants`, `parents`, `creches`, `medecins`, `rsaiList`
- `diagnosticsIA`, `ordonnances`, `notesInternes`
- `alertesQuotidien`, `logsSecurite`, `alertesSOS`, `reviews`

## 🔧 Configuration

### Tailwind

Le fichier `tailwind.config.js` contient la palette complète et les tokens de design (spacing, radius, shadows, animations).

### Vite

Configuration optimisée avec alias `@/*` pour les imports absolus.

## 📝 Types TypeScript

Tous les types sont définis dans `/src/types/index.ts` et correspondent aux schémas MongoDB du backend (à créer).

## 🌐 Déploiement

```bash
# Build
npm run build

# Le dossier /dist contient l'application prête pour la production
# Compatible avec Vercel, Netlify, AWS S3 + CloudFront, etc.
```

## 🎨 Personnalisation

Pour modifier les couleurs de la marque, éditez :
- `tailwind.config.js` (couleurs Tailwind)
- Les composants individuels si nécessaire

## 📄 Licence

Projet Kids'Med IA © 2024

---

**Développé avec ❤️ pour une cohérence parfaite entre mobile et web**
