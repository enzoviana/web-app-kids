import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authApi, apiUtils } from '@/services/api';
import { UserRole } from '@/types';

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
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Stocker les tokens
      apiUtils.setTokens(tokens.accessToken, tokens.refreshToken);

      // Mettre à jour l'état utilisateur
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
        isAuthenticated: !!user,
        isLoading,
        error,
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
