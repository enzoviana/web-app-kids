import { useMemo } from 'react';
import { useAuth } from './useAuth';
import type { UserRole } from '@/types';

/**
 * Hook pour obtenir le thème de couleur selon le rôle de l'utilisateur
 * Basé sur le design system Kids'Med IA:
 * - Crèche: Lime (#8BC34A)
 * - Médecin: Cyan (#0099FF)
 * - RSAI: Magenta (#FF007A)
 */

export interface RoleTheme {
  // Couleur principale du rôle
  color: string;
  colorHex: string;

  // Variantes de couleur
  colorLight: string;
  colorDark: string;

  // Classes Tailwind
  bg: string;
  bgHover: string;
  bgLight: string;
  text: string;
  textLight: string;
  border: string;
  borderHover: string;

  // Shadow/Glow effects
  shadow: string;
  glow: string;

  // Badge
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;

  // Active states (pour navigation)
  activeBg: string;
  activeText: string;
  activeIndicator: string;

  // Label du rôle
  label: string;
}

const roleThemes: Record<UserRole | 'default', RoleTheme> = {
  creche: {
    color: 'lime',
    colorHex: '#8BC34A',
    colorLight: '#C5E1A5',
    colorDark: '#689F38',

    bg: 'bg-lime-500',
    bgHover: 'hover:bg-lime-600',
    bgLight: 'bg-lime-50',
    text: 'text-lime-600',
    textLight: 'text-lime-500',
    border: 'border-lime-200',
    borderHover: 'hover:border-lime-500',

    shadow: 'shadow-lime-500/20',
    glow: 'shadow-glow-lime',

    badgeBg: 'bg-lime-50 dark:bg-lime-950/30',
    badgeText: 'text-lime-700 dark:text-lime-400',
    badgeBorder: 'border-lime-200 dark:border-lime-800',

    activeBg: 'bg-lime-50/80 dark:bg-lime-950/30',
    activeText: 'text-lime-900 dark:text-lime-200',
    activeIndicator: 'bg-lime-600',

    label: 'Espace Crèche',
  },

  medecin: {
    color: 'cyan',
    colorHex: '#0099FF',
    colorLight: '#69C0FF',
    colorDark: '#0066BB',

    bg: 'bg-cyan-500',
    bgHover: 'hover:bg-cyan-600',
    bgLight: 'bg-cyan-50',
    text: 'text-cyan-600',
    textLight: 'text-cyan-500',
    border: 'border-cyan-200',
    borderHover: 'hover:border-cyan-500',

    shadow: 'shadow-cyan-500/20',
    glow: 'shadow-glow-cyan',

    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/30',
    badgeText: 'text-cyan-700 dark:text-cyan-400',
    badgeBorder: 'border-cyan-200 dark:border-cyan-800',

    activeBg: 'bg-cyan-50/80 dark:bg-cyan-950/30',
    activeText: 'text-cyan-900 dark:text-cyan-200',
    activeIndicator: 'bg-cyan-600',

    label: 'Espace Médecin',
  },

  rsai: {
    color: 'magenta',
    colorHex: '#FF007A',
    colorLight: '#FF6BAD',
    colorDark: '#CC0062',

    bg: 'bg-magenta-500',
    bgHover: 'hover:bg-magenta-600',
    bgLight: 'bg-magenta-50',
    text: 'text-magenta-600',
    textLight: 'text-magenta-500',
    border: 'border-magenta-200',
    borderHover: 'hover:border-magenta-500',

    shadow: 'shadow-magenta-500/20',
    glow: 'shadow-glow-magenta',

    badgeBg: 'bg-magenta-50 dark:bg-magenta-950/30',
    badgeText: 'text-magenta-700 dark:text-magenta-400',
    badgeBorder: 'border-magenta-200 dark:border-magenta-800',

    activeBg: 'bg-magenta-50/80 dark:bg-magenta-950/30',
    activeText: 'text-magenta-900 dark:text-magenta-200',
    activeIndicator: 'bg-magenta-600',

    label: 'Espace RSAI',
  },

  auxiliaire: {
    color: 'cyan',
    colorHex: '#0099FF',
    colorLight: '#69C0FF',
    colorDark: '#0066BB',

    bg: 'bg-cyan-500',
    bgHover: 'hover:bg-cyan-600',
    bgLight: 'bg-cyan-50',
    text: 'text-cyan-600',
    textLight: 'text-cyan-500',
    border: 'border-cyan-200',
    borderHover: 'hover:border-cyan-500',

    shadow: 'shadow-cyan-500/20',
    glow: 'shadow-glow-cyan',

    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/30',
    badgeText: 'text-cyan-700 dark:text-cyan-400',
    badgeBorder: 'border-cyan-200 dark:border-cyan-800',

    activeBg: 'bg-cyan-50/80 dark:bg-cyan-950/30',
    activeText: 'text-cyan-900 dark:text-cyan-200',
    activeIndicator: 'bg-cyan-600',

    label: 'Espace Auxiliaire',
  },

  parent: {
    color: 'cyan',
    colorHex: '#0099FF',
    colorLight: '#69C0FF',
    colorDark: '#0066BB',

    bg: 'bg-cyan-500',
    bgHover: 'hover:bg-cyan-600',
    bgLight: 'bg-cyan-50',
    text: 'text-cyan-600',
    textLight: 'text-cyan-500',
    border: 'border-cyan-200',
    borderHover: 'hover:border-cyan-500',

    shadow: 'shadow-cyan-500/20',
    glow: 'shadow-glow-cyan',

    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/30',
    badgeText: 'text-cyan-700 dark:text-cyan-400',
    badgeBorder: 'border-cyan-200 dark:border-cyan-800',

    activeBg: 'bg-cyan-50/80 dark:bg-cyan-950/30',
    activeText: 'text-cyan-900 dark:text-cyan-200',
    activeIndicator: 'bg-cyan-600',

    label: 'Espace Parent',
  },

  superadmin: {
    color: 'magenta',
    colorHex: '#FF007A',
    colorLight: '#FF6BAD',
    colorDark: '#CC0062',

    bg: 'bg-magenta-500',
    bgHover: 'hover:bg-magenta-600',
    bgLight: 'bg-magenta-50',
    text: 'text-magenta-600',
    textLight: 'text-magenta-500',
    border: 'border-magenta-200',
    borderHover: 'hover:border-magenta-500',

    shadow: 'shadow-magenta-500/20',
    glow: 'shadow-glow-magenta',

    badgeBg: 'bg-magenta-50 dark:bg-magenta-950/30',
    badgeText: 'text-magenta-700 dark:text-magenta-400',
    badgeBorder: 'border-magenta-200 dark:border-magenta-800',

    activeBg: 'bg-magenta-50/80 dark:bg-magenta-950/30',
    activeText: 'text-magenta-900 dark:text-magenta-200',
    activeIndicator: 'bg-magenta-600',

    label: 'Super Admin',
  },

  developpeur: {
    color: 'cyan',
    colorHex: '#0099FF',
    colorLight: '#69C0FF',
    colorDark: '#0066BB',

    bg: 'bg-cyan-500',
    bgHover: 'hover:bg-cyan-600',
    bgLight: 'bg-cyan-50',
    text: 'text-cyan-600',
    textLight: 'text-cyan-500',
    border: 'border-cyan-200',
    borderHover: 'hover:border-cyan-500',

    shadow: 'shadow-cyan-500/20',
    glow: 'shadow-glow-cyan',

    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/30',
    badgeText: 'text-cyan-700 dark:text-cyan-400',
    badgeBorder: 'border-cyan-200 dark:border-cyan-800',

    activeBg: 'bg-cyan-50/80 dark:bg-cyan-950/30',
    activeText: 'text-cyan-900 dark:text-cyan-200',
    activeIndicator: 'bg-cyan-600',

    label: 'Développeur',
  },

  default: {
    color: 'cyan',
    colorHex: '#0099FF',
    colorLight: '#69C0FF',
    colorDark: '#0066BB',

    bg: 'bg-cyan-500',
    bgHover: 'hover:bg-cyan-600',
    bgLight: 'bg-cyan-50',
    text: 'text-cyan-600',
    textLight: 'text-cyan-500',
    border: 'border-cyan-200',
    borderHover: 'hover:border-cyan-500',

    shadow: 'shadow-cyan-500/20',
    glow: 'shadow-glow-cyan',

    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/30',
    badgeText: 'text-cyan-700 dark:text-cyan-400',
    badgeBorder: 'border-cyan-200 dark:border-cyan-800',

    activeBg: 'bg-cyan-50/80 dark:bg-cyan-950/30',
    activeText: 'text-cyan-900 dark:text-cyan-200',
    activeIndicator: 'bg-cyan-600',

    label: 'Kids\'Med IA',
  },
};

export function useRoleTheme(): RoleTheme {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user || !user.role) {
      return roleThemes.default;
    }

    // Map backend role to theme
    const role = user.role as UserRole;
    return roleThemes[role] || roleThemes.default;
  }, [user]);
}

/**
 * Helper pour obtenir le thème d'un rôle spécifique sans authentification
 */
export function getRoleTheme(role: UserRole): RoleTheme {
  return roleThemes[role] || roleThemes.default;
}
