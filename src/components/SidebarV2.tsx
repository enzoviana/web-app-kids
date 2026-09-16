import React, { useState, useMemo } from 'react';
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
} from 'react-icons/io5';
import { useAuth } from '@/hooks/useAuth';
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

// Menus mis à jour strictement alignés avec les routes créées
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

// Configuration du thème dynamique selon le rôle (couleurs de liseré et d'accents raffinés)
const roleTheme: Record<UserRole, {
  label: string;
  badgeClass: string;
  avatarBg: string;
  logoBg: string;
  activeItem: string;
  activeIndicator: string;
  badgeDot: string;
}> = {
  creche: {
    label: 'Espace Crèche',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    avatarBg: 'bg-emerald-600 text-white',
    logoBg: 'bg-emerald-600 text-white',
    activeItem: 'bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-semibold',
    activeIndicator: 'bg-emerald-600',
    badgeDot: 'bg-emerald-500',
  },
  medecin: {
    label: 'Espace Médecin',
    badgeClass: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400 border-sky-200 dark:border-sky-800',
    avatarBg: 'bg-sky-600 text-white',
    logoBg: 'bg-sky-600 text-white',
    activeItem: 'bg-sky-50/80 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200 font-semibold',
    activeIndicator: 'bg-sky-600',
    badgeDot: 'bg-sky-500',
  },
  rsai: {
    label: 'Espace RSAI',
    badgeClass: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-800',
    avatarBg: 'bg-fuchsia-600 text-white',
    logoBg: 'bg-fuchsia-600 text-white',
    activeItem: 'bg-fuchsia-50/80 dark:bg-fuchsia-950/30 text-fuchsia-900 dark:text-fuchsia-200 font-semibold',
    activeIndicator: 'bg-fuchsia-600',
    badgeDot: 'bg-fuchsia-500',
  },
  auxiliaire: {
    label: 'Espace Auxiliaire',
    badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    avatarBg: 'bg-indigo-600 text-white',
    logoBg: 'bg-indigo-600 text-white',
    activeItem: 'bg-indigo-50/80 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-semibold',
    activeIndicator: 'bg-indigo-600',
    badgeDot: 'bg-indigo-500',
  },
  parent: {
    label: 'Espace Parent',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    avatarBg: 'bg-amber-600 text-white',
    logoBg: 'bg-amber-600 text-white',
    activeItem: 'bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 font-semibold',
    activeIndicator: 'bg-amber-600',
    badgeDot: 'bg-amber-500',
  },
  superadmin: {
    label: 'Super Admin',
    badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    avatarBg: 'bg-purple-600 text-white',
    logoBg: 'bg-purple-600 text-white',
    activeItem: 'bg-purple-50/80 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 font-semibold',
    activeIndicator: 'bg-purple-600',
    badgeDot: 'bg-purple-500',
  },
  developpeur: {
    label: 'Développeur',
    badgeClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    avatarBg: 'bg-cyan-600 text-white',
    logoBg: 'bg-cyan-600 text-white',
    activeItem: 'bg-cyan-50/80 dark:bg-cyan-950/30 text-cyan-900 dark:text-cyan-200 font-semibold',
    activeIndicator: 'bg-cyan-600',
    badgeDot: 'bg-cyan-500',
  },
};

