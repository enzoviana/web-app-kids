import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  IoMoon,
  IoSunny,
  IoLogOut,
  IoNotifications,
  IoSearchOutline,
  IoSettingsOutline,
  IoHelpCircleOutline,
} from 'react-icons/io5';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  // Crèche
  '/creche': { title: 'Tableau de bord', subtitle: 'Vue d\'ensemble de votre crèche' },
  '/creche/enfants': { title: 'Enfants', subtitle: 'Gestion des enfants présents' },
  '/creche/documents': { title: 'Gestion Documentaire', subtitle: 'Conformité et documents obligatoires' },
  '/creche/registre-medicaments': { title: 'Registre Médicaments', subtitle: 'Traçabilité des administrations' },
  '/creche/cahier-liaison': { title: 'Cahier de Liaison', subtitle: 'Transmissions quotidiennes' },
  '/creche/etablissement': { title: 'Établissement', subtitle: 'Configuration et sections' },
  '/creche/personnel': { title: 'Personnel', subtitle: 'Équipe et habilitations' },
  '/creche/messagerie': { title: 'Messagerie Sécurisée', subtitle: 'Messages chiffrés HDS' },
  '/creche/notifications': { title: 'Notifications', subtitle: 'Centre d\'alertes' },
  '/creche/abonnement': { title: 'Abonnement', subtitle: 'Gérer votre forfait' },
  '/creche/parametres': { title: 'Paramètres', subtitle: 'Configuration de votre compte' },

  // Médecin
  '/medecin': { title: 'Tableau de bord', subtitle: 'Vue d\'ensemble patients' },
  '/medecin/patients': { title: 'Patients', subtitle: 'Liste de vos patients' },
  '/medecin/diagnostics-ia': { title: 'Diagnostics IA', subtitle: 'Assistant diagnostic pédiatrique' },
  '/medecin/ordonnances': { title: 'Ordonnances', subtitle: 'Prescriptions médicales' },
  '/medecin/registre-medicaments': { title: 'Registre Médicaments', subtitle: 'Administrations médicamenteuses' },
  '/medecin/cahier-liaison': { title: 'Cahier de Liaison', subtitle: 'Transmissions sanitaires' },
  '/medecin/messagerie': { title: 'Messagerie Sécurisée', subtitle: 'Messages chiffrés HDS' },
  '/medecin/notifications': { title: 'Notifications', subtitle: 'Centre d\'alertes' },
  '/medecin/parametres': { title: 'Paramètres', subtitle: 'Configuration de votre compte' },

  // RSAI
  '/rsai': { title: 'Tableau de bord', subtitle: 'Inspections et conformité' },
  '/rsai/enfants': { title: 'Enfants', subtitle: 'Registres santé' },
  '/rsai/documents': { title: 'Documents', subtitle: 'Conformité administrative' },
  '/rsai/audit': { title: 'Journal d\'Audit', subtitle: 'Traçabilité HDS' },
  '/rsai/roles-permissions': { title: 'Rôles & Permissions', subtitle: 'Contrôle d\'accès RBAC' },
  '/rsai/etablissement': { title: 'Établissement', subtitle: 'Configuration et sections' },
  '/rsai/personnel': { title: 'Personnel', subtitle: 'Équipe et habilitations' },
  '/rsai/messagerie': { title: 'Messagerie Sécurisée', subtitle: 'Messages chiffrés HDS' },
  '/rsai/notifications': { title: 'Notifications', subtitle: 'Centre d\'alertes' },
  '/rsai/parametres': { title: 'Paramètres', subtitle: 'Configuration de votre compte' },

  // Auxiliaire
  '/auxiliaire': { title: 'Tableau de bord', subtitle: 'Ma section' },
  '/auxiliaire/enfants': { title: 'Enfants', subtitle: 'Enfants de ma section' },
  '/auxiliaire/registre-medicaments': { title: 'Registre Médicaments', subtitle: 'Administrations du jour' },
  '/auxiliaire/cahier-liaison': { title: 'Cahier de Liaison', subtitle: 'Transmissions quotidiennes' },
  '/auxiliaire/messagerie': { title: 'Messagerie', subtitle: 'Messages sécurisés' },
  '/auxiliaire/notifications': { title: 'Notifications', subtitle: 'Mes alertes' },
  '/auxiliaire/parametres': { title: 'Paramètres', subtitle: 'Mon compte' },

  // Parent
  '/parent': { title: 'Portail Parent', subtitle: 'Suivi de mon enfant' },
  '/parent/documents': { title: 'Documents', subtitle: 'Dossier administratif' },
  '/parent/messagerie': { title: 'Messagerie', subtitle: 'Contact avec la crèche' },
  '/parent/notifications': { title: 'Notifications', subtitle: 'Actualités' },
  '/parent/parametres': { title: 'Paramètres', subtitle: 'Mon compte' },
};

export const TopbarV2: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  // Déterminer le titre dynamiquement
  const pageInfo = pageTitles[location.pathname] || { title: 'Dashboard', subtitle: '' };

  // Pour les pages enfants détails
  const isEnfantDetails = location.pathname.includes('/enfants/');
  const displayTitle = isEnfantDetails ? 'Fiche Enfant' : pageInfo.title;
  const displaySubtitle = isEnfantDetails ? 'Détails et dossier médical' : pageInfo.subtitle;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/60 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Title section */}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              {displayTitle}
            </h1>
            {displaySubtitle && (
              <p className="text-sm text-slate-500 mt-0.5">
                {displaySubtitle}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              {searchOpen ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    autoFocus
                    onBlur={() => setSearchOpen(false)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </motion.div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  className="h-10 w-10"
                >
                  <IoSearchOutline className="h-5 w-5 text-slate-600" />
                </Button>
              )}
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative h-10 w-10">
              <IoNotifications className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
            </Button>

            {/* Help */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hidden lg:inline-flex"
            >
              <IoHelpCircleOutline className="h-5 w-5 text-slate-600" />
            </Button>

            {/* Divider */}
            <div className="h-8 w-px bg-slate-200" />

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-10 w-10"
            >
              {theme === 'dark' ? (
                <IoSunny className="h-5 w-5 text-slate-600" />
              ) : (
                <IoMoon className="h-5 w-5 text-slate-600" />
              )}
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/${user?.role}/parametres`)}
              className="h-10 w-10"
            >
              <IoSettingsOutline className="h-5 w-5 text-slate-600" />
            </Button>

            {/* User Avatar Dropdown */}
            <div className="flex items-center gap-2 pl-2">
              <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                <AvatarFallback className="bg-primary text-white font-semibold text-sm">
                  {user?.prenom ? user.prenom[0] : user?.nom[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Logout */}
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-10 w-10 text-error hover:text-error hover:bg-error/10"
            >
              <IoLogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
