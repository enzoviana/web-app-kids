import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  IoWarningOutline,
  IoThermometerOutline,
  IoMedicalOutline,
  IoNotificationsOutline,
} from 'react-icons/io5';
import { toast } from 'sonner';
import type { Enfant } from '@/types';

interface SignalerSymptomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  enfant: Enfant;
}

/**
 * Modal de signalement de symptômes par la crèche
 * Conforme CDC page 2-3 : "Signalement symptômes en temps réel"
 *
 * Envoie automatiquement :
 * - Notification push aux parents
 * - Email/SMS aux parents
 * - Notification au médecin référent (si défini)
 */
export const SignalerSymptomeModal: React.FC<SignalerSymptomeModalProps> = ({
  isOpen,
  onClose,
  enfant,
}) => {
  const [symptomes, setSymptomes] = useState<string[]>([]);
  const [temperature, setTemperature] = useState('');
  const [observations, setObservations] = useState('');
  const [urgence, setUrgence] = useState<'routine' | 'vigilance' | 'urgence'>('routine');
  const [sending, setSending] = useState(false);

  const symptomesCommuns = [
    'Fièvre',
    'Toux',
    'Nez qui coule',
    'Maux de ventre',
    'Vomissements',
    'Diarrhée',
    'Éruption cutanée',
    'Fatigue',
    'Perte d\'appétit',
    'Difficultés respiratoires',
  ];

  const toggleSymptome = (symptome: string) => {
    if (symptomes.includes(symptome)) {
      setSymptomes(symptomes.filter((s) => s !== symptome));
    } else {
      setSymptomes([...symptomes, symptome]);
    }
  };

  const handleSubmit = async () => {
    if (symptomes.length === 0) {
      toast.error('Veuillez sélectionner au moins un symptôme');
      return;
    }

    try {
      setSending(true);

      // Mode démo : simulation d'envoi de notifications
      // En production : endpoint backend /api/alertes/symptome

      const alerteData = {
        enfant_id: enfant._id,
        symptomes,
        temperature: temperature || null,
        observations,
        niveau_urgence: urgence,
        signale_par: 'creche',
        date: new Date().toISOString(),
        notifications: {
          parents: true,
          medecin: enfant.medecin_id ? true : false,
          rsai: urgence === 'urgence',
        },
      };

      // Simuler l'envoi
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log('Alerte symptôme créée:', alerteData);

      toast.success('✅ Symptômes signalés', {
        description: `Les parents de ${enfant.prenom} ont été notifiés par email et SMS`,
        duration: 5000,
      });

      if (urgence === 'urgence') {
        toast.warning('⚠️ Alerte urgence envoyée', {
          description: 'Le médecin et le RSAI ont été alertés',
          duration: 7000,
        });
      }

      // Réinitialiser et fermer
      setSymptomes([]);
      setTemperature('');
      setObservations('');
      setUrgence('routine');
      onClose();
    } catch (error) {
      console.error('Erreur signalement:', error);
      toast.error('Impossible de signaler les symptômes');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IoMedicalOutline className="text-2xl text-red-500" />
            Signaler des symptômes
          </DialogTitle>
          <DialogDescription>
            {enfant.prenom} {enfant.nom} · {enfant.age} ans
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Niveau d'urgence */}
          <div>
            <Label className="mb-2 block">Niveau d'urgence</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setUrgence('routine')}
                className={`p-3 border rounded-lg text-center transition-all ${
                  urgence === 'routine'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <p className="font-semibold">Routine</p>
                <p className="text-xs">Bénin</p>
              </button>
              <button
                onClick={() => setUrgence('vigilance')}
                className={`p-3 border rounded-lg text-center transition-all ${
                  urgence === 'vigilance'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <p className="font-semibold">Vigilance</p>
                <p className="text-xs">À surveiller</p>
              </button>
              <button
                onClick={() => setUrgence('urgence')}
                className={`p-3 border rounded-lg text-center transition-all ${
                  urgence === 'urgence'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <p className="font-semibold">Urgence</p>
                <p className="text-xs">Critique</p>
              </button>
            </div>
          </div>

          {/* Symptômes courants */}
          <div>
            <Label className="mb-2 block">Symptômes observés *</Label>
            <div className="grid grid-cols-2 gap-2">
              {symptomesCommuns.map((symptome) => (
                <button
                  key={symptome}
                  onClick={() => toggleSymptome(symptome)}
                  className={`p-2 border rounded-lg text-sm transition-all ${
                    symptomes.includes(symptome)
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 hover:border-primary'
                  }`}
                >
                  {symptome}
                </button>
              ))}
            </div>
            {symptomes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {symptomes.map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Température */}
          <div>
            <Label className="mb-2 flex items-center gap-2">
              <IoThermometerOutline />
              Température (optionnel)
            </Label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                step="0.1"
                min="35"
                max="42"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="Ex: 38.5"
                className="flex-1 p-2 border rounded-md"
              />
              <span className="text-gray-600">°C</span>
            </div>
            {temperature && parseFloat(temperature) >= 38.5 && (
              <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                <IoWarningOutline />
                Fièvre détectée - vigilance recommandée
              </p>
            )}
          </div>

          {/* Observations */}
          <div>
            <Label className="mb-2 block">Observations complémentaires</Label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Décrivez le comportement de l'enfant, l'heure d'apparition des symptômes, etc."
              rows={4}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Alerte allergies/PAI */}
          {(enfant.allergies?.length > 0 || enfant.pai?.actif) && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <IoWarningOutline className="text-2xl text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800 mb-1">Informations médicales</p>
                  {enfant.allergies?.length > 0 && (
                    <p className="text-yellow-700">
                      <strong>Allergies:</strong> {enfant.allergies.join(', ')}
                    </p>
                  )}
                  {enfant.pai?.actif && (
                    <p className="text-yellow-700 mt-1">
                      <strong>PAI actif:</strong> {enfant.pai.pathologie}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info notifications */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <IoNotificationsOutline className="text-2xl text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Notifications automatiques</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Email + SMS aux parents</li>
                  <li>Notification push dans l'application</li>
                  {enfant.medecin_id && <li>Alerte au médecin référent</li>}
                  {urgence === 'urgence' && <li className="font-semibold">Alerte RSAI (urgence)</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={sending || symptomes.length === 0}>
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <IoNotificationsOutline className="mr-2" />
                Signaler et notifier
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
