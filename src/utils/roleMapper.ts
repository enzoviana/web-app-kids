/**
 * Utility to map backend roles to frontend route roles
 * Backend uses snake_case (super_admin) while frontend uses routes without underscores
 */

export type BackendRole = 'superadmin' | 'developpeur' | 'creche' | 'medecin' | 'rsai' | 'auxiliaire' | 'parent';
export type FrontendRole = 'superadmin' | 'developpeur' | 'creche' | 'medecin' | 'rsai' | 'auxiliaire' | 'parent';

/**
 * Maps backend role to frontend route
 */
export const mapBackendRoleToRoute = (backendRole: string): string => {
  const roleMap: Record<string, string> = {
    'superadmin': 'superadmin',
    'super_admin': 'superadmin',
    'developpeur': 'developpeur',
    'creche': 'creche',
    'admin_structure': 'creche',
    'medecin': 'medecin',
    'rsai': 'rsai',
    'auxiliaire': 'auxiliaire',
    'professionnel': 'auxiliaire',
    'parent': 'parent',
  };

  return roleMap[backendRole] || 'parent';
};

/**
 * Checks if user role matches the required route role
 */
export const roleMatches = (userRole: string, requiredRole: string): boolean => {
  const mappedUserRole = mapBackendRoleToRoute(userRole);
  return mappedUserRole === requiredRole;
};

/**
 * Maps frontend role to backend role for API calls
 */
export const mapFrontendRoleToBackend = (frontendRole: string): BackendRole => {
  const roleMap: Record<string, BackendRole> = {
    'superadmin': 'superadmin',
    'developpeur': 'developpeur',
    'creche': 'creche',
    'medecin': 'medecin',
    'rsai': 'rsai',
    'auxiliaire': 'auxiliaire',
    'parent': 'parent',
  };

  return roleMap[frontendRole] || 'parent';
};
