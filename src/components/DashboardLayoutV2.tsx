import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { IoMenu, IoClose } from 'react-icons/io5';
import { SidebarV2 } from './SidebarV2';
import { Button } from './ui/button';

const pageTitles: Record<string, string> = {
  // Crèche
  '/creche': 'Tableau de bord',
  '/creche/enfants': 'Enfants',
  '/creche/documents': 'Documents',
  '/creche/registre-medicaments': 'Registre Médicaments',
  '/creche/cahier-liaison': 'Cahier de Liaison',
  '/creche/etablissement': 'Établissement',
  '/creche/personnel': 'Personnel',
  '/creche/abonnement': 'Abonnement',
  '/creche/parametres': 'Paramètres',
  // Médecin
  '/medecin': 'Tableau de bord',
  '/medecin/patients': 'Patients',
  '/medecin/diagnostics-ia': 'Diagnostics IA',
  '/medecin/ordonnances': 'Ordonnances',
  '/medecin/registre-medicaments': 'Registre Médicaments',
  '/medecin/cahier-liaison': 'Cahier de Liaison',
  '/medecin/parametres': 'Paramètres',
  // RSAI
  '/rsai': 'Tableau de bord',
  '/rsai/enfants': 'Enfants',
  '/rsai/documents': 'Documents',
  '/rsai/audit': 'Journal d\'Audit',
  '/rsai/missions': 'Mes Missions',
  '/rsai/notes': 'Notes',
  '/rsai/abonnement': 'Abonnement',
  '/rsai/parametres': 'Paramètres',
  // Auxiliaire
  '/auxiliaire': 'Tableau de bord',
  '/auxiliaire/enfants': 'Enfants',
  '/auxiliaire/registre-medicaments': 'Registre Médicaments',
  '/auxiliaire/cahier-liaison': 'Cahier de Liaison',
  '/auxiliaire/parametres': 'Paramètres',
  // Parent
  '/parent': 'Accueil',
  '/parent/documents': 'Documents',
  '/parent/parametres': 'Paramètres',
  // SuperAdmin
  '/superadmin': 'Tableau de bord',
  '/superadmin/enfants': 'Enfants',
  '/superadmin/creches': 'Établissements',
  '/superadmin/comptes': 'Gestion Comptes',
  '/superadmin/tarifs': 'Tarifs',
  '/superadmin/abonnements': 'Abonnements',
  '/superadmin/statistiques': 'Statistiques',
  '/superadmin/parametres': 'Paramètres',
  // Développeur
  '/developpeur': 'Console',
  '/developpeur/logs': 'Logs Système',
  '/developpeur/erreurs': 'Erreurs',
  '/developpeur/monitoring': 'Monitoring',
  '/developpeur/support': 'Support',
  '/developpeur/api-docs': 'API Docs',
  '/developpeur/parametres': 'Paramètres',
};

export const DashboardLayoutV2: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Déterminer le titre de la page
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0A0F17]">
      {/* Mobile TopBar - visible uniquement sur mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 z-50 flex items-center px-4 gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="h-10 w-10"
        >
          {mobileMenuOpen ? (
            <IoClose className="h-6 w-6 text-slate-700 dark:text-zinc-300" />
          ) : (
            <IoMenu className="h-6 w-6 text-slate-700 dark:text-zinc-300" />
          )}
        </Button>
        <div className="flex-1 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
            K
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Kids'Med IA</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">{pageTitle}</p>
          </div>
        </div>
      </div>

      {/* Backdrop pour mobile quand le menu est ouvert */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <SidebarV2
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0 mt-16 md:mt-0">
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
