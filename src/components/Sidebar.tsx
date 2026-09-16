import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IoGridOutline,
  IoGrid,
  IoFolderOutline,
  IoFolder,
  IoSettingsOutline,
  IoSettings,
  IoPeopleOutline,
  IoPeople,
  IoStatsChartOutline,
  IoStatsChart,
  IoIdCardOutline,
  IoIdCard,
  IoCalendarOutline,
  IoCalendar,
  IoShieldCheckmarkOutline,
  IoShieldCheckmark,
  IoListOutline,
  IoList,
  IoPulseOutline,
  IoPulse,
  IoSparklesOutline,
  IoSparkles,
  IoWarningOutline,
  IoWarning,
  IoLogOutOutline,
  IoDocumentTextOutline,
  IoDocumentText,
} from 'react-icons/io5';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  path: string;
  section: 'main' | 'tools' | 'system';
  badge?: string;
  badgeVariant?: 'neutral' | 'accent' | 'warning';
}

const roleLabels: Record<UserRole, string> = {
  creche: 'Établissement Crèche',
  medecin: 'Cabinet Médical',
  rsai: 'Auditeur RSAI',
  auxiliaire: 'Auxiliaire Petite Enfance',
  parent: 'Espace Parents',
  superadmin: 'Super Administrateur',
  developpeur: 'Console Développeur',
};

