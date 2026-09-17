import React, { useState, useRef, useEffect } from 'react';
import {
  IoSparklesOutline,
  IoSendOutline,
  IoDocumentTextOutline,
  IoPersonOutline,
  IoWarningOutline,
  IoPulseOutline,
  IoShieldCheckmarkOutline,
  IoDownloadOutline,
  IoAddCircleOutline,
  IoChevronForwardOutline,
  IoMedicalOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { diagnosticApi, enfantApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { analyserSymptomes, enregistrerDiagnostic, IS_DEMO_MODE as IA_DEMO_MODE } from '@/services/iaService';
import type { Enfant } from '@/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  urgencyLevel?: 'routine' | 'vigilance' | 'urgence';
}

interface DiagnosticStats {
  total: number;
  parNiveauUrgence: {
    routine: number;
    vigilance: number;
    urgence: number;
  };
}

const DEFAULT_ETABLISSEMENT_ID = 'test-creche-001';

export const DiagnosticIAPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedEnfantId, setSelectedEnfantId] = useState<string>('');
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [stats, setStats] = useState<DiagnosticStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Bonjour Docteur / RSAI. Je suis le moteur d'aide à la décision pédiatrique Kids'Med IA.\n\nSélectionnez un enfant pour lier la session à son dossier médical ou décrivez directement le tableau clinique observé.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedEnfant = enfants.find((e) => e._id === selectedEnfantId) || enfants[0];

  // Charger les données au montage
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

  // Charger les diagnostics quand un enfant est sélectionné
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const messageContent = textToSend || input;
    if (!messageContent.trim() || !selectedEnfant) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      // Préparer le contexte médical de l'enfant
      const contexteMedical = {
        age: selectedEnfant.age,
        groupeSanguin: selectedEnfant.groupeSanguin,
        allergies: selectedEnfant.allergies || [],
        paiActif: selectedEnfant.pai?.actif || false,
        antecedents: selectedEnfant.antecedents || [],
        vaccinsAJour: selectedEnfant.vaccins?.length >= 11 || false, // Vaccins obligatoires
      };

      // Appeler le service IA pour l'analyse
      const analyseIA = await analyserSymptomes({
        enfantId: selectedEnfantId,
        symptomes: messageContent,
        contexteMedical,
        medecinId: user?.id || '',
      });

      // Formater la réponse de l'IA pour l'affichage
      let responseContent = `**Analyse clinique pour ${selectedEnfant.prenom} ${selectedEnfant.nom} (${selectedEnfant.age} ans) :**\n\n`;
      responseContent += `**Diagnostic principal :** ${analyseIA.diagnostic}\n`;
      responseContent += `**Niveau de confiance :** ${analyseIA.confiance}%\n\n`;

      if (analyseIA.differentiels && analyseIA.differentiels.length > 0) {
        responseContent += `**Diagnostics différentiels :**\n`;
        analyseIA.differentiels.forEach((diff, i) => {
          responseContent += `${i + 1}. ${diff}\n`;
        });
        responseContent += `\n`;
      }

      responseContent += `**Recommandations :**\n${analyseIA.recommandations}\n\n`;

      if (analyseIA.examensComplementaires && analyseIA.examensComplementaires.length > 0) {
        responseContent += `**Examens complémentaires suggérés :**\n`;
        analyseIA.examensComplementaires.forEach((examen) => {
          responseContent += `• ${examen}\n`;
        });
        responseContent += `\n`;
      }

      if (analyseIA.signesAlarme && analyseIA.signesAlarme.length > 0) {
        responseContent += `⚠️ **Signes d'alarme à surveiller :**\n`;
        analyseIA.signesAlarme.forEach((signe) => {
          responseContent += `• ${signe}\n`;
        });
        responseContent += `\n`;
      }

      if (analyseIA.dureeEstimee) {
        responseContent += `**Durée estimée :** ${analyseIA.dureeEstimee}\n\n`;
      }

      responseContent += `${IA_DEMO_MODE ? '*Analyse effectuée en mode démo*' : '*Analyse IA certifiée ANS/HDS*'}`;

      // Créer le message de réponse
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        urgencyLevel: analyseIA.niveauUrgence,
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);

      // Enregistrer le diagnostic dans la base de données
      await enregistrerDiagnostic(selectedEnfantId, user?.id || '', analyseIA, messageContent);

      // Recharger les diagnostics
      const diagnosticsResponse = await diagnosticApi.getDiagnosticsByEnfant(selectedEnfantId);
      setDiagnostics(diagnosticsResponse.data || []);

      // Recharger les stats
      const statsResponse = await diagnosticApi.getDiagnosticStats(DEFAULT_ETABLISSEMENT_ID);
      setStats(statsResponse.data);

      setIsLoading(false);
    } catch (err: any) {
      console.error('Erreur lors de la création du diagnostic:', err);
      setIsLoading(false);

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `**Erreur:** ${err.response?.data?.error || 'Impossible de créer le diagnostic. Veuillez réessayer.'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    }
  };

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Affichage du loading initial
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <IoPulseOutline className="h-12 w-12 animate-pulse text-sky-600 mx-auto" />
          <p className="text-sm text-slate-500">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-80px)] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <IoAlertCircleOutline className="h-12 w-12 text-rose-600 mx-auto" />
            <div>
              <h3 className="font-bold text-lg mb-2">Erreur</h3>
              <p className="text-sm text-slate-500">{error}</p>
            </div>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Affichage si aucun enfant
  if (enfants.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-80px)] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <IoPersonOutline className="h-12 w-12 text-slate-400 mx-auto" />
            <div>
              <h3 className="font-bold text-lg mb-2">Aucun enfant trouvé</h3>
              <p className="text-sm text-slate-500">
                Aucun enfant n'est actuellement enregistré dans cet établissement.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-80px)] flex flex-col space-y-4 font-sans antialiased text-slate-900 dark:text-zinc-100">

      {/* Header Médical & Certification */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60">
            <IoSparklesOutline className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight">Assistant & Diagnostic IA Pédiatrique</h1>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px]">
                DM classe I · Certifié ANS/HDS
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Système d'aide à la décision clinique restreint au Médecin & RSAI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
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
        </div>
      </div>

      {/* Main Grid: Context Enfant + Chat IA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        
        {/* Sidebar Gauche: Sélecteur Enfant & Contexte Sanitaire */}
        <Card className="lg:col-span-1 shadow-none border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden">
          <CardHeader className="p-3.5 border-b border-slate-100 dark:border-zinc-800">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Lier un Patient / Dossier Enfant
            </CardTitle>
          </CardHeader>

          <CardContent className="p-3 space-y-3 overflow-y-auto flex-1">
            {/* Liste de sélection rapide d'enfant */}
            <div className="space-y-1.5">
              {enfants.slice(0, 8).map((enfant) => (
                <button
                  key={enfant._id}
                  onClick={() => setSelectedEnfantId(enfant._id)}
                  className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between ${
                    selectedEnfantId === enfant._id
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800'
                      : 'bg-slate-50/50 dark:bg-zinc-800/40 border-slate-200/60 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarImage src={enfant.photo} />
                      <AvatarFallback className="text-[10px] bg-slate-200 dark:bg-zinc-700">
                        {enfant.prenom[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="truncate">
                      <p className="text-xs font-bold truncate text-slate-900 dark:text-zinc-100">
                        {enfant.prenom} {enfant.nom}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">{enfant.age} ans</p>
                    </div>
                  </div>
                  <IoChevronForwardOutline className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>

            {/* Fiche synthétique de l'enfant sélectionné */}
            {selectedEnfant && (
              <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Fiche Patient</span>
                  <Badge variant="outline" className="font-mono text-[9px] bg-white dark:bg-zinc-900">
                    {selectedEnfant.groupeSanguin}
                  </Badge>
                </div>

                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">PAI Actif:</span>
                    <span className="font-semibold">{selectedEnfant.pai?.actif ? 'Oui (Allergie)' : 'Aucun'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vaccins:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">11/11 À jour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Allergies:</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400 truncate max-w-[110px]">
                      {selectedEnfant.allergies && selectedEnfant.allergies.length > 0
                        ? selectedEnfant.allergies.join(', ')
                        : 'Aucune'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Historique des diagnostics */}
            {showHistory && diagnostics.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Historique Diagnostics
                  </span>
                  <Badge variant="secondary" className="text-[9px]">
                    {diagnostics.length}
                  </Badge>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {diagnostics.slice(0, 5).map((diagnostic: any) => (
                    <div
                      key={diagnostic._id}
                      className="p-2 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[10px] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={`text-[8px] ${
                            diagnostic.niveauUrgence === 'urgence'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : diagnostic.niveauUrgence === 'vigilance'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {diagnostic.niveauUrgence}
                        </Badge>
                        <span className="font-mono text-slate-400">
                          {new Date(diagnostic.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-zinc-400 line-clamp-2">
                        {diagnostic.symptomes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Zone Principale de Dialogue IA */}
        <Card className="lg:col-span-3 shadow-none border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden">
          
          {/* Header du Chat */}
          <div className="p-3.5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <IoMedicalOutline className="h-4 w-4 text-sky-600" />
              <span className="text-xs font-bold">Session d'Analyse Clinique</span>
              {selectedEnfant && (
                <Badge variant="secondary" className="text-[10px] font-mono">
                  Dossier : {selectedEnfant.prenom} {selectedEnfant.nom}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
              <IoShieldCheckmarkOutline className="h-3.5 w-3.5 text-emerald-600" />
              <span>Chiffrement HDS actif</span>
            </div>
          </div>

          {/* Messages Feed */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 shrink-0 bg-sky-100 border border-sky-300 text-sky-800 dark:bg-sky-950 dark:border-sky-800 dark:text-sky-300">
                    <AvatarFallback className="bg-transparent">
                      <IoSparklesOutline className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[80%] rounded-xl p-3.5 text-xs leading-relaxed space-y-2 ${
                  message.role === 'user'
                    ? 'bg-sky-600 text-white rounded-br-none'
                    : 'bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 text-slate-900 dark:text-zinc-100 rounded-bl-none'
                }`}>
                  {message.urgencyLevel === 'vigilance' && (
                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded border border-amber-200 dark:border-amber-800 font-mono text-[10px]">
                      <IoWarningOutline className="h-3.5 w-3.5" />
                      <span>Niveau de vigilance recommandé : Moyen</span>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{message.content}</p>

                  <p className={`text-[10px] font-mono text-right ${
                    message.role === 'user' ? 'text-sky-100' : 'text-slate-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 shrink-0 bg-slate-200 dark:bg-zinc-700">
                    <AvatarFallback className="bg-transparent text-slate-700 dark:text-zinc-300">
                      <IoPersonOutline className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 items-center">
                <Avatar className="h-8 w-8 shrink-0 bg-sky-100 border border-sky-300 text-sky-800">
                  <AvatarFallback className="bg-transparent">
                    <IoSparklesOutline className="h-4 w-4 animate-spin" />
                  </AvatarFallback>
                </Avatar>
                <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-200/80 dark:border-zinc-700 text-xs text-slate-500 font-mono flex items-center gap-2">
                  <IoPulseOutline className="h-4 w-4 animate-pulse text-sky-600" />
                  <span>Analyse des bases de données médicales en cours...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Modèles de Prompts Rapides Pédiatriques */}
          <div className="px-4 py-2 bg-slate-50/50 dark:bg-zinc-900/50 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase font-mono">Signaux :</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSend(`Hyperthermie récente (>38.5°C) depuis 2h chez ${selectedEnfant.prenom}.`)}
              className="h-6 text-[10px] py-0 px-2 rounded-full border-slate-200 dark:border-zinc-700 shrink-0"
            >
              + Fièvre &gt; 38.5°C
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSend(`Éruption cutanée maculo-papuleuse observée lors du change de ${selectedEnfant.prenom}.`)}
              className="h-6 text-[10px] py-0 px-2 rounded-full border-slate-200 dark:border-zinc-700 shrink-0"
            >
              + Éruption Cutanée
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSend(`Gêne respiratoire légère / toux quinteuse observée pendant la sieste.`)}
              className="h-6 text-[10px] py-0 px-2 rounded-full border-slate-200 dark:border-zinc-700 shrink-0"
            >
              + Gêne Respiratoire
            </Button>
          </div>

          {/* Input & Zone de Saisie */}
          <div className="p-3 border-t border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
            <div className="flex gap-2 items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Décrivez les observations cliniques concernant ${selectedEnfant.prenom}...`}
                rows={2}
                className="flex-1 p-2.5 text-xs rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="h-auto py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white"
              >
                <IoSendOutline className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <p className="flex items-center gap-1">
                <IoWarningOutline className="text-amber-500 h-3 w-3" />
                Dispositif médical d'aide à la décision. La responsabilité clinique incombe au praticien validant.
              </p>
              <span className="font-mono hidden sm:inline">Version IA v4.2 · HAS HDS</span>
            </div>
          </div>

        </Card>

      </div>
    </div>
  );
};