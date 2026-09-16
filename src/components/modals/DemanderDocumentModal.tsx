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
import { IoDocumentTextOutline } from 'react-icons/io5';
import type { TypeDocument, Document } from '@/types';
import { mockData } from '@/data/mockData';
import { createDocumentNotification, logActionDocument, simulateEmailSMS, getDocumentTypeLabel } from '@/utils/documentHelpers';

interface DemanderDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  enfantId: string;
  userId: string;
  userRole: 'creche' | 'rsai' | 'superadmin';
}

export const DemanderDocumentModal: React.FC<DemanderDocumentModalProps> = ({
  isOpen,
  onClose,
  enfantId,
  userId,
  userRole,
}) => {
  const [typeDocument, setTypeDocument] = useState<TypeDocument>('certificat_medical');
  const [commentaire, setCommentaire] = useState('');
  const [dateLimite, setDateLimite] = useState('');

  const documentTypes: TypeDocument[] = [
    'certificat_medical',
    'attestation_rc',
    'justificatif_domicile',
    'fiche_urgence',
    'carnet_vaccination',
    'contrat_accueil',
    'autorisation_sortie',
    'autorisation_image',
    'pai',
    'autre',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const enfant = mockData.enfants.find(e => e._id === enfantId);
    if (!enfant) return;

    // Créer le document
    const newDocument: Document = {
      _id: `doc_${Date.now()}`,
      enfant_id: enfantId,
      type: typeDocument,
      nom: '',
      statut: 'en_attente',
      obligatoire: true,
    };

    mockData.documents.push(newDocument);

    // Logger l'action
    const action = logActionDocument(
      newDocument._id,
      enfantId,
      'demande',
      userId,
      userRole,
      commentaire || `Demande de ${getDocumentTypeLabel(typeDocument)}`
    );
    mockData.actionsDocuments.push(action);

    // Créer notifications pour les parents
    enfant.parents_ids.forEach(parentId => {
      const parent = mockData.parents.find(p => p._id === parentId);
      if (!parent) return;

      const notification = createDocumentNotification(
        'document_demande',
        parentId,
        'parent',
        enfantId,
        `Merci de fournir le document : ${getDocumentTypeLabel(typeDocument)}${dateLimite ? ` avant le ${new Date(dateLimite).toLocaleDateString('fr-FR')}` : ''}.${commentaire ? ` ${commentaire}` : ''}`,
        newDocument._id
      );

      mockData.notificationsDocuments.push(notification);

      // Simuler envoi email/SMS
      simulateEmailSMS(
        parent,
        'document_demande',
        `Document requis pour ${enfant.prenom} : ${getDocumentTypeLabel(typeDocument)}`
      );
    });

    handleClose();
  };

  const handleClose = () => {
    setTypeDocument('certificat_medical');
    setCommentaire('');
    setDateLimite('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IoDocumentTextOutline className="h-5 w-5" />
            Demander un document
          </DialogTitle>
          <DialogDescription>
            Demandez un document obligatoire aux parents. Ils recevront une notification.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type de document */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Type de document <span className="text-red-500">*</span>
            </label>
            <select
              value={typeDocument}
              onChange={(e) => setTypeDocument(e.target.value as TypeDocument)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-zinc-800"
              required
            >
              {documentTypes.map(type => (
                <option key={type} value={type}>
                  {getDocumentTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Date limite */}
          <div>
            <label className="block text-sm font-medium mb-1">Date limite souhaitée</label>
            <input
              type="date"
              value={dateLimite}
              onChange={(e) => setDateLimite(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-zinc-800"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Commentaire */}
          <div>
            <label className="block text-sm font-medium mb-1">Commentaire ou précisions</label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-zinc-800 resize-none"
              rows={3}
              placeholder="Ex: Document requis pour finaliser l'inscription..."
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-lg p-3">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              Les parents recevront une notification in-app ainsi qu'un email et SMS.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" variant="default">
              Envoyer la demande
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
