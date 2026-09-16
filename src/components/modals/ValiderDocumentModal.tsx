import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import type { Document } from '@/types';
import { mockData } from '@/data/mockData';
import { createDocumentNotification, logActionDocument, simulateEmailSMS, getDocumentTypeLabel } from '@/utils/documentHelpers';

interface ValiderDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
  userId: string;
  userRole: 'creche' | 'rsai' | 'superadmin';
}

export const ValiderDocumentModal: React.FC<ValiderDocumentModalProps> = ({
  isOpen,
  onClose,
  document,
  userId,
  userRole,
}) => {
  const handleConfirm = () => {
    const enfant = mockData.enfants.find(e => e._id === document.enfant_id);
    if (!enfant) return;

    // Mettre à jour le document
    document.statut = 'valide';
    document.dateValidation = new Date().toISOString();
    document.validatedBy = userId;

    // Logger l'action
    const action = logActionDocument(
      document._id,
      document.enfant_id,
      'validation',
      userId,
      userRole,
      'Document conforme et validé'
    );
    mockData.actionsDocuments.push(action);

    // Créer notifications pour les parents
    enfant.parents_ids.forEach(parentId => {
      const parent = mockData.parents.find(p => p._id === parentId);
      if (!parent) return;

      const notification = createDocumentNotification(
        'document_valide',
        parentId,
        'parent',
        document.enfant_id,
        `Le document "${getDocumentTypeLabel(document.type)}" de ${enfant.prenom} a été validé.`,
        document._id
      );

      mockData.notificationsDocuments.push(notification);

      // Simuler envoi email/SMS
      simulateEmailSMS(
        parent,
        'document_valide',
        `Le ${getDocumentTypeLabel(document.type)} de ${enfant.prenom} a été validé. Merci !`
      );
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
            <IoCheckmarkCircleOutline className="h-5 w-5" />
            Valider le document
          </DialogTitle>
          <DialogDescription>
            Confirmez la validation de ce document. Les parents recevront une notification.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Document info */}
          <div className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-900 dark:text-zinc-100 mb-1">
              {getDocumentTypeLabel(document.type)}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {document.nom || 'Sans nom'}
            </p>
            {document.dateUpload && (
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Uploadé le {new Date(document.dateUpload).toLocaleDateString('fr-FR')}
              </p>
            )}
            {document.dateExpiration && (
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Expire le {new Date(document.dateExpiration).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-lg p-3">
            <p className="text-xs text-emerald-800 dark:text-emerald-300">
              Le document sera marqué comme validé et les parents recevront une notification de confirmation.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="button"
            variant="success"
            onClick={handleConfirm}
          >
            Confirmer la validation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
