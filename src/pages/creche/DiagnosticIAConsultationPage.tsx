import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  IoSparklesOutline,
  IoDocumentTextOutline,
  IoPersonOutline,
  IoWarningOutline,
  IoPulseOutline,
  IoShieldCheckmarkOutline,
  IoMedicalOutline,
  IoEyeOutline,
} from 'react-icons/io5';
import { diagnosticApi, enfantApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import type { Enfant } from '@/types';
import { AppBackground } from '@/components/AppBackground';
import { motion } from 'framer-motion';

interface DiagnosticSummary {
  _id: string;
  enfant_id: string;
  date: string;
  diagnostic: string;
  confiance: number;
  niveauUrgence: 'routine' | 'vigilance' | 'urgence';
  symptomes: string[];
  recommandations: string;
}

const DEFAULT_ETABLISSEMENT_ID = 'test-creche-001';

/**
 * Page de consultation des diagnostics IA pour les crèches
 * Conforme CDC page 2 : "Consultation des analyses IA pour un avis médical"
 *
 * Mode LECTURE SEULE - Les crèches ne peuvent pas créer de diagnostics
 * Seuls les médecins et RSAI peuvent utiliser l'IA en mode création
 */
export const DiagnosticIAConsultationPage: React.FC = () => {
  const { user } = useAuth();
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [selectedEnfantId, setSelectedEnfantId] = useState<string>('');
  const [diagnostics, setDiagnostics] = useState<DiagnosticSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);

  const selectedEnfant = enfants.find((e) => e._id === selectedEnfantId) || enfants[0];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedEnfantId) {
      loadDiagnostics();
    }
  }, [selectedEnfantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const enfantsResponse = await enfantApi.getEnfantsByEtablissement(DEFAULT_ETABLISSEMENT_ID);
      const enfantsData = enfantsResponse.data || [];
      setEnfants(enfantsData);

      if (enfantsData.length > 0) {
        setSelectedEnfantId(enfantsData[0]._id);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDiagnostics = async () => {
    try {
      setLoadingDiagnostics(true);
      const response = await diagnosticApi.getDiagnosticsByEnfant(selectedEnfantId);
      setDiagnostics(response.data || []);
    } catch (error) {
      console.error('Erreur chargement diagnostics:', error);
    } finally {
      setLoadingDiagnostics(false);
    }
  };

  const getUrgencyColor = (niveau: string) => {
    switch (niveau) {
      case 'urgence':
        return 'bg-red-500';
      case 'vigilance':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  const getUrgencyText = (niveau: string) => {
    switch (niveau) {
      case 'urgence':
        return 'URGENCE';
      case 'vigilance':
        return 'Vigilance';
      default:
        return 'Routine';
    }
  };

  if (loading) {
    return (
      <AppBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600 mx-auto"></div>
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">Chargement...</p>
          </div>
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 text-slate-900 dark:text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-3">
                <IoSparklesOutline className="text-lime-600 dark:text-lime-400" />
                Consultation Diagnostics IA
              </h1>
              <Badge variant="secondary" className="text-[10px] font-bold bg-lime-50 dark:bg-lime-950/50 text-lime-700 dark:text-lime-400 border border-lime-200 dark:border-lime-800">
                <IoEyeOutline className="mr-1 h-3 w-3" />
                Lecture seule
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">
              Visualisation des analyses médicales créées par les médecins
            </p>
          </div>
        </div>

        {/* Info mode lecture seule */}
        <Card className="rounded-xl border border-lime-200 dark:border-lime-800 bg-lime-50/50 dark:bg-lime-950/20 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <IoShieldCheckmarkOutline className="text-2xl text-lime-600 dark:text-lime-400 flex-shrink-0 mt-1" />
              <div className="text-sm text-slate-700 dark:text-zinc-300">
                <p className="font-extrabold mb-1 text-slate-900 dark:text-zinc-100">Mode consultation crèche</p>
                <p>
                  En tant que personnel de crèche, vous pouvez <strong>consulter</strong> les diagnostics IA
                  créés par les médecins pour prendre connaissance des avis médicaux.
                </p>
                <p className="mt-1">
                  <strong>Seuls les médecins et RSAI peuvent créer de nouveaux diagnostics.</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sélection enfant */}
          <Card className="lg:col-span-1 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-extrabold">
                <IoPersonOutline className="text-lime-600 dark:text-lime-400" />
                Enfants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enfants.length === 0 ? (
                <p className="text-slate-500 dark:text-zinc-400 text-sm">Aucun enfant dans cet établissement</p>
              ) : (
                <div className="space-y-2">
                  {enfants.map((enfant) => (
                    <button
                      key={enfant._id}
                      onClick={() => setSelectedEnfantId(enfant._id)}
                      className={`w-full p-3 rounded-xl border transition-all text-left ${
                        selectedEnfantId === enfant._id
                          ? 'border-lime-500 bg-lime-50/50 dark:bg-lime-950/20'
                          : 'border-slate-200 dark:border-zinc-700 hover:border-lime-500/50'
                      }`}
                    >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={enfant.photo} />
                        <AvatarFallback>
                          {enfant.prenom[0]}
                          {enfant.nom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {enfant.prenom} {enfant.nom}
                        </p>
                        <p className="text-sm text-gray-600">{enfant.age} ans</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

          {/* Historique diagnostics */}
          <Card className="lg:col-span-2 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-extrabold">
                <IoDocumentTextOutline className="text-lime-600 dark:text-lime-400" />
                Diagnostics IA de {selectedEnfant?.prenom || 'l\'enfant'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDiagnostics ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600 mx-auto"></div>
                  <p className="mt-4 text-slate-600 dark:text-zinc-400 text-sm">Chargement des diagnostics...</p>
                </div>
              ) : diagnostics.length === 0 ? (
                <div className="text-center py-12">
                  <IoMedicalOutline className="text-6xl text-slate-300 dark:text-zinc-700 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-zinc-400">Aucun diagnostic IA disponible pour cet enfant</p>
                  <p className="text-sm text-slate-500 dark:text-zinc-500 mt-2">
                    Les diagnostics apparaîtront ici une fois créés par un médecin
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {diagnostics.map((diagnostic) => (
                    <Card key={diagnostic._id} className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-l-4" style={{
                      borderLeftColor: getUrgencyColor(diagnostic.niveauUrgence),
                    }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getUrgencyColor(diagnostic.niveauUrgence)}>
                            {getUrgencyText(diagnostic.niveauUrgence)}
                          </Badge>
                          <Badge variant="outline">
                            <IoPulseOutline className="mr-1" />
                            {diagnostic.confiance}% confiance
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(diagnostic.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <h3 className="font-semibold text-lg mb-2">{diagnostic.diagnostic}</h3>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Symptômes observés :</p>
                        <div className="flex flex-wrap gap-1">
                          {diagnostic.symptomes.map((symptome, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {symptome}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Recommandations :</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {diagnostic.recommandations}
                        </p>
                      </div>

                      {diagnostic.niveauUrgence === 'urgence' && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <IoWarningOutline className="text-red-600 text-lg flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800">
                              <strong>Alerte urgence :</strong> Contacter immédiatement les parents et
                              le médecin référent. Surveillance rapprochée requise.
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

        {/* Footer info */}
        <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-zinc-400">
              <IoShieldCheckmarkOutline className="text-xl text-lime-600 dark:text-lime-400" />
              <p>
                <strong>Dispositif médical classe I</strong> · Certifié ANS/HDS ·
                Les diagnostics IA sont des aides à la décision et ne remplacent pas l'avis d'un médecin
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Professional Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-200/80 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
              <span className="font-bold text-lime-600 dark:text-lime-400">Kids'Med IA</span>
              <span>•</span>
              <span>© 2026 Tous droits réservés</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400">
              <a href="#" className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors font-medium">
                Centre d'aide
              </a>
              <span>•</span>
              <a href="#" className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors font-medium">
                Documentation
              </a>
            </div>
          </div>
        </footer>

      </motion.div>
    </AppBackground>
  );
};