interface SidebarV2Props {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const SidebarV2: React.FC<SidebarV2Props> = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!user) return null;

  // Map backend role to frontend role for lookups
  const frontendRole = mapBackendRoleToRoute(user.role) as UserRole;

  // Calculate dynamic document badge count based on role
  const docsBadgeCount = useMemo(() => {
    if (user.role === 'parent') {
      // For parents: count documents en_attente, rejete, or expire_bientot for their children
      const parentEnfants = mockData.enfants.filter(e => e.parents_ids.includes(user.id));
      return mockData.documents.filter(d =>
        parentEnfants.some(e => e._id === d.enfant_id) &&
        ['en_attente', 'rejete', 'expire_bientot'].includes(d.statut)
      ).length;
    } else if (['super_admin', 'superadmin', 'admin_structure', 'creche', 'professionnel', 'auxiliaire'].includes(user.role)) {
      // For staff: count documents soumis (awaiting validation)
      return mockData.documents.filter(d => d.statut === 'soumis').length;
    }
    return 0;
  }, [user.id, user.role]);

  // Update menu items with dynamic badges
  const menuItems = useMemo(() => {
    const items = menuByRole[frontendRole] || [];
    return items.map(item => {
      if (item.id === 'documents' && docsBadgeCount > 0) {
        return { ...item, badge: docsBadgeCount.toString() };
      }
      return item;
    });
  }, [frontendRole, docsBadgeCount]);

  const theme = roleTheme[frontendRole];

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 76 : 260 }}
      transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
      className={cn(
        'h-screen bg-white dark:bg-zinc-900 border-r border-slate-200/80 dark:border-zinc-800 flex flex-col relative shrink-0 z-40 font-sans select-none shadow-xs'
      )}
    >
      {/* Bouton pour plier/déplier */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'absolute -right-3 top-6 z-50',
          'w-6 h-6 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-xs',
          'flex items-center justify-center',
          'hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors'
        )}
      >
        {collapsed ? (
          <IoChevronForward className="h-3 w-3 text-slate-600 dark:text-zinc-300" />
        ) : (
          <IoChevronBack className="h-3 w-3 text-slate-600 dark:text-zinc-300" />
        )}
      </button>

      {/* Header & Logo */}
      <div className="p-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center h-18">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center shadow-xs shrink-0 font-bold text-sm transition-colors',
            theme.logoBg
          )}>
            K
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="min-w-0"
              >
                <h1 className="text-sm font-bold text-slate-900 dark:text-zinc-100 tracking-tight truncate">
                  Kids'Med IA
                </h1>
                <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 border leading-none uppercase font-mono mt-0.5', theme.badgeClass)}>
                  {theme.label}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

{/* Profile Utilisateur */}
{!collapsed && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.05 }}
    className="p-3 border-b border-slate-100 dark:border-zinc-800/80"
  >
    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/80">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={cn('font-semibold text-xs', theme.avatarBg)}>
          {/* Correction sécurisée ici 👇 */}
          {user?.prenom?.[0] || user?.nom?.[0] || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
          {user?.prenom ? `${user.prenom} ${user.nom || ''}` : (user?.nom || 'Utilisateur')}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium truncate">MFA Actif · HDS</span>
        </div>
      </div>
    </div>
  </motion.div>
)}

      {/* Menu Principal de Navigation */}
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
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative overflow-hidden',
                  isActive
                    ? theme.activeItem
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-slate-900 dark:hover:text-zinc-100',
                  collapsed && 'justify-center px-0'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Indicateur vertical gauche style Linear/Vercel pour l'élément actif */}
                  {isActive && (
                    <div className={cn('absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full', theme.activeIndicator)} />
                  )}

                  <span className={cn(
                    'shrink-0 transition-colors',
                    isActive ? 'opacity-100 text-slate-900 dark:text-white' : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300'
                  )}>
                    {item.icon}
                  </span>

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.15 }}
                        className="flex-1 truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {item.badge && !collapsed && (
                    <span className={cn(
                      'ml-auto text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md text-white shadow-xs',
                      theme.badgeDot
                    )}>
                      {item.badge}
                    </span>
                  )}

                  {item.badge && collapsed && (
                    <span className={cn('absolute top-2 right-3 h-2 w-2 rounded-full', theme.badgeDot)} />
                  )}
                </>
              )}
            </NavLink>

            {/* Tooltip flottant ultra-pro si la sidebar est repliée */}
            {collapsed && hoveredId === item.id && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 bg-slate-900 dark:bg-zinc-800 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none flex items-center gap-2">
                <span>{item.label}</span>
                {item.badge && (
                  <span className={cn('text-[9px] font-mono px-1.5 py-0.2 rounded text-white', theme.badgeDot)}>
                    {item.badge}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Section Basse : Paramètres & Déconnexion */}
      <div className="p-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-1">
        <NavLink
          to={`/${user.role}/parametres`}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative',
              isActive
                ? theme.activeItem
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-slate-900 dark:hover:text-zinc-100',
              collapsed && 'justify-center px-0'
            )
          }
        >
          <IoSettingsOutline size={18} className="shrink-0 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300" />
          {!collapsed && (
            <span className="flex-1 truncate">Paramètres du compte</span>
          )}
        </NavLink>

        {/* Bouton de Déconnexion */}
        <button
          onClick={logout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors',
            collapsed && 'justify-center px-0'
          )}
        >
          <IoLogOutOutline size={18} className="shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>

      {/* Footer Version */}
      {!collapsed && (
        <div className="p-3 text-center bg-slate-50/50 dark:bg-zinc-900/50 border-t border-slate-100 dark:border-zinc-800">
          <p className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
            Kids'Med IA · v2.6 RGPD/HDS
          </p>
        </div>
      )}
    </motion.div>
  );
};