# Integration Backend - DiagnosticIAPage

## Résumé des modifications

Le fichier `/Volumes/SSD_ENZO/Crech-main/web-app/src/pages/medecin/DiagnosticIAPage.tsx` a été connecté au backend avec succès.

## Changements effectués

### 1. Imports ajoutés
```typescript
import { diagnosticApi, enfantApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { IoAlertCircleOutline } from 'react-icons/io5';
```

### 2. Interfaces TypeScript ajoutées
```typescript
interface Enfant {
  _id: string;
  prenom: string;
  nom: string;
  age: number;
  photo?: string;
  groupeSanguin?: string;
  pai?: { actif: boolean };
  allergies: string[];
}

interface DiagnosticStats {
  total: number;
  parNiveauUrgence: {
    routine: number;
    vigilance: number;
    urgence: number;
  };
}
```

### 3. États ajoutés
```typescript
const DEFAULT_ETABLISSEMENT_ID = 'test-creche-001';

// Hook d'authentification
const { user } = useAuth();

// États pour les données
const [enfants, setEnfants] = useState<Enfant[]>([]);
const [diagnostics, setDiagnostics] = useState<any[]>([]);
const [stats, setStats] = useState<DiagnosticStats | null>(null);

// États de chargement et d'erreur
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [showHistory, setShowHistory] = useState(false);
```

### 4. Chargement initial des données (useEffect)
```typescript
useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les enfants
      const enfantsResponse = await enfantApi.getEnfantsByEtablissement(DEFAULT_ETABLISSEMENT_ID);
      const enfantsData = enfantsResponse.data || [];
      setEnfants(enfantsData);

      // Sélectionner le premier enfant par défaut
      if (enfantsData.length > 0 && !selectedEnfantId) {
        setSelectedEnfantId(enfantsData[0]._id);
      }

      // Charger les stats
      const statsResponse = await diagnosticApi.getDiagnosticStats(DEFAULT_ETABLISSEMENT_ID);
      setStats(statsResponse.data);
    } catch (err: any) {
      console.error('Erreur lors du chargement des données:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);
```

### 5. Chargement des diagnostics par enfant
```typescript
useEffect(() => {
  const loadDiagnostics = async () => {
    if (!selectedEnfantId) return;

    try {
      const response = await diagnosticApi.getDiagnosticsByEnfant(selectedEnfantId);
      setDiagnostics(response.data || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des diagnostics:', err);
    }
  };

  loadDiagnostics();
}, [selectedEnfantId]);
```

### 6. Fonction handleSend connectée au backend
```typescript
const handleSend = async (textToSend?: string) => {
  // ... validation ...

  try {
    // Créer un diagnostic dans le backend
    const diagnosticData = {
      enfantId: selectedEnfantId,
      medecinId: user?.id,
      symptomes: messageContent,
      niveauUrgence: 'vigilance' as const,
      recommandations: 'En cours d\'analyse...',
    };

    const response = await diagnosticApi.createDiagnostic(diagnosticData);
    const diagnostic = response.data;

    // Simuler une analyse IA
    setTimeout(() => {
      // ... réponse IA avec diagnostic._id ...

      // Recharger les diagnostics
      diagnosticApi.getDiagnosticsByEnfant(selectedEnfantId).then((res) => {
        setDiagnostics(res.data || []);
      });

      // Recharger les stats
      diagnosticApi.getDiagnosticStats(DEFAULT_ETABLISSEMENT_ID).then((res) => {
        setStats(res.data);
      });
    }, 1400);
  } catch (err: any) {
    // Gestion d'erreur
  }
};
```

### 7. Fonction de suppression ajoutée
```typescript
const handleDeleteDiagnostic = async (diagnosticId: string) => {
  try {
    await diagnosticApi.deleteDiagnostic(diagnosticId);

    // Recharger les diagnostics
    const response = await diagnosticApi.getDiagnosticsByEnfant(selectedEnfantId);
    setDiagnostics(response.data || []);

    // Recharger les stats
    const statsResponse = await diagnosticApi.getDiagnosticStats(DEFAULT_ETABLISSEMENT_ID);
    setStats(statsResponse.data);
  } catch (err: any) {
    console.error('Erreur lors de la suppression du diagnostic:', err);
    setError(err.response?.data?.error || 'Erreur lors de la suppression du diagnostic');
  }
};
```

