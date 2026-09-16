import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IoMailOutline,
  IoLockClosedOutline,
  IoArrowForward,
  IoEyeOutline,
  IoEyeOffOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5';
import { AppBackground } from '@/components/AppBackground';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { migrationApi } from '@/services/api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);

      toast.success('Connexion réussie !');

      // La redirection sera gérée par le router
      // qui vérifie le flag mustChangePassword
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.message || 'Email ou mot de passe incorrect';
      toast.error(errorMessage);
      console.error('Erreur de connexion:', err);
    }
  };

  // Fonction pour remplir automatiquement les identifiants de test
  const fillTestCredentials = (role: 'superadmin' | 'directeur' | 'rsai') => {
    const credentials = {
      superadmin: { email: 'superadmin@kidsmed.local', password: 'Admin123!' },
      directeur: { email: 'directeur@petitsloups.fr', password: 'Admin123!' },
      rsai: { email: 'rsai@demo.com', password: 'rsai123' },
    };

    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
  };

  // Fonction pour appliquer les migrations (SuperAdmin uniquement)
  const handleApplyMigrations = async () => {
    try {
      setIsMigrating(true);
      const result = await migrationApi.applyMigrations();
      toast.success('Migrations appliquées avec succès!');
      console.log('Migration output:', result.output);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors des migrations';
      toast.error(errorMessage);
      console.error('Migration error:', error);
    } finally {
      setIsMigrating(false);
    }
  };

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
          <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-zinc-400 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/50 dark:border-zinc-800/50 shadow-sm">
            Backend API · v1.0
          </span>
        </div>

        {/* Main Container */}
        <div className="w-full max-w-md mx-auto my-auto space-y-8 py-10">
          {/* Title Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Connexion
            </h1>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
              Connectez-vous avec vos identifiants pour accéder à votre espace.
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email Input */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-slate-700 dark:text-zinc-300"
              >
                Email
              </label>
              <div className="relative">
                <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-zinc-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.com"
                  required
                  className="w-full h-11 pl-10 pr-4 text-sm bg-white/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-cyan-400/50 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-slate-700 dark:text-zinc-300"
              >
                Mot de passe
              </label>
              <div className="relative">
                <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-zinc-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 pl-10 pr-12 text-sm bg-white/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-cyan-400/50 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? (
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
              disabled={isLoading || !email || !password}
              className="w-full h-11 text-xs font-semibold bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-white/90 disabled:opacity-40 transition-all shadow-md"
            >
              {isLoading ? (
                'Connexion en cours...'
              ) : (
                <>
                  Se connecter
                  <IoArrowForward className="ml-1.5 h-3.5 w-3.5" />
                </>
              )}
            </Button>

            <p className="text-center text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
              Accès sécurisé · Protocole de données de santé conforme HDS
            </p>
          </motion.form>

          {/* Test Accounts - DEV ONLY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-zinc-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white/60 dark:bg-zinc-900/60 text-slate-500 dark:text-zinc-400 font-medium">
                  Comptes de test
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillTestCredentials('superadmin')}
                className="px-3 py-2 text-xs font-medium bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => fillTestCredentials('directeur')}
                className="px-3 py-2 text-xs font-medium bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-950/50 transition-colors"
              >
                Directeur
              </button>
              <button
                type="button"
                onClick={() => fillTestCredentials('rsai')}
                className="px-3 py-2 text-xs font-medium bg-fuchsia-50 dark:bg-fuchsia-950/30 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-800 rounded-lg hover:bg-fuchsia-100 dark:hover:bg-fuchsia-950/50 transition-colors"
              >
                RSAI
              </button>
            </div>
          </motion.div>

         
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
