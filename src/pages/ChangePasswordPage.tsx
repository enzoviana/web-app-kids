import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IoLockClosedOutline,
  IoCheckmarkCircleOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5';
import { AppBackground } from '@/components/AppBackground';
import { Button } from '@/components/ui/button';
import { authApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const validatePassword = (password: string): boolean => {
    // Au moins 8 caractères, une majuscule, une minuscule, un chiffre
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return minLength && hasUpperCase && hasLowerCase && hasNumber;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!validatePassword(newPassword)) {
      const msg = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = 'Les mots de passe ne correspondent pas';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (currentPassword === newPassword) {
      const msg = 'Le nouveau mot de passe doit être différent de l\'ancien';
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      setIsLoading(true);

      await authApi.changePassword(currentPassword, newPassword);

      toast.success('Mot de passe changé avec succès !');
      setSuccess(true);

      // Forcer la mise à jour de l'utilisateur dans le contexte
      // en rechargeant les infos utilisateur
      const response = await authApi.getMe();
      if (response.data) {
        // L'utilisateur a changé son mot de passe, mustChangePassword est maintenant false
        // Rediriger vers le dashboard
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erreur lors du changement de mot de passe';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('❌ Erreur changement mot de passe:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Déconnecter l'utilisateur s'il refuse de changer son mot de passe
    logout();
  };

  if (success) {
    return (
      <AppBackground>
        <div className="min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 max-w-md"
          >
            <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center">
              <IoCheckmarkCircleOutline className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
              Mot de passe changé !
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              Votre mot de passe a été modifié avec succès. Redirection en cours...
            </p>
          </motion.div>
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <div className="min-h-screen text-slate-900 dark:text-zinc-100 flex flex-col justify-between p-6 font-sans antialiased">
        {/* Brand Header */}
        <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-900/90 dark:bg-zinc-100/90 backdrop-blur-md flex items-center justify-center text-white dark:text-zinc-900 font-bold text-sm shadow-sm">
              K
            </div>
            <span className="font-bold tracking-tight text-sm text-slate-900 dark:text-zinc-100">
              Kids'Med IA
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
          >
            Se déconnecter
          </button>
        </div>

        {/* Main Container */}
        <div className="w-full max-w-md mx-auto my-auto space-y-8 py-10">
          {/* Title Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/40 rounded-xl flex items-center justify-center">
              <IoLockClosedOutline className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Changement de mot de passe requis
            </h1>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
              Pour des raisons de sécurité, vous devez changer votre mot de passe avant de continuer.
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Current Password */}
            <div className="space-y-2">
              <label
                htmlFor="currentPassword"
                className="text-xs font-semibold text-slate-700 dark:text-zinc-300"
              >
                Mot de passe actuel
              </label>
              <div className="relative">
                <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-zinc-500" />
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 pl-10 pr-12 text-sm bg-white/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:focus:ring-orange-400/50 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {showCurrentPassword ? (
                    <IoEyeOffOutline className="h-5 w-5" />
                  ) : (
                    <IoEyeOutline className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label
                htmlFor="newPassword"
                className="text-xs font-semibold text-slate-700 dark:text-zinc-300"
              >
                Nouveau mot de passe
              </label>
              <div className="relative">
                <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-zinc-500" />
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 pl-10 pr-12 text-sm bg-white/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:focus:ring-orange-400/50 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {showNewPassword ? (
                    <IoEyeOffOutline className="h-5 w-5" />
                  ) : (
                    <IoEyeOutline className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                Minimum 8 caractères, avec majuscules, minuscules et chiffres
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-xs font-semibold text-slate-700 dark:text-zinc-300"
              >
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-zinc-500" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 pl-10 pr-12 text-sm bg-white/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:focus:ring-orange-400/50 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {showConfirmPassword ? (
                    <IoEyeOffOutline className="h-5 w-5" />
                  ) : (
                    <IoEyeOutline className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2"
              >
                <IoAlertCircleOutline className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-300 font-medium">{error}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full h-11 text-xs font-semibold bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-40 transition-all shadow-md"
            >
              {isLoading ? 'Changement en cours...' : 'Changer le mot de passe'}
            </Button>
          </motion.form>
        </div>

        {/* Footer */}
        <div className="w-full max-w-5xl mx-auto text-center border-t border-slate-200/30 dark:border-zinc-800/30 pt-4">
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            Kids'Med IA © 2026 · Plateforme de gestion sanitaire de la petite enfance
          </p>
        </div>
      </div>
    </AppBackground>
  );
};
