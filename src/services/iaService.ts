/**
 * Service d'Intelligence Artificielle pour le Diagnostic Médical Pédiatrique
 * Intègre OpenAI API en production et simulation en mode démo
 */

import { api } from './api';
import { toast } from 'sonner';

// Détection du mode démo
export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

// Clé API OpenAI (à configurer via variable d'environnement)
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

// Configuration OpenAI
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4'; // ou 'gpt-3.5-turbo' pour réduire les coûts

/**
 * Interface pour l'analyse IA
 */
export interface AnalyseIARequest {
  enfantId: string;
  symptomes: string;
  contexteMedical: {
    age: number;
    groupeSanguin?: string;
    allergies: string[];
    paiActif: boolean;
    antecedents: string[];
    vaccinsAJour: boolean;
  };
  medecinId: string;
}

export interface AnalyseIAResponse {
  diagnostic: string;
  confiance: number; // 0-100
  niveauUrgence: 'routine' | 'vigilance' | 'urgence';
  recommandations: string;
  differentiels: string[]; // Diagnostics différentiels
  examensComplementaires?: string[];
  signesAlarme?: string[];
  dureeEstimee?: string;
}

/**
 * Base de connaissances médicales pour le mode démo
 * Basée sur des pathologies pédiatriques courantes
 */
const BASE_CONNAISSANCES_DEMO: Record<string, AnalyseIAResponse> = {
  // Syndrome viral
  fievre_toux: {
    diagnostic: 'Syndrome viral aigu (probablement rhinopharyngite ou début de bronchiolite)',
    confiance: 87,
    niveauUrgence: 'vigilance',
    recommandations:
      '1. Surveillance de la température toutes les 4h\n2. Hydratation régulière (proposer à boire fréquemment)\n3. Paracétamol si fièvre >38.5°C (15mg/kg/prise)\n4. Position semi-assise pour faciliter la respiration\n5. Consultation médicale si aggravation des symptômes',
    differentiels: [
      'Rhinopharyngite virale',
      'Début de bronchiolite',
      'Infection ORL haute',
      'COVID-19 (forme pédiatrique)',
    ],
    examensComplementaires: ['Saturation en oxygène (SpO2)', 'Auscultation pulmonaire'],
    signesAlarme: [
      'Difficultés respiratoires importantes',
      'Refus de boire',
      'Léthargie',
      'Fièvre >39.5°C persistante',
      'Cyanose',
    ],
    dureeEstimee: '3-7 jours',
  },

  // Éruption cutanée
  eruption: {
    diagnostic: 'Éruption érythémateuse - possiblement d\'origine virale ou allergique',
    confiance: 75,
    niveauUrgence: 'vigilance',
    recommandations:
      '1. Isolement préventif (éviction si maladie contagieuse)\n2. Éviter de gratter les lésions\n3. Vêtements amples en coton\n4. Surveillance de l\'extension des lésions\n5. Consultation médicale pour diagnostic précis',
    differentiels: [
      'Roséole infantile',
      'Scarlatine',
      'Varicelle',
      'Réaction allergique',
      'Mégalérythème épidémique',
    ],
    examensComplementaires: ['Examen clinique complet', 'Recherche de fièvre associée'],
    signesAlarme: [
      'Extension rapide',
      'Signes de détresse respiratoire',
      'Fièvre élevée',
      'Purpura (lésions qui ne blanchissent pas)',
    ],
    dureeEstimee: 'Variable selon la cause (3-10 jours)',
  },

  // Troubles digestifs
  diarrhee_vomissements: {
    diagnostic: 'Gastro-entérite aiguë (probablement virale)',
    confiance: 90,
    niveauUrgence: 'vigilance',
    recommandations:
      '1. Réhydratation orale fractionnée (SRO)\n2. Alimentation légère si acceptée\n3. Éviction de la crèche pendant 48h après dernier symptôme\n4. Hygiène des mains stricte\n5. Surveillance des signes de déshydratation',
    differentiels: ['Gastro-entérite virale (rotavirus, norovirus)', 'Intoxication alimentaire', 'Allergie alimentaire'],
    examensComplementaires: ['Poids (surveillance déshydratation)', 'État des muqueuses'],
    signesAlarme: [
      'Soif intense',
      'Pli cutané persistant',
      'Fontanelle déprimée (nourrisson)',
      'Oligurie (peu d\'urines)',
      'Sang dans les selles',
    ],
    dureeEstimee: '24-48h',
  },

  // Détresse respiratoire
  difficulte_respiratoire: {
    diagnostic: 'Détresse respiratoire - nécessite une évaluation médicale URGENTE',
    confiance: 95,
    niveauUrgence: 'urgence',
    recommandations:
      '⚠️ URGENCE MÉDICALE\n1. Appeler le 15/SAMU immédiatement\n2. Position semi-assise\n3. Rassurer l\'enfant (ne pas agiter)\n4. Surveillance continue SpO2\n5. Ne rien donner par voie orale',
    differentiels: [
      'Bronchiolite sévère',
      'Crise d\'asthme',
      'Laryngite (croup)',
      'Corps étranger inhalé',
      'Pneumonie',
    ],
    examensComplementaires: ['SpO2', 'Fréquence respiratoire', 'Auscultation pulmonaire', 'Radiographie thoracique'],
    signesAlarme: ['SpO2 <92%', 'Tirage intercostal', 'Cyanose', 'Battement des ailes du nez', 'Refus alimentaire'],
    dureeEstimee: 'Consultation immédiate requise',
  },

  // Fièvre isolée
  fievre: {
    diagnostic: 'Hyperthermie - rechercher un foyer infectieux',
    confiance: 70,
    niveauUrgence: 'vigilance',
    recommandations:
      '1. Paracétamol 15mg/kg/prise (max 60mg/kg/jour)\n2. Découvrir l\'enfant\n3. Hydratation abondante\n4. Surveillance de l\'état général\n5. Recherche de signes associés',
    differentiels: [
      'Infection virale (rhinopharyngite, otite)',
      'Infection urinaire',
      'Poussée dentaire',
      'Infection bactérienne',
    ],
    examensComplementaires: ['Examen ORL', 'Bandelette urinaire', 'Auscultation'],
    signesAlarme: [
      'Fièvre >40°C',
      'Nourrisson <3 mois avec fièvre',
      'Convulsions fébriles',
      'Purpura',
      'Raideur de nuque',
    ],
    dureeEstimee: 'Dépend de la cause (1-5 jours)',
  },
};

