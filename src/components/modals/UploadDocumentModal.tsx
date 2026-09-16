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
import { IoCloudUploadOutline, IoDocumentOutline } from 'react-icons/io5';
import type { Document } from '@/types';
import { mockData } from '@/data/mockData';
import { createDocumentNotification, logActionDocument, getDocumentTypeLabel } from '@/utils/documentHelpers';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
  userId: string;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  document,
  userId,
}) => {
  const [fileName, setFileName] = useState('');
  const [dateExpiration, setDateExpiration] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileName) return;

    const enfant = mockData.enfants.find(e => e._id === document.enfant_id);
    if (!enfant) return;

    // Mettre à jour le document
    document.nom = fileName;
    document.statut = 'soumis';
    document.dateUpload = new Date().toISOString();
    document.uploadedBy = userId;
    document.fichierUrl = `/mock/files/${fileName}`;
    if (dateExpiration) {
      document.dateExpiration = dateExpiration;
    }

    // Logger l'action
    const action = logActionDocument(
      document._id,
      document.enfant_id,
      'upload',
      userId,
      'parent',
      `Upload du document : ${fileName}`
    );
    mockData.actionsDocuments.push(action);

    // Créer notification pour la crèche
    const notification = createDocumentNotification(
      'document_demande',
      enfant.creche_id,
      'creche',
      document.enfant_id,
      `Un document a été uploadé pour ${enfant.prenom} ${enfant.nom} : ${getDocumentTypeLabel(document.type)}`,
      document._id
    );
    mockData.notificationsDocuments.push(notification);

    handleClose();
  };

  const handleClose = () => {
    setFileName('');
    setDateExpiration('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IoCloudUploadOutline className="h-5 w-5" />
            Téléverser un document
          </DialogTitle>
          <DialogDescription>
            Envoyez le document demandé : {getDocumentTypeLabel(document.type)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Fichier <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-lg p-6 text-center hover:border-slate-400 dark:hover:border-zinc-600 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <IoDocumentOutline className="h-12 w-12 text-slate-400 dark:text-zinc-500" />
                {fileName ? (
                  <>
                    <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                      {fileName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Cliquez pour changer
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                      Cliquez pour sélectionner un fichier
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      PDF, JPG, PNG (max 10 MB)
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Date d'expiration */}
          {['certificat_medical', 'attestation_rc', 'justificatif_domicile', 'pai'].includes(document.type) && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Date d'expiration {document.type === 'certificat_medical' ? <span className="text-red-500">*</span> : '(optionnel)'}
              </label>
              <input
                type="date"
                value={dateExpiration}
                onChange={(e) => setDateExpiration(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-zinc-800"
                min={new Date().toISOString().split('T')[0]}
                required={document.type === 'certificat_medical'}
              />
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Vous serez notifié avant l'expiration
              </p>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-lg p-3">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              Le document sera transmis à la crèche pour validation. Vous recevrez une notification dès qu'il sera validé.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" variant="default" disabled={!fileName}>
              Envoyer le document
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
