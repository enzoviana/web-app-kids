import React from 'react';
import { useLocation } from 'react-router-dom';
import { IoMoon, IoSunny, IoLogOut, IoNotifications } from 'react-icons/io5';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

// Page titles based on route
const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/creche': { title: 'Tableau de bord', subtitle: 'Vue d\'ensemble de votre crèche' },
  '/creche/enfants': { title: 'Enfants', subtitle: 'Gestion des enfants présents' },
  '/creche/documents': { title: 'Gestion Documentaire', subtitle: 'Conformité et documents obligatoires' },
  '/creche/alertes': { title: 'Alertes', subtitle: 'Notifications et alertes actives' },
  '/creche/notes': { title: 'Notes & Observations', subtitle: 'Notes internes et globales' },
  '/creche/ia': { title: 'Assistant IA', subtitle: 'Diagnostic intelligent' },
  '/creche/abonnement': { title: 'Abonnement', subtitle: 'Gérer votre forfait' },
  '/creche/parametres': { title: 'Paramètres', subtitle: 'Configuration de votre compte' },

  '/medecin': { title: 'Tableau de bord', subtitle: 'Vue d\'ensemble patients' },
  '/medecin/patients': { title: 'Patients', subtitle: 'Liste de vos patients' },
  '/medecin/diagnostics': { title: 'Diagnostics IA', subtitle: 'Historique des diagnostics' },
  '/medecin/ordonnances': { title: 'Ordonnances', subtitle: 'Gestion des prescriptions' },
  '/medecin/agenda': { title: 'Agenda', subtitle: 'Rendez-vous et consultations' },
  '/medecin/statistiques': { title: 'Statistiques', subtitle: 'Analyse de votre pratique' },
  '/medecin/parametres': { title: 'Paramètres', subtitle: 'Configuration de votre compte' },

  '/rsai': { title: 'Tableau de bord', subtitle: 'Inspections et conformité' },
  '/rsai/registres': { title: 'Registres Santé', subtitle: 'Dossiers des enfants' },
  '/rsai/inspections': { title: 'Inspections', subtitle: 'Historique des contrôles' },
  '/rsai/logs': { title: 'Logs Sécurité', subtitle: 'Journal d\'accès' },
  '/rsai/rapports': { title: 'Rapports', subtitle: 'Documents et exports' },
  '/rsai/parametres': { title: 'Paramètres', subtitle: 'Configuration de votre compte' },
};

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const location = useLocation();

  const pageInfo = pageTitles[location.pathname] || { title: 'Dashboard', subtitle: '' };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-dark-secondary/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Title section */}
        <div>
          <h1 className="text-2xl font-black text-text dark:text-text-inverse tracking-tight">
            {pageInfo.title}
          </h1>
          {pageInfo.subtitle && (
            <p className="text-sm font-semibold text-text-secondary dark:text-text-tertiary mt-0.5">
              {pageInfo.subtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-10 h-10 rounded-full bg-surface-secondary dark:bg-surface-dark-tertiary flex items-center justify-center hover:shadow-glow-cyan transition-shadow"
            aria-label="Notifications"
          >
            <IoNotifications className="text-cyan" size={20} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-magenta text-white text-[10px] font-black rounded-full flex items-center justify-center">
              3
            </span>
          </motion.button>

          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-surface-secondary dark:bg-surface-dark-tertiary flex items-center justify-center hover:shadow-glow-cyan transition-shadow"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <IoSunny className="text-cyan" size={20} />
            ) : (
              <IoMoon className="text-cyan" size={20} />
            )}
          </motion.button>

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="w-10 h-10 rounded-full bg-magenta/10 border border-magenta/30 flex items-center justify-center hover:bg-magenta/20 transition-colors"
            aria-label="Logout"
          >
            <IoLogOut className="text-magenta" size={20} />
          </motion.button>
        </div>
      </div>
    </header>
  );
};