/**
 * Analyse les symptômes et détecte la pathologie correspondante (mode démo)
 */
function detecterPathologieDemo(symptomes: string): AnalyseIAResponse {
  const symptomesLower = symptomes.toLowerCase();

  // Détection par mots-clés
  if (
    (symptomesLower.includes('difficulté respiratoire') || symptomesLower.includes('gêne respiratoire')) &&
    !symptomesLower.includes('légère')
  ) {
    return BASE_CONNAISSANCES_DEMO.difficulte_respiratoire;
  }

  if (symptomesLower.includes('diarrhée') || symptomesLower.includes('vomissement')) {
    return BASE_CONNAISSANCES_DEMO.diarrhee_vomissements;
  }

  if (symptomesLower.includes('éruption') || symptomesLower.includes('bouton') || symptomesLower.includes('rougeur')) {
    return BASE_CONNAISSANCES_DEMO.eruption;
  }

  if (symptomesLower.includes('fièvre') && (symptomesLower.includes('toux') || symptomesLower.includes('rhume'))) {
    return BASE_CONNAISSANCES_DEMO.fievre_toux;
  }

  if (symptomesLower.includes('fièvre')) {
    return BASE_CONNAISSANCES_DEMO.fievre;
  }

  // Par défaut, syndrome viral générique
  return {
    diagnostic: 'Syndrome viral non spécifique',
    confiance: 65,
    niveauUrgence: 'routine',
    recommandations:
      '1. Surveillance de l\'évolution des symptômes\n2. Mesures de confort adaptées\n3. Consultation médicale si aggravation ou persistance',
    differentiels: ['Infection virale bénigne', 'Fatigue passagère'],
    examensComplementaires: ['Examen clinique complet'],
    signesAlarme: ['Aggravation rapide des symptômes', 'Altération de l\'état général'],
    dureeEstimee: '2-5 jours',
  };
}

/**
 * Génère le prompt système pour OpenAI (médecin pédiatre virtuel)
 */
function genererPromptSysteme(): string {
  return `Tu es un médecin pédiatre expert avec 20 ans d'expérience en diagnostic pédiatrique.

Tu es spécialisé dans :
- Le diagnostic différentiel en pédiatrie (0-6 ans)
- L'évaluation de l'urgence médicale
- Les pathologies courantes en crèche
- La médecine basée sur les preuves (EBM)

Ton rôle est d'analyser les symptômes décrits et de fournir :
1. Un diagnostic principal avec niveau de confiance (0-100%)
2. Une évaluation de l'urgence (routine/vigilance/urgence)
3. Des recommandations pratiques et précises
4. Des diagnostics différentiels à considérer
5. Les examens complémentaires pertinents
6. Les signes d'alarme à surveiller

IMPORTANT :
- Reste factuel et basé sur les données médicales
- Indique clairement quand une consultation médicale est nécessaire
- Ne pose pas de diagnostic définitif, tu es un outil d'aide à la décision
- La responsabilité clinique finale revient au médecin validant
- Sois concis et pratique pour un usage en crèche

Format de réponse attendu (JSON strict) :
{
  "diagnostic": "nom de la pathologie principale",
  "confiance": nombre entre 0 et 100,
  "niveauUrgence": "routine" | "vigilance" | "urgence",
  "recommandations": "liste numérotée des actions à prendre",
  "differentiels": ["diagnostic 1", "diagnostic 2", ...],
  "examensComplementaires": ["examen 1", "examen 2", ...],
  "signesAlarme": ["signe 1", "signe 2", ...],
  "dureeEstimee": "durée estimée des symptômes"
}`;
}