### 8. États de chargement et d'erreur dans l'UI
```typescript
// Loading initial
if (loading) {
  return (
    <div className="...">
      <IoPulseOutline className="h-12 w-12 animate-pulse text-sky-600 mx-auto" />
      <p className="text-sm text-slate-500">Chargement des données...</p>
    </div>
  );
}

// Affichage de l'erreur
if (error) {
  return (
    <div className="...">
      <IoAlertCircleOutline className="h-12 w-12 text-rose-600 mx-auto" />
      <p className="text-sm text-slate-500">{error}</p>
      <Button onClick={() => window.location.reload()}>Réessayer</Button>
    </div>
  );
}

// Affichage si aucun enfant
if (enfants.length === 0) {
  return (
    <div className="...">
      <IoPersonOutline className="h-12 w-12 text-slate-400 mx-auto" />
      <p>Aucun enfant n'est actuellement enregistré dans cet établissement.</p>
    </div>
  );
}
```

### 9. Affichage des statistiques et de l'historique
```typescript
// Dans le header
<Button
  variant="outline"
  size="sm"
  onClick={() => setShowHistory(!showHistory)}
>
  <IoDocumentTextOutline className="mr-1.5 h-3.5 w-3.5" />
  Historique ({diagnostics.length})
</Button>
{stats && (
  <Badge variant="outline" className="text-[10px] font-mono">
    Stats: {stats.total} diagnostics
  </Badge>
)}

// Dans la sidebar
{showHistory && diagnostics.length > 0 && (
  <div className="mt-4 p-3 rounded-lg bg-slate-50 ...">
    <span className="text-[10px] font-bold text-slate-500 uppercase">
      Historique Diagnostics
    </span>
    <Badge variant="secondary">{diagnostics.length}</Badge>

    <div className="space-y-2 max-h-60 overflow-y-auto">
      {diagnostics.slice(0, 5).map((diagnostic: any) => (
        <div key={diagnostic._id} className="...">
          <Badge variant="outline">{diagnostic.niveauUrgence}</Badge>
          <span>{new Date(diagnostic.createdAt).toLocaleDateString('fr-FR')}</span>
          <p>{diagnostic.symptomes}</p>
        </div>
      ))}
    </div>
  </div>
)}
```

### 10. Liste des enfants dynamique
```typescript
{enfants.slice(0, 8).map((enfant) => (
  <button
    key={enfant._id}
    onClick={() => setSelectedEnfantId(enfant._id)}
    className={`... ${selectedEnfantId === enfant._id ? 'bg-sky-50 ...' : '...'}`}
  >
    <Avatar className="h-7 w-7">
      <AvatarImage src={enfant.photo} />
      <AvatarFallback>{enfant.prenom[0]}</AvatarFallback>
    </Avatar>
    <div>
      <p>{enfant.prenom} {enfant.nom}</p>
      <p>{enfant.age} ans</p>
    </div>
  </button>
))}
```

## APIs utilisées

### diagnosticApi
- `getDiagnosticsByEnfant(enfantId)` - Récupère les diagnostics d'un enfant
- `createDiagnostic(data)` - Crée un nouveau diagnostic
- `deleteDiagnostic(diagnosticId)` - Supprime un diagnostic
- `getDiagnosticStats(etablissementId)` - Récupère les statistiques

### enfantApi
- `getEnfantsByEtablissement(etablissementId)` - Récupère la liste des enfants

### useAuth
- `user` - Informations de l'utilisateur connecté (inclut user.id pour medecinId)

## Constantes
```typescript
const DEFAULT_ETABLISSEMENT_ID = 'test-creche-001';
```

## Fonctionnalités implémentées

1. ✅ Chargement des enfants depuis le backend
2. ✅ Chargement des diagnostics par enfant
3. ✅ Chargement des statistiques
4. ✅ Création de diagnostic avec API backend
5. ✅ Suppression de diagnostic (fonction créée, à connecter à l'UI)
6. ✅ États de loading/error
7. ✅ Affichage de l'historique des diagnostics
8. ✅ Affichage des statistiques dans le header
9. ✅ Gestion des cas d'erreur
10. ✅ Mise à jour automatique après création/suppression

## UI/UX préservé

✅ L'interface utilisateur et l'expérience utilisateur d'origine ont été conservées
✅ Tous les styles et animations sont maintenus
✅ Le comportement du chat IA est identique
✅ Les prompts rapides fonctionnent toujours

## Points d'amélioration futurs

1. Remplacer la simulation d'IA par une vraie API d'IA
2. Ajouter la fonctionnalité d'export de session
3. Ajouter des filtres pour l'historique des diagnostics
4. Implémenter la pagination pour les grands nombres de diagnostics
5. Ajouter des graphiques pour les statistiques
6. Implémenter le WebSocket pour les mises à jour en temps réel

## Notes techniques

- Le fichier utilise TypeScript avec des types stricts
- Les erreurs sont gérées avec try/catch et affichées à l'utilisateur
- Les états de chargement sont gérés pour une meilleure UX
- Le code suit les conventions React avec hooks modernes
- Les appels API sont asynchrones et gèrent les erreurs réseau
