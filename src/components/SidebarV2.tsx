import React, { useState, useMemo, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoHomeOutline,
  IoDocumentTextOutline,
  IoPeopleOutline,
  IoCardOutline,
  IoShieldCheckmarkOutline,
  IoListOutline,
  IoTimeOutline,
  IoSparklesOutline,
  IoSettingsOutline,
  IoChevronBack,
  IoChevronForward,
  IoBandageOutline,
  IoLogOutOutline,
  IoWalletOutline,
  IoStatsChartOutline,
  IoPersonAddOutline,
  IoTerminalOutline,
  IoBugOutline,
  IoCodeSlashOutline,
  IoHelpCircleOutline,
  IoAnalyticsOutline,
  IoCalendarOutline,
  IoStarOutline,
  IoBusinessOutline,
  IoMoonOutline,
  IoSunnyOutline,
} from 'react-icons/io5';
import { useAuth } from '@/hooks/useAuth';
import { useRoleTheme } from '@/hooks/useRoleTheme';
import { useTheme } from '@/hooks/useTheme';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';
import { mockData } from '@/data/mockData';
import { mapBackendRoleToRoute } from '@/utils/roleMapper';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
}

const menuByRole: Record<UserRole, MenuItem[]> = {
  creche: [
    { id: 'dashboard', label: 'Tableau de bord', icon: <IoHomeOutline size={18} />, path: '/creche' },
    { id: 'enfants', label: 'Enfants', icon: <IoPeopleOutline size={18} />, path: '/creche/enfants' },
    { id: 'documents', label: 'Documents', icon: <IoDocumentTextOutline size={18} />, path: '/creche/documents' },
    { id: 'registre', label: 'Registre Médic.', icon: <IoBandageOutline size={18} />, path: '/creche/registre-medicaments' },
    { id: 'liaison', label: 'Cahier Liaison', icon: <IoListOutline size={18} />, path: '/creche/cahier-liaison' },
    { id: 'etablissement', label: 'Établissement', icon: <IoShieldCheckmarkOutline size={18} />, path: '/creche/etablissement' },
    { id: 'personnel', label: 'Personnel', icon: <IoPeopleOutline size={18} />, path: '/creche/personnel' },
    { id: 'abonnement', label: 'Abonnement', icon: <IoCardOutline size={18} />, path: '/creche/abonnement' },
  ],
  medecin: [
    { id: 'dashboard', label: 'Tableau de bord', icon: <IoHomeOutline size={18} />, path: '/medecin' },
    { id: 'patients', label: 'Patients', icon: <IoPeopleOutline size={18} />, path: '/medecin/patients' },
    { id: 'diagnostics', label: 'Diagnostics IA', icon: <IoSparklesOutline size={18} />, path: '/medecin/diagnostics-ia' },
    { id: 'ordonnances', label: 'Ordonnances', icon: <IoBandageOutline size={18} />, path: '/medecin/ordonnances' },
    { id: 'registre', label: 'Registre Médic.', icon: <IoDocumentTextOutline size={18} />, path: '/medecin/registre-medicaments' },
    { id: 'liaison', label: 'Cahier Liaison', icon: <IoListOutline size={18} />, path: '/medecin/cahier-liaison' },
  ],
  rsai: [
    { id: 'dashboard', label: 'Tableau de bord', icon: <IoHomeOutline size={18} />, path: '/rsai' },
    { id: 'enfants', label: 'Enfants', icon: <IoPeopleOutline size={18} />, path: '/rsai/enfants' },
    { id: 'documents', label: 'Documents', icon: <IoDocumentTextOutline size={18} />, path: '/rsai/documents' },
    { id: 'audit', label: 'Journal Audit', icon: <IoTimeOutline size={18} />, path: '/rsai/audit' },
    { id: 'missions', label: 'Mes Missions', icon: <IoCalendarOutline size={18} />, path: '/rsai/missions' },
    { id: 'notes', label: 'Notes', icon: <IoDocumentTextOutline size={18} />, path: '/rsai/notes' },
    { id: 'abonnement', label: 'Abonnement', icon: <IoStarOutline size={18} />, path: '/rsai/abonnement' },
  ],
  auxiliaire: [
    { id: 'dashboard', label: 'Tableau de bord', icon: <IoHomeOutline size={18} />, path: '/auxiliaire' },
    { id: 'enfants', label: 'Enfants', icon: <IoPeopleOutline size={18} />, path: '/auxiliaire/enfants' },
    { id: 'registre', label: 'Registre Médic.', icon: <IoBandageOutline size={18} />, path: '/auxiliaire/registre-medicaments' },
    { id: 'liaison', label: 'Cahier Liaison', icon: <IoListOutline size={18} />, path: '/auxiliaire/cahier-liaison' },
  ],
  parent: [
    { id: 'dashboard', label: 'Accueil', icon: <IoHomeOutline size={18} />, path: '/parent' },
    { id: 'documents', label: 'Documents', icon: <IoDocumentTextOutline size={18} />, path: '/parent/documents' },
  ],
  superadmin: [
    { id: 'dashboard', label: 'Tableau de bord', icon: <IoHomeOutline size={18} />, path: '/superadmin' },
    { id: 'enfants', label: 'Enfants', icon: <IoPeopleOutline size={18} />, path: '/superadmin/enfants' },
    { id: 'creches', label: 'Établissements', icon: <IoBusinessOutline size={18} />, path: '/superadmin/creches' },
    { id: 'comptes', label: 'Gestion Comptes', icon: <IoPersonAddOutline size={18} />, path: '/superadmin/comptes' },
    { id: 'tarifs', label: 'Tarifs', icon: <IoWalletOutline size={18} />, path: '/superadmin/tarifs' },
    { id: 'abonnements', label: 'Abonnements', icon: <IoCardOutline size={18} />, path: '/superadmin/abonnements' },
    { id: 'statistiques', label: 'Statistiques', icon: <IoStatsChartOutline size={18} />, path: '/superadmin/statistiques' },
  ],
  developpeur: [
    { id: 'dashboard', label: 'Console', icon: <IoHomeOutline size={18} />, path: '/developpeur' },
    { id: 'logs', label: 'Logs Système', icon: <IoTerminalOutline size={18} />, path: '/developpeur/logs' },
    { id: 'erreurs', label: 'Erreurs', icon: <IoBugOutline size={18} />, path: '/developpeur/erreurs' },
    { id: 'monitoring', label: 'Monitoring', icon: <IoAnalyticsOutline size={18} />, path: '/developpeur/monitoring' },
    { id: 'support', label: 'Support', icon: <IoHelpCircleOutline size={18} />, path: '/developpeur/support' },
    { id: 'api', label: 'API Docs', icon: <IoCodeSlashOutline size={18} />, path: '/developpeur/api-docs' },
  ],
};