const menuByRole: Record<UserRole, MenuItem[]> = {
  creche: [
    { id: 'dashboard', label: 'Vue d\'ensemble', icon: <IoGridOutline size={18} />, activeIcon: <IoGrid size={18} />, path: '/creche', section: 'main' },
    { id: 'enfants', label: 'Registre Enfants', icon: <IoPeopleOutline size={18} />, activeIcon: <IoPeople size={18} />, path: '/creche/enfants', section: 'main' },
    { id: 'documents', label: 'Dossiers & PAI', icon: <IoFolderOutline size={18} />, activeIcon: <IoFolder size={18} />, path: '/creche/documents', section: 'main', badge: '3', badgeVariant: 'warning' },
    { id: 'alertes', label: 'Alertes Sanitaires', icon: <IoWarningOutline size={18} />, activeIcon: <IoWarning size={18} />, path: '/creche/alertes', section: 'main' },
    { id: 'notes', label: 'Transmissions', icon: <IoDocumentTextOutline size={18} />, activeIcon: <IoDocumentText size={18} />, path: '/creche/notes', section: 'main' },
    { id: 'ia', label: 'Copilote IA', icon: <IoSparklesOutline size={18} />, activeIcon: <IoSparkles size={18} />, path: '/creche/ia', section: 'tools', badge: 'PRO', badgeVariant: 'accent' },
    { id: 'abonnement', label: 'Facturation', icon: <IoIdCardOutline size={18} />, activeIcon: <IoIdCard size={18} />, path: '/creche/abonnement', section: 'system' },
    { id: 'parametres', label: 'Paramètres', icon: <IoSettingsOutline size={18} />, activeIcon: <IoSettings size={18} />, path: '/creche/parametres', section: 'system' },
  ],
  medecin: [
    { id: 'dashboard', label: 'Vue d\'ensemble', icon: <IoGridOutline size={18} />, activeIcon: <IoGrid size={18} />, path: '/medecin', section: 'main' },
    { id: 'patients', label: 'Patients', icon: <IoPeopleOutline size={18} />, activeIcon: <IoPeople size={18} />, path: '/medecin/patients', section: 'main' },
    { id: 'diagnostics', label: 'Analyse Médicale', icon: <IoPulseOutline size={18} />, activeIcon: <IoPulse size={18} />, path: '/medecin/diagnostics', section: 'tools' },
    { id: 'ordonnances', label: 'Prescriptions', icon: <IoDocumentTextOutline size={18} />, activeIcon: <IoDocumentText size={18} />, path: '/medecin/ordonnances', section: 'main' },
    { id: 'agenda', label: 'Planning', icon: <IoCalendarOutline size={18} />, activeIcon: <IoCalendar size={18} />, path: '/medecin/agenda', section: 'main' },
    { id: 'statistiques', label: 'Épidémiologie', icon: <IoStatsChartOutline size={18} />, activeIcon: <IoStatsChart size={18} />, path: '/medecin/statistiques', section: 'tools' },
    { id: 'parametres', label: 'Paramètres', icon: <IoSettingsOutline size={18} />, activeIcon: <IoSettings size={18} />, path: '/medecin/parametres', section: 'system' },
  ],
  rsai: [
    { id: 'dashboard', label: 'Tableau de bord', icon: <IoGridOutline size={18} />, activeIcon: <IoGrid size={18} />, path: '/rsai', section: 'main' },
    { id: 'registres', label: 'Registres Santé', icon: <IoListOutline size={18} />, activeIcon: <IoList size={18} />, path: '/rsai/registres', section: 'main' },
    { id: 'inspections', label: 'Audits PMI', icon: <IoShieldCheckmarkOutline size={18} />, activeIcon: <IoShieldCheckmark size={18} />, path: '/rsai/inspections', section: 'main' },
    { id: 'rapports', label: 'Conformité', icon: <IoDocumentTextOutline size={18} />, activeIcon: <IoDocumentText size={18} />, path: '/rsai/rapports', section: 'tools' },
    { id: 'parametres', label: 'Paramètres', icon: <IoSettingsOutline size={18} />, activeIcon: <IoSettings size={18} />, path: '/rsai/parametres', section: 'system' },
  ],
  auxiliaire: [
    { id: 'dashboard', label: 'Tableau de bord', icon: <IoGridOutline size={18} />, activeIcon: <IoGrid size={18} />, path: '/auxiliaire', section: 'main' },
    { id: 'enfants', label: 'Enfants', icon: <IoPeopleOutline size={18} />, activeIcon: <IoPeople size={18} />, path: '/auxiliaire/enfants', section: 'main' },
    { id: 'parametres', label: 'Paramètres', icon: <IoSettingsOutline size={18} />, activeIcon: <IoSettings size={18} />, path: '/auxiliaire/parametres', section: 'system' },
  ],
  parent: [],
  superadmin: [
    { id: 'dashboard', label: 'Tableau de bord', icon: <IoGridOutline size={18} />, activeIcon: <IoGrid size={18} />, path: '/superadmin', section: 'main' },
    { id: 'comptes', label: 'Gestion Comptes', icon: <IoPeopleOutline size={18} />, activeIcon: <IoPeople size={18} />, path: '/superadmin/comptes', section: 'main' },
    { id: 'tarifs', label: 'Tarifs', icon: <IoIdCardOutline size={18} />, activeIcon: <IoIdCard size={18} />, path: '/superadmin/tarifs', section: 'main' },
    { id: 'parametres', label: 'Paramètres', icon: <IoSettingsOutline size={18} />, activeIcon: <IoSettings size={18} />, path: '/superadmin/parametres', section: 'system' },
  ],
  developpeur: [
    { id: 'dashboard', label: 'Console', icon: <IoGridOutline size={18} />, activeIcon: <IoGrid size={18} />, path: '/developpeur', section: 'main' },
    { id: 'logs', label: 'Logs Système', icon: <IoListOutline size={18} />, activeIcon: <IoList size={18} />, path: '/developpeur/logs', section: 'main' },
    { id: 'parametres', label: 'Paramètres', icon: <IoSettingsOutline size={18} />, activeIcon: <IoSettings size={18} />, path: '/developpeur/parametres', section: 'system' },
  ],
};

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const menuItems = menuByRole[user.role] || [];
  const initial = user.prenom ? user.prenom[0] : user.nom[0];
  const fullName = user.prenom ? `${user.prenom} ${user.nom}` : user.nom;

  const mainItems = menuItems.filter((i) => i.section === 'main');
  const toolItems = menuItems.filter((i) => i.section === 'tools');
  const systemItems = menuItems.filter((i) => i.section === 'system');

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const renderNavGroup = (title: string, items: MenuItem[]) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1 my-3">
        <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
          {title}
        </div>
        {items.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === `/${user.role}`}
            className={({ isActive }) =>
              `relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/50 hover:text-slate-900 dark:hover:text-zinc-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-2.5">
                  <span className={`transition-colors ${isActive ? 'text-white' : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200'}`}>
                    {isActive ? item.activeIcon : item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-medium ${
                      item.badgeVariant === 'warning'
                        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        : item.badgeVariant === 'accent'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    );
  };

  return (
    <aside className="w-64 h-screen bg-slate-50/80 dark:bg-zinc-950 border-r border-slate-200/80 dark:border-zinc-800/60 flex flex-col justify-between font-sans antialiased select-none backdrop-blur-md">
      
      {/* Upper Section */}
      <div className="flex flex-col px-3 py-4">
        
        {/* Brand Header */}
        <div className="px-3 pb-4 mb-2 border-b border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold text-xs flex items-center justify-center">
              K
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
              Kids'Med <span className="font-mono text-[10px] font-normal text-slate-400">OS</span>
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
            {roleLabels[user.role]}
          </span>
        </div>

        {/* Dynamic Nav Groups */}
        <nav className="space-y-1">
          {renderNavGroup('Menu', mainItems)}
          {renderNavGroup('Intelligence', toolItems)}
          {renderNavGroup('Configuration', systemItems)}
        </nav>
      </div>

      {/* User Footer Card */}
      <div className="p-3 border-t border-slate-200/60 dark:border-zinc-800/60">
        <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-zinc-700/50">
              {initial}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate leading-none">
                {fullName}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-1">
                Actif
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Déconnexion"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <IoLogOutOutline size={16} />
          </button>
        </div>
      </div>

    </aside>
  );
};