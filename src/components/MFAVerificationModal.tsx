import React, { useState, useEffect, useRef } from 'react';
import {
  IoShieldCheckmarkOutline,
  IoCloseOutline,
  IoReloadOutline,
  IoMailOutline,
  IoChatbubbleEllipsesOutline,
  IoTimeOutline,
  IoWarningOutline,
} from 'react-icons/io5';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { sendMFACode, verifyMFACode, IS_DEMO_MODE, DEMO_MFA_CODE } from '@/services/mfaService';

interface MFAVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (mfaToken: string) => void;
  userId: string;
  userEmail?: string;
  userTel?: string;
  method: 'sms' | 'email';
  userName?: string;
}

export const MFAVerificationModal: React.FC<MFAVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
  userEmail,
  userTel,
  method,
  userName,
}) => {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Envoyer le code automatiquement à l'ouverture de la modal
  useEffect(() => {
    if (isOpen) {
      handleSendCode();
    }
  }, [isOpen]);

  // Gestion du compte à rebours pour renvoyer le code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown]);

  // Focus automatique sur le premier champ à l'ouverture
  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  const handleSendCode = async () => {
    setError(null);
    setCanResend(false);

    // En mode démo, pas de compte à rebours
    if (!IS_DEMO_MODE) {
      setCountdown(60); // 60 secondes en production
    }

    await sendMFACode(userId, method, userEmail, userTel);
  };

  const handleChange = (index: number, value: string) => {
    // Autoriser uniquement les chiffres
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Prendre seulement le dernier caractère
    setCode(newCode);
    setError(null);

    // Focus automatique sur le champ suivant
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Vérification automatique quand les 6 chiffres sont saisis
    if (index === 5 && value) {
      const fullCode = [...newCode.slice(0, 5), value].join('');
      handleVerify(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Si le champ est vide et on appuie sur Backspace, retourner au champ précédent
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    // Vérifier si c'est un code à 6 chiffres
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();

      // Vérification automatique
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (fullCode?: string) => {
    const codeToVerify = fullCode || code.join('');

    if (codeToVerify.length !== 6) {
      setError('Veuillez saisir les 6 chiffres du code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    const result = await verifyMFACode(userId, codeToVerify);

    setIsVerifying(false);

    if (result.success && result.token) {
      onSuccess(result.token);
    } else {
      setError(result.message || 'Code incorrect ou expiré');
      // Réinitialiser le code en cas d'erreur
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendCode = () => {
    if (canResend || IS_DEMO_MODE) {
      setCode(['', '', '', '', '', '']);
      setError(null);
      handleSendCode();
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <IoShieldCheckmarkOutline className="h-6 w-6 text-emerald-600" />
              Vérification de sécurité
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
          {/* Mode Démo Badge */}
          {IS_DEMO_MODE && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <IoWarningOutline className="h-5 w-5 text-amber-600 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900 dark:text-amber-300">Mode Démo Actif</p>
                <p className="text-amber-700 dark:text-amber-400">
                  Code de test : <span className="font-mono font-bold">{DEMO_MFA_CODE}</span>
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-zinc-400">
              {method === 'email' ? (
                <IoMailOutline className="h-5 w-5" />
              ) : (
                <IoChatbubbleEllipsesOutline className="h-5 w-5" />
              )}
              <p className="text-sm">
                Un code de vérification a été envoyé {userName ? `à ${userName}` : ''}
              </p>
            </div>
            <p className="text-sm text-slate-500 dark:text-zinc-500">
              {method === 'email'
                ? `par email à ${userEmail || 'votre adresse email'}`
                : `par SMS au ${userTel || 'votre numéro de téléphone'}`}
            </p>
          </div>

          {/* Code Input Fields */}
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isVerifying}
                className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <IoWarningOutline className="h-5 w-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Resend Code */}
          <div className="text-center space-y-3">
            {!IS_DEMO_MODE && countdown > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <IoTimeOutline className="h-4 w-4" />
                <span>Renvoyer le code dans {countdown}s</span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleResendCode}
              disabled={!canResend && !IS_DEMO_MODE}
              className="gap-2"
            >
              <IoReloadOutline className="h-4 w-4" />
              Renvoyer le code
            </Button>
          </div>

          {/* Verify Button */}
          <Button
            onClick={() => handleVerify()}
            disabled={code.join('').length !== 6 || isVerifying}
            className="w-full gap-2"
            size="lg"
          >
            {isVerifying ? (
              <>
                <IoReloadOutline className="h-5 w-5 animate-spin" />
                Vérification en cours...
              </>
            ) : (
              <>
                <IoShieldCheckmarkOutline className="h-5 w-5" />
                Valider le code
              </>
            )}
          </Button>

          {/* Security Info */}
          <div className="text-center text-xs text-slate-500 dark:text-zinc-500 space-y-1">
            <p>🔒 Connexion sécurisée - Conformité RGPD/HDS</p>
            <p>Ce code est valide pendant 5 minutes</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
