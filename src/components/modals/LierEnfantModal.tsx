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
import { IoLinkOutline, IoCheckmarkCircleOutline, IoAlertCircleOutline } from 'react-icons/io5';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Enfant } from '@/types';
import { mockData } from '@/data/mockData';

interface LierEnfantModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: string;
}

export const LierEnfantModal: React.FC<LierEnfantModalProps> = ({
  isOpen,
  onClose,
  parentId,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [foundEnfant, setFoundEnfant] = useState<Enfant | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCodeChange = (value: string) => {
    // Auto-uppercase et limiter à 6 caractères
    const uppercaseValue = value.toUpperCase().slice(0, 6);
    setCode(uppercaseValue);
    setError('');
    setFoundEnfant(null);
  };

  const handleVerifyCode = () => {
    if (code.length !== 6) {
      setError('Le code doit contenir 6 caractères');
      return;
    }

    // Chercher l'enfant avec ce code
    const enfant = mockData.enfants.find(e => e.codeConfidentiel === code);

    if (!enfant) {
      setError('Code invalide. Veuillez vérifier et réessayer.');
      return;
    }

    // Vérifier si déjà lié
    if (enfant.parents_ids.includes(parentId)) {
      setError('Vous êtes déjà lié à cet enfant.');
      return;
    }

    setFoundEnfant(enfant);
    setError('');
  };

  const handleConfirmLink = () => {
    if (!foundEnfant) return;

    // Ajouter le parent à l'enfant
    foundEnfant.parents_ids.push(parentId);

    setSuccess(true);
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setCode('');
    setError('');
    setFoundEnfant(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {success ? (
          <>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mb-4">
                <IoCheckmarkCircleOutline className="h-10 w-10 text-emerald-600 dark:text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-2">
                Enfant lié avec succès !
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                Vous pouvez maintenant accéder aux informations de {foundEnfant?.prenom}.
              </p>
            </div>
          </>
        ) : foundEnfant ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <IoCheckmarkCircleOutline className="h-5 w-5 text-emerald-600" />
                Confirmer la liaison
              </DialogTitle>
              <DialogDescription>
                Vérifiez que les informations correspondent à votre enfant.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              {/* Enfant trouvé */}
              <div className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-slate-200 dark:border-zinc-700">
                    <AvatarImage src={foundEnfant.photo} alt={foundEnfant.prenom} />
                    <AvatarFallback className="text-lg font-bold bg-slate-200 dark:bg-zinc-700">
                      {foundEnfant.prenom[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                      {foundEnfant.prenom} {foundEnfant.nom}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">
                      {foundEnfant.age} ans · Né(e) le {new Date(foundEnfant.dateNaissance).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-zinc-400 text-center">
                Est-ce bien votre enfant ?
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFoundEnfant(null);
                  setCode('');
                }}
              >
                Non, annuler
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handleConfirmLink}
              >
                Oui, confirmer
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <IoLinkOutline className="h-5 w-5" />
                Lier mon enfant
              </DialogTitle>
              <DialogDescription>
                Entrez le code confidentiel fourni par la crèche pour lier votre enfant à votre compte.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-4">
              {/* Code Input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Code confidentiel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleVerifyCode();
                    }
                  }}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-zinc-700 rounded-md text-center font-mono text-2xl font-bold tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-zinc-800"
                  placeholder="ABC123"
                  maxLength={6}
                />
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 text-center">
                  Code à 6 caractères (lettres et chiffres)
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-lg p-3 flex items-start gap-2">
                  <IoAlertCircleOutline className="h-5 w-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-lg p-3">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Vous n'avez pas reçu de code ? Contactez votre crèche pour obtenir le code confidentiel de votre enfant.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Annuler
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handleVerifyCode}
                disabled={code.length !== 6}
              >
                Vérifier le code
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
