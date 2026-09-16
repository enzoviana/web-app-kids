import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IoCloseCircleOutline } from 'react-icons/io5';
import type { Document } from '@/types';
import { mockData } from '@/data/mockData';
import { createDocumentNotification, logActionDocument, simulateEmailSMS, getDocumentTypeLabel } from '@/utils/documentHelpers';

interface RejeterDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
  userId: string;
  userRole: 'creche' | 'rsai' | 'superadmin';
}

export const RejeterDocumentModal: React.FC<RejeterDocumentModalProps> = ({
  isOpen,
  onClose,
  document,
  userId,
  userRole,
}) => {
  const [commentaire, setCommentaire] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentaire.trim()) return;

    const enfant = mockData.enfants.find(e => e._id === document.enfant_id);
    if (!enfant) return;

    // Mettre à jour le document
    document.statut = 'rejete';
    document.rejectedBy = userId;
    document.commentaire = commentaire;

    // Logger l'action
    const action = logActionDocument(
      document._id,
      document.enfant_id,
      'rejet',
      userId,
      userRole,
      commentaire
    );
    mockData.actionsDocuments.push(action);

    // Créer notifications pour les parents
    enfant.parents_ids.forEach(parentId => {
      const parent = mockData.parents.find(p => p._id === parentId);
      if (!parent) return;

      const notification = createDocumentNotification(
        'document_rejete',
        parentId,
        'parent',
        document.enfant_id,
        `Le document "${getDocumentTypeLabel(document.type)}" a été refusé. Raison : ${commentaire}`,
        document._id
      );

      mockData.notificationsDocuments.push(notification);

      // Simuler envoi email/SMS
      simulateEmailSMS(
        parent,
        'document_rejete',
        `Document refusé pour ${enfant.prenom} : ${getDocumentTypeLabel(document.type)}. Merci de le renvoyer.`
      );
    });

    handleClose();
  };

  const handleClose = () => {
    setCommentaire('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-500">
            <IoCloseCircleOutline className="h-5 w-5" />
            Refuser le document
          </DialogTitle>
          <DialogDescription>
            Indiquez la raison du refus. Les parents recevront une notification.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Document info */}
          <div className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-3">
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
          </div>

          {/* Commentaire obligatoire */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Raison du refus <span className="text-red-500">*</span>
            </label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-zinc-800 resize-none"
              rows={4}
              placeholder="Ex: Document illisible, informations manquantes, date d'expiration dépassée..."
              required
            />
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Soyez précis pour aider les parents à corriger le problème
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-lg p-3">
            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
              Les parents recevront une notification avec votre commentaire et devront soumettre un nouveau document.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="error"
              disabled={!commentaire.trim()}
            >
              Confirmer le refus
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