interface SidebarV2Props {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const SidebarV2: React.FC<SidebarV2Props> = ({
  collapsed,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen,
}) => {
  const { user, logout } = useAuth();
  const roleTheme = useRoleTheme();
  const { theme, toggleTheme } = useTheme();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!user) return null;

  const handleMobileNavClick = () => {
    if (setMobileOpen && window.innerWidth < 768) {
      setMobileOpen(false);
    }
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const isCollapsed = isMobile ? false : collapsed;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const frontendRole = mapBackendRoleToRoute(user.role) as UserRole;

  const docsBadgeCount = useMemo(() => {
    if (user.role === 'parent') {
      const parentEnfants = mockData.enfants.filter((e) => e.parents_ids.includes(user.id));
      return mockData.documents.filter(
        (d) =>
          parentEnfants.some((e) => e._id === d.enfant_id) &&
          ['en_attente', 'rejete', 'expire_bientot'].includes(d.statut)
      ).length;
    } else if (
      ['super_admin', 'superadmin', 'admin_structure', 'creche', 'professionnel', 'auxiliaire'].includes(
        user.role
      )
    ) {
      return mockData.documents.filter((d) => d.statut === 'soumis').length;
    }
    return 0;
  }, [user.id, user.role]);

  const menuItems = useMemo(() => {
    const items = menuByRole[frontendRole] || [];
    return items.map((item) => {
      if (item.id === 'documents' && docsBadgeCount > 0) {
        return { ...item, badge: docsBadgeCount.toString() };
      }
      return item;
    });
  }, [frontendRole, docsBadgeCount]);

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 76 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn(
        // Fond opaque garanti (exit les transparences qui se superposent mal)
        'h-screen bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col shrink-0 font-sans select-none z-40 relative shadow-md',
        'fixed md:relative top-0 left-0 transition-transform duration-300 ease-in-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        'w-[260px] md:w-auto'
      )}
    >
      {/* Liseré latéral gauche aux couleurs dynamiques du rôle */}
    

