/**
 * Service de gestion de l'authentification MFA (Multi-Factor Authentication)
 * Gère le mode démo et le mode production
 */

import { authApi } from './api';
import { toast } from 'sonner';

// Détection du mode démo via variable d'environnement
export const IS_DEMO_MODE = 'true';

// Code MFA de démonstration (utilisé uniquement en mode démo)
export const DEMO_MFA_CODE = '123456';

// Durée de validité du code MFA (en minutes)
const MFA_CODE_VALIDITY_MINUTES = 5;

/**
 * Vérifie si un rôle nécessite MFA
 */
export function requiresMFA(role: string): boolean {
  const rolesWithMFA = ['medecin', 'superadmin', 'rsai'];
  return rolesWithMFA.includes(role);
}

/**
 * Envoie un code MFA à l'utilisateur
 * En mode démo, simule l'envoi et affiche un toast avec le code
 * En mode production, appelle l'API backend
 */
export async function sendMFACode(
  userId: string,
  method: 'sms' | 'email',
  userEmail?: string,
  userTel?: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (IS_DEMO_MODE) {
      // Mode démo : simulation
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simule une latence réseau

      toast.info('🔐 Mode Démo - MFA Simulé', {
        description: `Code de vérification : ${DEMO_MFA_CODE}\n(Valide pour ${MFA_CODE_VALIDITY_MINUTES} minutes)`,
        duration: 10000,
      });

      console.log('🔐 [DEMO MFA] Code envoyé (simulé):', {
        userId,
        method,
        code: DEMO_MFA_CODE,
        destination: method === 'email' ? userEmail : userTel,
      });

      return {
        success: true,
        message: `Code de vérification envoyé par ${method === 'email' ? 'email' : 'SMS'} (mode démo)`,
      };
    } else {
      // Mode production : appel API réel
      const response = await authApi.sendMFACode(userId, method);

      toast.success('Code de vérification envoyé', {
        description: `Un code a été envoyé par ${method === 'email' ? 'email' : 'SMS'}`,
        duration: 5000,
      });

      return {
        success: true,
        message: response.message || 'Code envoyé avec succès',
      };
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Erreur lors de l\'envoi du code';

    toast.error('Erreur MFA', {
      description: errorMessage,
    });

    return {
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * Vérifie le code MFA saisi par l'utilisateur
 * En mode démo, accepte automatiquement le code DEMO_MFA_CODE
 * En mode production, appelle l'API backend
 */
export async function verifyMFACode(
  userId: string,
  code: string
): Promise<{ success: boolean; message: string; token?: string }> {
  try {
    if (IS_DEMO_MODE) {
      // Mode démo : validation du code démo
      await new Promise((resolve) => setTimeout(resolve, 600)); // Simule une latence réseau

      if (code === DEMO_MFA_CODE) {
        toast.success('✅ Code MFA validé (démo)', {
          description: 'Connexion sécurisée établie',
        });

        console.log('🔐 [DEMO MFA] Code validé avec succès');

        return {
          success: true,
          message: 'Code MFA validé avec succès',
          token: 'demo-mfa-token-' + Date.now(), // Token factice pour le mode démo
        };
      } else {
        toast.error('❌ Code MFA incorrect', {
          description: `En mode démo, utilisez le code : ${DEMO_MFA_CODE}`,
          duration: 6000,
        });

        return {
          success: false,
          message: 'Code incorrect',
        };
      }
    } else {
      // Mode production : appel API réel
      const response = await authApi.verifyMFACode(userId, code);

      toast.success('✅ Code MFA validé', {
        description: 'Connexion sécurisée établie',
      });

      return {
        success: true,
        message: 'Code MFA validé avec succès',
        token: response.data?.mfaToken,
      };
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Code incorrect ou expiré';

    toast.error('❌ Erreur de validation MFA', {
      description: errorMessage,
    });

    return {
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * Active le MFA pour l'utilisateur connecté
 */
export async function enableMFA(
  method: 'sms' | 'email',
  telephone?: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (IS_DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success('MFA activé (démo)', {
        description: `Authentification à deux facteurs activée via ${method === 'email' ? 'email' : 'SMS'}`,
      });

      return {
        success: true,
        message: 'MFA activé avec succès',
      };
    } else {
      const response = await authApi.enableMFA(method, telephone);

      toast.success('MFA activé', {
        description: response.message || 'Authentification à deux facteurs activée',
      });

      return {
        success: true,
        message: response.message || 'MFA activé avec succès',
      };
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Erreur lors de l\'activation du MFA';

    toast.error('Erreur', {
      description: errorMessage,
    });

    return {
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * Désactive le MFA pour l'utilisateur connecté
 */
export async function disableMFA(): Promise<{ success: boolean; message: string }> {
  try {
    if (IS_DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.info('MFA désactivé (démo)', {
        description: 'Authentification à deux facteurs désactivée',
      });

      return {
        success: true,
        message: 'MFA désactivé avec succès',
      };
    } else {
      const response = await authApi.disableMFA();

      toast.info('MFA désactivé', {
        description: response.message || 'Authentification à deux facteurs désactivée',
      });

      return {
        success: true,
        message: response.message || 'MFA désactivé avec succès',
      };
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'Erreur lors de la désactivation du MFA';

    toast.error('Erreur', {
      description: errorMessage,
    });

    return {
      success: false,
      message: errorMessage,
    };
  }
}
