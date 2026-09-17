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
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <IoSparklesOutline className="text-primary" />
              Consultation Diagnostics IA
            </h1>
            <p className="text-gray-600 mt-1">Visualisation des analyses médicales (Mode lecture seule)</p>
          </div>
          <Badge variant="secondary" className="text-sm">
            <IoEyeOutline className="mr-1" />
            Consultation uniquement
          </Badge>
        </div>
      </div>

      {/* Info mode lecture seule */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <IoShieldCheckmarkOutline className="text-2xl text-blue-600 flex-shrink-0 mt-1" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Mode consultation crèche</p>
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
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IoPersonOutline />
              Enfants
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enfants.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun enfant dans cet établissement</p>
            ) : (
              <div className="space-y-2">
                {enfants.map((enfant) => (
                  <button
                    key={enfant._id}
                    onClick={() => setSelectedEnfantId(enfant._id)}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      selectedEnfantId === enfant._id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/50'
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IoDocumentTextOutline />
              Diagnostics IA de {selectedEnfant?.prenom || 'l\'enfant'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDiagnostics ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600 text-sm">Chargement des diagnostics...</p>
              </div>
            ) : diagnostics.length === 0 ? (
              <div className="text-center py-12">
                <IoMedicalOutline className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Aucun diagnostic IA disponible pour cet enfant</p>
                <p className="text-sm text-gray-500 mt-2">
                  Les diagnostics apparaîtront ici une fois créés par un médecin
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {diagnostics.map((diagnostic) => (
                  <Card key={diagnostic._id} className="border-l-4" style={{
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
      <Card className="mt-6 border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <IoShieldCheckmarkOutline className="text-xl" />
            <p>
              <strong>Dispositif médical classe I</strong> · Certifié ANS/HDS ·
              Les diagnostics IA sont des aides à la décision et ne remplacent pas l'avis d'un médecin
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