/**
 * Génère le prompt utilisateur avec le contexte médical
 */
function genererPromptUtilisateur(request: AnalyseIARequest): string {
  const { symptomes, contexteMedical } = request;

  return `Analyse ces symptômes pour un enfant en crèche :

CONTEXTE MÉDICAL :
- Âge : ${contexteMedical.age} ans
- Groupe sanguin : ${contexteMedical.groupeSanguin || 'Non renseigné'}
- Allergies : ${contexteMedical.allergies.length > 0 ? contexteMedical.allergies.join(', ') : 'Aucune'}
- PAI actif : ${contexteMedical.paiActif ? 'Oui' : 'Non'}
- Antécédents : ${contexteMedical.antecedents.length > 0 ? contexteMedical.antecedents.join(', ') : 'Aucun'}
- Vaccins à jour : ${contexteMedical.vaccinsAJour ? 'Oui' : 'Non'}

SYMPTÔMES OBSERVÉS :
${symptomes}

Fournis ton analyse au format JSON strict demandé.`;
}

/**
 * Appelle l'API OpenAI pour l'analyse (mode production)
 */
async function analyserAvecOpenAI(request: AnalyseIARequest): Promise<AnalyseIAResponse> {
  if (!OPENAI_API_KEY) {
    throw new Error('Clé API OpenAI non configurée (VITE_OPENAI_API_KEY)');
  }

  const messages = [
    { role: 'system', content: genererPromptSysteme() },
    { role: 'user', content: genererPromptUtilisateur(request) },
  ];

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: messages,
        temperature: 0.3, // Basse température pour des réponses cohérentes
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const analyseIA: AnalyseIAResponse = JSON.parse(content);

    // Validation et normalisation du niveau d'urgence
    if (!['routine', 'vigilance', 'urgence'].includes(analyseIA.niveauUrgence)) {
      analyseIA.niveauUrgence = 'vigilance';
    }

    // Validation de la confiance (0-100)
    analyseIA.confiance = Math.max(0, Math.min(100, analyseIA.confiance));

    return analyseIA;
  } catch (error: any) {
    console.error('Erreur OpenAI API:', error);
    throw new Error(`Erreur d'analyse IA : ${error.message}`);
  }
}

/**
 * Analyse les symptômes avec IA (mode démo ou production)
 */
export async function analyserSymptomes(request: AnalyseIARequest): Promise<AnalyseIAResponse> {
  try {
    if (IS_DEMO_MODE) {
      // Mode démo : simulation avec base de connaissances
      console.log('🤖 [DEMO IA] Analyse des symptômes (simulé):', request.symptomes);

      // Simuler un délai d'analyse réaliste
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const resultat = detecterPathologieDemo(request.symptomes);

      console.log('🤖 [DEMO IA] Résultat:', resultat);

      toast.success('✅ Analyse IA terminée (mode démo)', {
        description: `Diagnostic : ${resultat.diagnostic}`,
        duration: 5000,
      });

      return resultat;
    } else {
      // Mode production : vrai appel OpenAI
      console.log('🤖 [PROD IA] Appel OpenAI API...');

      const resultat = await analyserAvecOpenAI(request);

      toast.success('✅ Analyse IA terminée', {
        description: `Diagnostic : ${resultat.diagnostic}`,
        duration: 5000,
      });

      return resultat;
    }
  } catch (error: any) {
    console.error('Erreur analyse IA:', error);

    toast.error('❌ Erreur d\'analyse IA', {
      description: error.message || 'Une erreur est survenue lors de l\'analyse',
    });

    throw error;
  }
}

/**
 * Enregistre le diagnostic dans la base de données via l'API backend
 */
export async function enregistrerDiagnostic(
  enfantId: string,
  medecinId: string,
  analyseIA: AnalyseIAResponse,
  symptomes: string
): Promise<any> {
  try {
    const diagnosticData = {
      enfantId,
      medecinId,
      symptomes,
      diagnostic: analyseIA.diagnostic,
      confiance: analyseIA.confiance,
      niveauUrgence: analyseIA.niveauUrgence,
      recommandations: analyseIA.recommandations,
      differentiels: analyseIA.differentiels,
      examensComplementaires: analyseIA.examensComplementaires,
      signesAlarme: analyseIA.signesAlarme,
    };

    if (IS_DEMO_MODE) {
      console.log('🤖 [DEMO IA] Enregistrement diagnostic (simulé):', diagnosticData);
      return { data: { _id: 'demo-diag-' + Date.now(), ...diagnosticData } };
    }

    const response = await api.post('/diagnostics', diagnosticData);
    return response.data;
  } catch (error: any) {
    console.error('Erreur enregistrement diagnostic:', error);
    throw error;
  }
}
