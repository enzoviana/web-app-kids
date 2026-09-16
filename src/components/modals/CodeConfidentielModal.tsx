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
import { IoKeyOutline, IoCopyOutline, IoCheckmarkCircleOutline, IoRefreshOutline } from 'react-icons/io5';
import type { Enfant } from '@/types';
import { generateCodeConfidentiel, isCodeUnique, mockData } from '@/data/mockData';
import { logActionDocument } from '@/utils/documentHelpers';

interface CodeConfidentielModalProps {
  isOpen: boolean;
  onClose: () => void;
  enfant: Enfant;
  onCodeRegenerated?: (newCode: string) => void;
  userId: string;
  userRole: 'creche' | 'rsai' | 'superadmin';
}

export const CodeConfidentielModal: React.FC<CodeConfidentielModalProps> = ({
  isOpen,
  onClose,
  enfant,
  onCodeRegenerated,
  userId,
  userRole,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(enfant.codeConfidentiel);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    let newCode = generateCodeConfidentiel();
    while (!isCodeUnique(newCode, mockData.enfants)) {
      newCode = generateCodeConfidentiel();
    }

    enfant.codeConfidentiel = newCode;
    enfant.codeGenereeLe = new Date().toISOString();

    // Logger l'action
    const action = logActionDocument(
      '',
      enfant._id,
      'regeneration_code',
      userId,
      userRole,
      `Ancien code invalidé, nouveau code généré`
    );
    mockData.actionsDocuments.push(action);

    if (onCodeRegenerated) {
      onCodeRegenerated(newCode);
    }

    setShowRegenerateConfirm(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {!showRegenerateConfirm ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <IoKeyOutline className="h-5 w-5 text-emerald-600" />
                Code de liaison parent
              </DialogTitle>
              <DialogDescription>
                Partagez ce code confidentiel avec les parents de {enfant.prenom} pour qu'ils puissent lier leur compte.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              {/* Code Display */}
              <div className="bg-slate-50 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 rounded-lg p-6 text-center mb-4">
                <p className="text-xs text-slate-500 dark:text-zinc-400 mb-2 font-medium">CODE CONFIDENTIEL</p>
                <p className="font-mono text-4xl font-bold text-slate-900 dark:text-zinc-100 tracking-wider">
                  {enfant.codeConfidentiel}
                </p>
                {enfant.codeGenereeLe && (
                  <p className="text-xs text-slate-400 dark:text-zinc-500 mt-3">
                    Généré le {new Date(enfant.codeGenereeLe).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-lg p-4 mb-4">
                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium mb-2">
                  Instructions pour les parents :
                </p>
                <ol className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
                  <li>Se connecter à l'application Kids'Med IA</li>
                  <li>Aller dans le portail parent</li>
                  <li>Cliquer sur "Lier mon enfant"</li>
                  <li>Entrer ce code à 6 caractères</li>
                </ol>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-lg p-3">
                <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                  Ce code est personnel et confidentiel. Ne le partagez qu'avec les parents de {enfant.prenom}.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowRegenerateConfirm(true)}
                className="gap-1"
              >
                <IoRefreshOutline className="h-4 w-4" />
                Régénérer
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleCopy}
                className="gap-1"
              >
                {copied ? (
                  <>
                    <IoCheckmarkCircleOutline className="h-4 w-4" />
                    Copié !
                  </>
                ) : (
                  <>
                    <IoCopyOutline className="h-4 w-4" />
                    Copier le code
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-amber-600 dark:text-amber-500">Régénérer le code ?</DialogTitle>
              <DialogDescription>
                Cette action invalidera l'ancien code. Les parents devront utiliser le nouveau code pour lier leur compte.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                Êtes-vous sûr de vouloir générer un nouveau code pour {enfant.prenom} {enfant.nom} ?
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRegenerateConfirm(false)}
              >
                Annuler
              </Button>
              <Button
                type="button"
                variant="warning"
                onClick={handleRegenerate}
              >
                Confirmer la régénération
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
