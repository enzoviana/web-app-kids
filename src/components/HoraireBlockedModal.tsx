import React from 'react';
import {
  IoTimeOutline,
  IoCloseOutline,
  IoCalendarOutline,
  IoAlertCircleOutline,
  IoInformationCircleOutline,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types';
import { afficherPlagesHoraires } from '@/services/horaireService';

interface HoraireBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  message: string;
  prochaineCreneau?: string;
  heureActuelle: string;
}

export const HoraireBlockedModal: React.FC<HoraireBlockedModalProps> = ({
  isOpen,
  onClose,
  role,
  message,
  prochaineCreneau,
  heureActuelle,
}) => {
  const plagesHoraires = afficherPlagesHoraires(role);

  const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      creche: 'Personnel de Crèche',
      auxiliaire: 'Auxiliaire',
      rsai: 'Inspecteur RSAI',
      medecin: 'Médecin',
      parent: 'Parent',
      superadmin: 'Super Administrateur',
      developpeur: 'Développeur',
    };
    return labels[role] || role;
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'creche':
      case 'auxiliaire':
        return '🏫';
      case 'rsai':
        return '🔍';
      default:
        return '👤';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <IoTimeOutline className="h-6 w-6 text-amber-600" />
              Accès Restreint - Horaires
            </DialogTitle>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <IoCloseOutline className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Message principal de blocage */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <IoAlertCircleOutline className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900 dark:text-amber-300 mb-1">
                Connexion hors horaires autorisés
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {message}
              </p>
            </div>
          </div>

          {/* Informations du rôle */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getRoleIcon(role)}</span>
              <div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Votre rôle</p>
                <p className="font-semibold text-slate-900 dark:text-zinc-100">
                  {getRoleLabel(role)}
                </p>
              </div>
            </div>

            {/* Heure actuelle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <IoTimeOutline className="h-5 w-5 text-slate-600 dark:text-zinc-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                  Heure actuelle
                </span>
              </div>
              <Badge variant="secondary" className="font-mono text-sm">
                {heureActuelle}
              </Badge>
            </div>

            {/* Prochain créneau disponible */}
            {prochaineCreneau && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  <IoCalendarOutline className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Prochain accès
                  </span>
                </div>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {prochaineCreneau}
                </span>
              </div>
            )}
          </div>

          {/* Plages horaires autorisées */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-zinc-300">
              <IoInformationCircleOutline className="h-4 w-4" />
              Horaires autorisés
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700">
              <p className="text-sm text-slate-600 dark:text-zinc-400 font-mono">
                {plagesHoraires}
              </p>
            </div>
          </div>

          {/* Informations de sécurité */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <IoShieldCheckmarkOutline className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-1">Sécurité & Traçabilité</p>
              <p>
                Cette tentative de connexion a été enregistrée dans les logs de sécurité conformément
                aux normes RGPD et aux exigences de traçabilité des accès.
              </p>
            </div>
          </div>

          {/* Bouton de fermeture */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <IoCloseOutline className="h-5 w-5 mr-2" />
            Fermer
          </Button>

          {/* Footer info */}
          <div className="text-center text-xs text-slate-500 dark:text-zinc-500">
            <p>🔒 Contrôle Horaire Actif - Conformité CDC</p>
            <p>Pour toute urgence, contactez votre administrateur</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