      {/* Bouton de repli Desktop */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'absolute -right-3 top-6 z-50',
          'w-6 h-6 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-sm',
          'flex items-center justify-center',
          'hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors',
          'hidden md:flex'
        )}
      >
        {isCollapsed ? (
          <IoChevronForward className="h-3 w-3 text-slate-600 dark:text-zinc-300" />
        ) : (
          <IoChevronBack className="h-3 w-3 text-slate-600 dark:text-zinc-300" />
        )}
      </button>

      {/* Header & Logo */}
      <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center h-18 relative">
        <div className="flex items-center gap-3 overflow-hidden relative z-10 w-full">
          <div
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center shadow-md shrink-0 font-bold text-sm text-white',
              roleTheme.bg
            )}
          >
            K
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="min-w-0 flex-1"
              >
                <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  Kids'Med IA
                </h1>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[9px] px-1.5 py-0 border leading-none uppercase font-mono mt-0.5',
                    roleTheme.badgeBg,
                    roleTheme.badgeText,
                    roleTheme.badgeBorder
                  )}
                >
                  {roleTheme.label}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Profil Utilisateur */}
      {!isCollapsed && (
        <div className="p-3 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className={cn('font-semibold text-xs text-white', roleTheme.bg)}>
                {user?.profile?.prenom?.[0] || user?.profile?.nom?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.profile?.prenom
                  ? `${user.profile.prenom} ${user.profile.nom || ''}`
                  : user?.profile?.nom || 'Utilisateur'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate">
                  Actif · HDS
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Principal de Navigation (Corrigé pour forcer la visibilité de la page active) */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <NavLink
              to={item.path}
              end={item.path === `/${user.role}`}
              onClick={handleMobileNavClick}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative',
                  isActive
                    ? cn(roleTheme.activeBg, roleTheme.activeText, 'font-bold shadow-xs')
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white',
                  isCollapsed && 'justify-center px-0'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div
                      className={cn('absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full', roleTheme.activeIndicator || roleTheme.bg)}
                    />
                  )}

                  <span
                    className={cn(
                      'shrink-0 transition-colors',
                      isActive
                        ? 'text-slate-900 dark:text-white font-bold'
                        : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300'
                    )}
                  >
                    {item.icon}
                  </span>

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -4 }}
                        transition={{ duration: 0.1 }}
                        className="flex-1 truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {item.badge && !isCollapsed && (
                    <span
                      className={cn(
                        'ml-auto text-[10px] font-mono font-bold px-2 py-0.5 rounded-md text-white shadow-xs',
                        roleTheme.bg
                      )}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.badge && isCollapsed && (
                    <span className={cn('absolute top-2 right-3 h-2 w-2 rounded-full', roleTheme.bg)} />
                  )}
                </>
              )}
            </NavLink>

            {/* Tooltip si sidebar repliée */}
            {isCollapsed && hoveredId === item.id && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none flex items-center gap-2">
                <span>{item.label}</span>
                {item.badge && (
                  <span className={cn('text-[9px] font-mono px-1.5 py-0.2 rounded text-white', roleTheme.bg)}>
                    {item.badge}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Section Basse : Toggle Thème, Paramètres & Déconnexion */}
      <div className="p-2 border-t border-slate-200 dark:border-zinc-800 space-y-1">
        <button
          onClick={toggleTheme}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative',
            'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white',
            isCollapsed && 'justify-center px-0'
          )}
          title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          {theme === 'dark' ? (
            <IoSunnyOutline size={18} className="shrink-0 text-amber-500" />
          ) : (
            <IoMoonOutline size={18} className="shrink-0 text-slate-600" />
          )}
          {!isCollapsed && (
            <span className="flex-1 truncate text-left">
              {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            </span>
          )}
        </button>

        <NavLink
          to={`/${user.role}/parametres`}
          onClick={handleMobileNavClick}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative',
              isActive
                ? cn(roleTheme.activeBg, roleTheme.activeText, 'font-bold shadow-xs')
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white',
              isCollapsed && 'justify-center px-0'
            )
          }
        >
          <IoSettingsOutline
            size={18}
            className="shrink-0 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300"
          />
          {!isCollapsed && <span className="flex-1 truncate">Paramètres du compte</span>}
        </NavLink>

        <button
          onClick={logout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors',
            isCollapsed && 'justify-center px-0'
          )}
        >
          <IoLogOutOutline size={18} className="shrink-0" />
          {!isCollapsed && <span>Déconnexion</span>}
        </button>
      </div>

      {/* Footer Version */}
      {!isCollapsed && (
        <div className="p-3 text-center bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-200 dark:border-zinc-800">
          <p className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
            Kids'Med IA · v2.6 RGPD/HDS
          </p>
        </div>
      )}
    </motion.div>
  );
};