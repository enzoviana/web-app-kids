import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authApi, apiUtils } from '@/services/api';
import { UserRole } from '@/types';
import { requiresMFA } from '@/services/mfaService';
import { verifierEtBloquerSiHorsHoraires } from '@/services/horaireService';

interface User {
  id: string;
  email: string;
  role: UserRole;
  profile: {
    prenom: string;
    nom: string;
    tel?: string;
    photo?: string;
  };
  mustChangePassword: boolean;
  // MFA fields
  mfa_enabled?: boolean;
  mfa_method?: 'sms' | 'email';
}

interface MFAPendingData {
  userId: string;
  email: string;
  tel?: string;
  role: UserRole;
  method: 'sms' | 'email';
  userName: string;
  tempTokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

interface HoraireBlockedData {
  role: UserRole;
  message: string;
  prochaineCreneau?: string;
  heureActuelle: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    prenom: string;
    nom: string;
    tel?: string;
  }) => Promise<void>;
  completeMFA: (mfaToken: string) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  mfaPending: MFAPendingData | null;
  clearMFAPending: () => void;
  horaireBlocked: HoraireBlockedData | null;
  clearHoraireBlocked: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mfaPending, setMfaPending] = useState<MFAPendingData | null>(null);
  const [horaireBlocked, setHoraireBlocked] = useState<HoraireBlockedData | null>(null);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = apiUtils.getAccessToken();

      if (token) {
        try {
          // Récupérer les infos utilisateur depuis le backend
          const response = await authApi.getMe();
          setUser(response.data);
        } catch (err) {
          // Token expiré ou invalide, nettoyer
          apiUtils.clearTokens();
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      // Appeler l'API de login
      const response = await authApi.login(email, password);
      const { user: userData, tokens } = response.data;

      // 1. VÉRIFIER LES HORAIRES D'ACCÈS EN PREMIER
      const horaireCheck = await verifierEtBloquerSiHorsHoraires(userData.id, userData.role);

      if (!horaireCheck.autorise) {
        // Accès bloqué par horaire
        console.log('🕐 Accès refusé - Hors horaires pour le rôle:', userData.role);

        const now = new Date();
        setHoraireBlocked({
          role: userData.role,
          message: horaireCheck.message || 'Accès refusé en dehors des horaires autorisés',
          prochaineCreneau: undefined, // Sera calculé par le service
          heureActuelle: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        });

        // Ne pas finaliser la connexion
        setIsLoading(false);
        return;
      }

      // 2. VÉRIFIER SI MFA EST REQUIS
      const needsMFA = requiresMFA(userData.role);

      if (needsMFA && userData.mfa_enabled !== false) {
        // MFA requis : ne pas stocker les tokens définitifs, juste temporairement
        console.log('🔐 MFA requis pour le rôle:', userData.role);

        // Définir les données en attente de MFA
        setMfaPending({
          userId: userData.id,
          email: userData.email,
          tel: userData.profile?.tel,
          role: userData.role,
          method: userData.mfa_method || 'email', // Défaut email si non défini
          userName: `${userData.profile?.prenom} ${userData.profile?.nom}`,
          tempTokens: tokens,
        });

        // Ne pas finaliser la connexion
        setIsLoading(false);
        return;
      }

      // 3. PAS DE RESTRICTION : CONNEXION NORMALE
      apiUtils.setTokens(tokens.accessToken, tokens.refreshToken);
      setUser(userData);

      console.log('✅ Connexion réussie:', userData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erreur de connexion';
      setError(errorMessage);
      console.error('❌ Erreur login:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const completeMFA = async (mfaToken: string) => {
    try {
      setError(null);
      setIsLoading(true);

      if (!mfaPending) {
        throw new Error('Aucune session MFA en attente');
      }

      // Stocker les tokens définitifs
      if (mfaPending.tempTokens) {
        apiUtils.setTokens(mfaPending.tempTokens.accessToken, mfaPending.tempTokens.refreshToken);
      }

      // Récupérer les données utilisateur complètes
      const response = await authApi.getMe();
      const userData = response.data;

      setUser(userData);
      setMfaPending(null);

      console.log('✅ MFA validé - Connexion réussie:', userData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erreur lors de la validation MFA';
      setError(errorMessage);
      console.error('❌ Erreur MFA:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMFAPending = () => {
    setMfaPending(null);
    setError(null);
  };

  const clearHoraireBlocked = () => {
    setHoraireBlocked(null);
    setError(null);
  };

  const register = async (data: {
    email: string;
    password: string;
    prenom: string;
    nom: string;
    tel?: string;
  }) => {
    try {
      setError(null);
      setIsLoading(true);

      // Appeler l'API de register
      const response = await authApi.register(data);
      const { user: userData, tokens } = response.data;

      // Stocker les tokens
      apiUtils.setTokens(tokens.accessToken, tokens.refreshToken);

      // Mettre à jour l'état utilisateur
      setUser(userData);

      console.log('✅ Inscription réussie:', userData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erreur d\'inscription';
      setError(errorMessage);
      console.error('❌ Erreur register:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = apiUtils.getRefreshToken();

      if (refreshToken) {
        // Appeler l'API de logout
        await authApi.logout(refreshToken);
      }
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      // Nettoyer l'état local
      apiUtils.clearTokens();
      setUser(null);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        completeMFA,
        isAuthenticated: !!user,
        isLoading,
        error,
        mfaPending,
        clearMFAPending,
        horaireBlocked,
        clearHoraireBlocked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
