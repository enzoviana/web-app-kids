import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backendkids.onrender.com/api';

/**
 * Instance Axios configurée pour l'API Kids'Med
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Intercepteur pour ajouter le token JWT à chaque requête
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Intercepteur pour gérer le refresh token automatiquement
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et pas déjà tenté de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Tenter de rafraîchir le token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        // Réessayer la requête originale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token expiré ou invalide, déconnecter l'utilisateur
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API d'authentification
 */
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (data: {
    email: string;
    password: string;
    prenom: string;
    nom: string;
    tel?: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: async (refreshToken: string) => {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // MFA Endpoints
  sendMFACode: async (userId: string, method: 'sms' | 'email') => {
    const response = await api.post('/auth/mfa/send-code', { userId, method });
    return response.data;
  },

  verifyMFACode: async (userId: string, code: string) => {
    const response = await api.post('/auth/mfa/verify-code', { userId, code });
    return response.data;
  },

  enableMFA: async (method: 'sms' | 'email', telephone?: string) => {
    const response = await api.post('/auth/mfa/enable', { method, telephone });
    return response.data;
  },

  disableMFA: async () => {
    const response = await api.post('/auth/mfa/disable');
    return response.data;
  },
};

/**
 * API de gestion des utilisateurs et profils
 */
export const userApi = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: {
    prenom?: string;
    nom?: string;
    tel?: string;
    adresse?: string;
    codePostal?: string;
    ville?: string;
    photo?: string;
    langue?: string;
    timezone?: string;
  }) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  getAllUsers: async (role?: string) => {
    const params = role ? { role } : {};
    const response = await api.get('/users', { params });
    return response.data;
  },

  toggleUserStatus: async (userId: string, isActive: boolean) => {
    const response = await api.patch(`/users/${userId}/status`, { isActive });
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  createUser: async (data: {
    email: string;
    password: string;
    prenom: string;
    nom: string;
    tel?: string;
    role: string;
    mustChangePassword?: boolean;
  }) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  updateUserProfile: async (userId: string, data: {
    prenom?: string;
    nom?: string;
    tel?: string;
    adresse?: string;
    codePostal?: string;
    ville?: string;
    photo?: string;
    langue?: string;
    timezone?: string;
  }) => {
    const response = await api.put(`/users/${userId}/profile`, data);
    return response.data;
  },
};

/**
 * API de gestion des enfants
 */
export const enfantApi = {
  createEnfant: async (data: any) => {
    const response = await api.post('/enfants', data);
    return response.data;
  },

  getAllEnfants: async () => {
    const response = await api.get('/enfants');
    return response.data;
  },

  getEnfantsByEtablissement: async (etablissementId: string) => {
    const response = await api.get(`/enfants/etablissement/${etablissementId}`);
    return response.data;
  },

  getEnfantById: async (enfantId: string) => {
    const response = await api.get(`/enfants/${enfantId}`);
    return response.data;
  },

  updateEnfant: async (enfantId: string, data: any) => {
    const response = await api.put(`/enfants/${enfantId}`, data);
    return response.data;
  },

  regenererCode: async (enfantId: string) => {
    const response = await api.post(`/enfants/${enfantId}/regenerer-code`);
    return response.data;
  },

  lierParent: async (code: string) => {
    const response = await api.post('/enfants/lier-parent', { code });
    return response.data;
  },

  deleteEnfant: async (enfantId: string) => {
    const response = await api.delete(`/enfants/${enfantId}`);
    return response.data;
  },
};

/**
 * API de gestion des documents
 */
export const documentApi = {
  demanderDocument: async (data: {
    enfantId: string;
    type: string;
    commentaire?: string;
  }) => {
    const response = await api.post('/documents/demander', data);
    return response.data;
  },

  uploadDocument: async (documentId: string, nom: string, fichierUrl: string) => {
    const response = await api.post(`/documents/${documentId}/upload`, {
      nom,
      fichierUrl,
    });
    return response.data;
  },

  validerDocument: async (documentId: string, dateExpiration?: string) => {
    const response = await api.post(`/documents/${documentId}/valider`, {
      dateExpiration,
    });
    return response.data;
  },

  rejeterDocument: async (documentId: string, commentaire: string) => {
    const response = await api.post(`/documents/${documentId}/rejeter`, {
      commentaire,
    });
    return response.data;
  },

  relancerDocument: async (documentId: string) => {
    const response = await api.post(`/documents/${documentId}/relancer`);
    return response.data;
  },

  getDocumentsByEnfant: async (enfantId: string) => {
    const response = await api.get(`/documents/enfant/${enfantId}`);
    return response.data;
  },

  getDocumentsByEtablissement: async (etablissementId: string) => {
    const response = await api.get(`/documents/etablissement/${etablissementId}`);
    return response.data;
  },

  uploadDirectDocument: async (data: {
    enfantId: string;
    type: string;
    nom: string;
    file: File;
    dateExpiration?: string;
  }) => {
    const formData = new FormData();
    formData.append('enfantId', data.enfantId);
    formData.append('type', data.type);
    formData.append('nom', data.nom);
    formData.append('fichier', data.file);
    if (data.dateExpiration) {
      formData.append('dateExpiration', data.dateExpiration);
    }

    const response = await api.post('/documents/upload-direct', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

/**
 * API de gestion des notifications
 */
export const notificationApi = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  getUnreadNotifications: async () => {
    const response = await api.get('/notifications/unread');
    return response.data;
  },

  countUnread: async () => {
    const response = await api.get('/notifications/count-unread');
    return response.data;
  },

  markAsRead: async (notificationId: string) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.post('/notifications/mark-all-read');
    return response.data;
  },

  deleteNotification: async (notificationId: string) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  deleteAllRead: async () => {
    const response = await api.delete('/notifications/delete-all-read');
    return response.data;
  },
};

/**
 * API de gestion du personnel
 */
export const personnelApi = {
  createPersonnel: async (data: any) => {
    const response = await api.post('/personnels', data);
    return response.data;
  },

  getPersonnelByEtablissement: async (etablissementId: string) => {
    const response = await api.get(`/personnels/etablissement/${etablissementId}`);
    return response.data;
  },

  getPersonnelById: async (personnelId: string) => {
    const response = await api.get(`/personnels/${personnelId}`);
    return response.data;
  },

  updatePersonnel: async (personnelId: string, data: any) => {
    const response = await api.put(`/personnels/${personnelId}`, data);
    return response.data;
  },

  deactivatePersonnel: async (personnelId: string) => {
    const response = await api.patch(`/personnels/${personnelId}/deactivate`);
    return response.data;
  },

  deletePersonnel: async (personnelId: string) => {
    const response = await api.delete(`/personnels/${personnelId}`);
    return response.data;
  },

  getPersonnelStats: async (etablissementId: string) => {
    const response = await api.get(`/personnels/stats/${etablissementId}`);
    return response.data;
  },
};

/**
 * API de gestion des médicaments
 */
export const medicamentApi = {
  createMedicament: async (data: any) => {
    const response = await api.post('/medicaments', data);
    return response.data;
  },

  getMedicamentsByEtablissement: async (etablissementId: string, actifs = true) => {
    const response = await api.get(`/medicaments/etablissement/${etablissementId}`, {
      params: { actifs },
    });
    return response.data;
  },

  getMedicamentsByEnfant: async (enfantId: string, actifs = true) => {
    const response = await api.get(`/medicaments/enfant/${enfantId}`, {
      params: { actifs },
    });
    return response.data;
  },

  getMedicamentById: async (medicamentId: string) => {
    const response = await api.get(`/medicaments/${medicamentId}`);
    return response.data;
  },

  updateMedicament: async (medicamentId: string, data: any) => {
    const response = await api.put(`/medicaments/${medicamentId}`, data);
    return response.data;
  },

  deactivateMedicament: async (medicamentId: string) => {
    const response = await api.patch(`/medicaments/${medicamentId}/deactivate`);
    return response.data;
  },

  deleteMedicament: async (medicamentId: string) => {
    const response = await api.delete(`/medicaments/${medicamentId}`);
    return response.data;
  },

  createAdministration: async (medicamentId: string, data: any) => {
    const response = await api.post(`/medicaments/${medicamentId}/administrations`, data);
    return response.data;
  },

  getAdministrationsByMedicament: async (medicamentId: string) => {
    const response = await api.get(`/medicaments/${medicamentId}/administrations`);
    return response.data;
  },

  getAdministrationsToday: async (etablissementId: string) => {
    const response = await api.get(`/medicaments/today/${etablissementId}`);
    return response.data;
  },

  getMedicamentStats: async (etablissementId: string) => {
    const response = await api.get(`/medicaments/stats/${etablissementId}`);
    return response.data;
  },
};

/**
 * API de gestion des transmissions (cahier de liaison)
 */
export const transmissionApi = {
  createTransmission: async (data: any) => {
    const response = await api.post('/transmissions', data);
    return response.data;
  },

  getTransmissionsByEtablissement: async (
    etablissementId: string,
    filters?: {
      type?: string;
      destinataire?: string;
      enfantId?: string;
      dateDebut?: string;
      dateFin?: string;
    }
  ) => {
    const response = await api.get(`/transmissions/etablissement/${etablissementId}`, {
      params: filters,
    });
    return response.data;
  },

  getTransmissionsToday: async (etablissementId: string) => {
    const response = await api.get(`/transmissions/today/${etablissementId}`);
    return response.data;
  },

  getTransmissionsByEnfant: async (enfantId: string) => {
    const response = await api.get(`/transmissions/enfant/${enfantId}`);
    return response.data;
  },

  getTransmissionStats: async (etablissementId: string) => {
    const response = await api.get(`/transmissions/stats/${etablissementId}`);
    return response.data;
  },

  getTransmissionById: async (transmissionId: string) => {
    const response = await api.get(`/transmissions/${transmissionId}`);
    return response.data;
  },

  deleteTransmission: async (transmissionId: string) => {
    const response = await api.delete(`/transmissions/${transmissionId}`);
    return response.data;
  },
};

/**
 * API de gestion des sections
 */
export const sectionApi = {
  createSection: async (data: any) => {
    const response = await api.post('/sections', data);
    return response.data;
  },

  getSectionsByEtablissement: async (etablissementId: string) => {
    const response = await api.get(`/sections/etablissement/${etablissementId}`);
    return response.data;
  },

  getSectionStats: async (etablissementId: string) => {
    const response = await api.get(`/sections/stats/${etablissementId}`);
    return response.data;
  },

  getSectionById: async (sectionId: string) => {
    const response = await api.get(`/sections/${sectionId}`);
    return response.data;
  },

  updateSection: async (sectionId: string, data: any) => {
    const response = await api.put(`/sections/${sectionId}`, data);
    return response.data;
  },

  deleteSection: async (sectionId: string) => {
    const response = await api.delete(`/sections/${sectionId}`);
    return response.data;
  },
};

/**
 * API de gestion de la messagerie
 */
export const messageApi = {
  createMessage: async (data: any) => {
    const response = await api.post('/messages', data);
    return response.data;
  },

  getMessagesRecus: async (filters?: {
    type?: string;
    lu?: boolean;
    archive?: boolean;
  }) => {
    const response = await api.get('/messages/recus', {
      params: filters,
    });
    return response.data;
  },

  getMessagesEnvoyes: async (filters?: {
    type?: string;
  }) => {
    const response = await api.get('/messages/envoyes', {
      params: filters,
    });
    return response.data;
  },

  markAsRead: async (messageId: string) => {
    const response = await api.patch(`/messages/${messageId}/read`);
    return response.data;
  },

  archiveMessage: async (messageId: string) => {
    const response = await api.patch(`/messages/${messageId}/archive`);
    return response.data;
  },

  deleteMessage: async (messageId: string) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  countUnread: async () => {
    const response = await api.get('/messages/count-unread');
    return response.data;
  },
};

/**
 * API de gestion des ordonnances
 */
export const ordonnanceApi = {
  createOrdonnance: async (data: any) => {
    const response = await api.post('/ordonnances', data);
    return response.data;
  },

  getOrdonnancesByEnfant: async (enfantId: string) => {
    const response = await api.get(`/ordonnances/enfant/${enfantId}`);
    return response.data;
  },

  getOrdonnancesByMedecin: async (medecinId: string) => {
    const response = await api.get(`/ordonnances/medecin/${medecinId}`);
    return response.data;
  },

  getOrdonnanceById: async (ordonnanceId: string) => {
    const response = await api.get(`/ordonnances/${ordonnanceId}`);
    return response.data;
  },

  updateOrdonnance: async (ordonnanceId: string, data: any) => {
    const response = await api.put(`/ordonnances/${ordonnanceId}`, data);
    return response.data;
  },

  deleteOrdonnance: async (ordonnanceId: string) => {
    const response = await api.delete(`/ordonnances/${ordonnanceId}`);
    return response.data;
  },

  getOrdonnanceStats: async (etablissementId: string) => {
    const response = await api.get(`/ordonnances/stats/${etablissementId}`);
    return response.data;
  },
};

/**
 * API de gestion des diagnostics IA
 */
export const diagnosticApi = {
  createDiagnostic: async (data: any) => {
    const response = await api.post('/diagnostics', data);
    return response.data;
  },

  getDiagnosticsByEnfant: async (enfantId: string) => {
    const response = await api.get(`/diagnostics/enfant/${enfantId}`);
    return response.data;
  },

  getDiagnosticById: async (diagnosticId: string) => {
    const response = await api.get(`/diagnostics/${diagnosticId}`);
    return response.data;
  },

  deleteDiagnostic: async (diagnosticId: string) => {
    const response = await api.delete(`/diagnostics/${diagnosticId}`);
    return response.data;
  },

  getDiagnosticStats: async (etablissementId: string) => {
    const response = await api.get(`/diagnostics/stats/${etablissementId}`);
    return response.data;
  },
};

/**
 * API de gestion des abonnements
 */
export const abonnementApi = {
  createAbonnement: async (data: any) => {
    const response = await api.post('/abonnements', data);
    return response.data;
  },

  getAbonnementByEtablissement: async (etablissementId: string) => {
    const response = await api.get(`/abonnements/etablissement/${etablissementId}`);
    return response.data;
  },

  getAllAbonnements: async (filters?: {
    statut?: string;
    plan?: string;
  }) => {
    const response = await api.get('/abonnements', {
      params: filters,
    });
    return response.data;
  },

  updateAbonnement: async (abonnementId: string, data: any) => {
    const response = await api.put(`/abonnements/${abonnementId}`, data);
    return response.data;
  },

  suspendreAbonnement: async (abonnementId: string, raison: string) => {
    const response = await api.post(`/abonnements/${abonnementId}/suspendre`, {
      raison,
    });
    return response.data;
  },

  reactiverAbonnement: async (abonnementId: string) => {
    const response = await api.post(`/abonnements/${abonnementId}/reactiver`);
    return response.data;
  },

  getAbonnementStats: async () => {
    const response = await api.get('/abonnements/stats');
    return response.data;
  },
};

/**
 * API de gestion des tarifs
 */
export const tarifApi = {
  getTarifsActifs: async () => {
    const response = await api.get('/tarifs/actifs');
    return response.data;
  },

  getAllTarifs: async () => {
    const response = await api.get('/tarifs');
    return response.data;
  },

  getTarifByPlan: async (plan: string) => {
    const response = await api.get(`/tarifs/plan/${plan}`);
    return response.data;
  },

  createTarif: async (data: any) => {
    const response = await api.post('/tarifs', data);
    return response.data;
  },

  updateTarif: async (tarifId: string, data: any) => {
    const response = await api.put(`/tarifs/${tarifId}`, data);
    return response.data;
  },

  desactiverTarif: async (tarifId: string) => {
    const response = await api.patch(`/tarifs/${tarifId}/desactiver`);
    return response.data;
  },

  deleteTarif: async (tarifId: string) => {
    const response = await api.delete(`/tarifs/${tarifId}`);
    return response.data;
  },
};

/**
 * API de gestion des établissements
 */
export const etablissementApi = {
  getEtablissementById: async (etablissementId: string) => {
    const response = await api.get(`/etablissements/${etablissementId}`);
    return response.data;
  },

  getAllEtablissements: async (filters?: {
    isActive?: boolean;
    ville?: string;
  }) => {
    const response = await api.get('/etablissements', {
      params: filters,
    });
    return response.data;
  },

  createEtablissement: async (data: {
    nom: string;
    type: string;
    adresse: string;
    codePostal: string;
    ville: string;
    telephone?: string;
    email?: string;
    numeroAgrement?: string;
    capaciteAccueil: number;
    horaires?: any;
  }) => {
    const response = await api.post('/etablissements', data);
    return response.data;
  },

  updateEtablissement: async (etablissementId: string, data: any) => {
    const response = await api.put(`/etablissements/${etablissementId}`, data);
    return response.data;
  },

  deactivateEtablissement: async (etablissementId: string) => {
    const response = await api.patch(`/etablissements/${etablissementId}/deactivate`);
    return response.data;
  },

  deleteEtablissement: async (etablissementId: string) => {
    const response = await api.delete(`/etablissements/${etablissementId}`);
    return response.data;
  },

  getEtablissementStats: async (etablissementId: string) => {
    const response = await api.get(`/etablissements/${etablissementId}/stats`);
    return response.data;
  },
};

/**
 * API de gestion des documents obligatoires personnalisés
 */
export const documentObligatoireApi = {
  getDocumentsObligatoiresByEtablissement: async (etablissementId: string) => {
    const response = await api.get(`/documents-obligatoires/etablissement/${etablissementId}`);
    return response.data;
  },

  createDocumentObligatoire: async (data: {
    etablissementId: string;
    nom: string;
    description?: string;
    typeDocument: string;
  }) => {
    const response = await api.post('/documents-obligatoires', data);
    return response.data;
  },

  updateDocumentObligatoire: async (id: string, data: any) => {
    const response = await api.put(`/documents-obligatoires/${id}`, data);
    return response.data;
  },

  deleteDocumentObligatoire: async (id: string) => {
    const response = await api.delete(`/documents-obligatoires/${id}`);
    return response.data;
  },

  deactivateDocumentObligatoire: async (id: string) => {
    const response = await api.patch(`/documents-obligatoires/${id}/deactivate`);
    return response.data;
  },
};

/**
 * API de gestion des logs système
 */
export const logApi = {
  createLog: async (data: any) => {
    const response = await api.post('/logs', data);
    return response.data;
  },

  getLogs: async (filters?: {
    type?: string;
    module?: string;
    userId?: string;
    dateDebut?: string;
    dateFin?: string;
    limit?: number;
  }) => {
    const response = await api.get('/logs', {
      params: filters,
    });
    return response.data;
  },

  getLogsByType: async (type: string, limit = 100) => {
    const response = await api.get(`/logs/type/${type}`, {
      params: { limit },
    });
    return response.data;
  },

  getLogsByUser: async (userId: string, limit = 100) => {
    const response = await api.get(`/logs/user/${userId}`, {
      params: { limit },
    });
    return response.data;
  },

  getLogStats: async (dateDebut?: string, dateFin?: string) => {
    const response = await api.get('/logs/stats', {
      params: { dateDebut, dateFin },
    });
    return response.data;
  },

  cleanOldLogs: async (joursAConserver: number) => {
    const response = await api.delete('/logs/clean', {
      params: { joursAConserver },
    });
    return response.data;
  },
};

/**
 * Fonctions utilitaires
 */
export const apiUtils = {
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

/**
 * API de gestion des migrations (SuperAdmin uniquement)
 */
export const migrationApi = {
  applyMigrations: async () => {
    const response = await api.post('/admin/migrate');
    return response.data;
  },

  getMigrationStatus: async () => {
    const response = await api.get('/admin/migrate/status');
    return response.data;
  },
};

export default api;
