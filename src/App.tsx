import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/hooks/useTheme';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { DashboardLayoutV2 } from '@/components/DashboardLayoutV2';
import { mapBackendRoleToRoute, roleMatches } from '@/utils/roleMapper';
import { Toaster } from 'sonner';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardCrecheV2 } from '@/pages/creche/DashboardCrecheV2';
import { EnfantDetailsPage } from '@/pages/creche/EnfantDetailsPage';
import { CompliancePage } from '@/pages/creche/CompliancePage';
import { AbonnementPage } from '@/pages/creche/AbonnementPage';
import { EnfantsPage } from '@/pages/creche/EnfantsPage';
import { RegistreMedicamentsPage } from '@/pages/creche/RegistreMedicamentsPage';
import { CahierLiaisonPage } from '@/pages/creche/CahierLiaisonPage';
import { GestionEtablissementPage } from '@/pages/creche/GestionEtablissementPage';
import { PersonnelPage } from '@/pages/creche/PersonnelPage';
import { DashboardMedecin } from '@/pages/medecin/DashboardMedecin';
import { DiagnosticIAPage } from '@/pages/medecin/DiagnosticIAPage';
import { OrdonnancesPage } from '@/pages/medecin/OrdonnancesPage';
import { DashboardRSAI } from '@/pages/rsai/DashboardRSAI';
import { AuditLogPage } from '@/pages/rsai/AuditLogPage';
import { MissionsPage } from '@/pages/rsai/MissionsPage';
import { NotesPage } from '@/pages/rsai/NotesPage';
import { AbonnementRSAIPage } from '@/pages/rsai/AbonnementRSAIPage';
import { DashboardAuxiliaire } from '@/pages/auxiliaire/DashboardAuxiliaire';
import { PortailParentPage } from '@/pages/parent/PortailParentPage';
import { DashboardSuperAdmin } from '@/pages/superadmin/DashboardSuperAdmin';
import { GestionComptesPage } from '@/pages/superadmin/GestionComptesPage';
import { GestionTarifsPage } from '@/pages/superadmin/GestionTarifsPage';
import { GestionAbonnementsPage } from '@/pages/superadmin/GestionAbonnementsPage';
import { EnfantsGlobalPage } from '@/pages/superadmin/EnfantsGlobalPage';
import { CrechesGlobalPage } from '@/pages/superadmin/CrechesGlobalPage';
import { EtablissementDetailsPage } from '@/pages/superadmin/EtablissementDetailsPage';
import { EnfantDetailsPage as SuperAdminEnfantDetailsPage } from '@/pages/superadmin/EnfantDetailsPage';
import { DashboardDeveloppeur } from '@/pages/developpeur/DashboardDeveloppeur';
import { LogsSystemePage } from '@/pages/developpeur/LogsSystemePage';
import { ErreursPage } from '@/pages/developpeur/ErreursPage';
import { MonitoringPage } from '@/pages/developpeur/MonitoringPage';
import { SupportPage } from '@/pages/developpeur/SupportPage';
import { MessagerieSecuriseePage } from '@/pages/MessagerieSecuriseePage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { ParametresPage } from '@/pages/ParametresPage';
import { ChangePasswordPage } from '@/pages/ChangePasswordPage';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole: string }> = ({
  children,
  allowedRole,
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Rediriger vers la page de changement de mot de passe si nécessaire
  if (user?.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  if (!roleMatches(user?.role || '', allowedRole)) {
    return <Navigate to={`/${mapBackendRoleToRoute(user?.role || '')}`} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            user?.mustChangePassword ? (
              <Navigate to="/change-password" replace />
            ) : (
              <Navigate to={`/${mapBackendRoleToRoute(user?.role || '')}`} replace />
            )
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Change Password Route */}
      <Route
        path="/change-password"
        element={
          isAuthenticated ? (
            <ChangePasswordPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* CRECHE ROUTES */}
      <Route
        path="/creche"
        element={
          <ProtectedRoute allowedRole="creche">
            <DashboardLayoutV2 />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardCrecheV2 />} />
        <Route path="enfants" element={<EnfantsPage />} />
        <Route path="enfants/:id" element={<EnfantDetailsPage />} />
        <Route path="documents" element={<CompliancePage />} />
        <Route path="registre-medicaments" element={<RegistreMedicamentsPage />} />
        <Route path="cahier-liaison" element={<CahierLiaisonPage />} />
        <Route path="etablissement" element={<GestionEtablissementPage />} />
        <Route path="personnel" element={<PersonnelPage />} />
        <Route path="messagerie" element={<MessagerieSecuriseePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="abonnement" element={<AbonnementPage />} />
        <Route path="parametres" element={<ParametresPage />} />
      </Route>

      {/* MEDECIN ROUTES */}
      <Route
        path="/medecin"
        element={
          <ProtectedRoute allowedRole="medecin">
            <DashboardLayoutV2 />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardMedecin />} />
        <Route path="patients" element={<EnfantsPage />} />
        <Route path="patients/:id" element={<EnfantDetailsPage />} />
        <Route path="diagnostics-ia" element={<DiagnosticIAPage />} />
        <Route path="ordonnances" element={<OrdonnancesPage />} />
        <Route path="registre-medicaments" element={<RegistreMedicamentsPage />} />
        <Route path="cahier-liaison" element={<CahierLiaisonPage />} />
        <Route path="messagerie" element={<MessagerieSecuriseePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="parametres" element={<ParametresPage />} />
      </Route>

      {/* RSAI ROUTES */}
      <Route
        path="/rsai"
        element={
          <ProtectedRoute allowedRole="rsai">
            <DashboardLayoutV2 />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardRSAI />} />
        <Route path="enfants" element={<EnfantsPage />} />
        <Route path="enfants/:id" element={<EnfantDetailsPage />} />
        <Route path="documents" element={<CompliancePage />} />
        <Route path="audit" element={<AuditLogPage />} />
        <Route path="missions" element={<MissionsPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="abonnement" element={<AbonnementRSAIPage />} />
        <Route path="messagerie" element={<MessagerieSecuriseePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="parametres" element={<ParametresPage />} />
      </Route>

      {/* AUXILIAIRE ROUTES */}
      <Route
        path="/auxiliaire"
        element={
          <ProtectedRoute allowedRole="auxiliaire">
            <DashboardLayoutV2 />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardAuxiliaire />} />
        <Route path="enfants" element={<EnfantsPage />} />
        <Route path="enfants/:id" element={<EnfantDetailsPage />} />
        <Route path="registre-medicaments" element={<RegistreMedicamentsPage />} />
        <Route path="cahier-liaison" element={<CahierLiaisonPage />} />
        <Route path="messagerie" element={<MessagerieSecuriseePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="parametres" element={<ParametresPage />} />
      </Route>

      {/* PARENT ROUTES */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute allowedRole="parent">
            <DashboardLayoutV2 />
          </ProtectedRoute>
        }
      >
        <Route index element={<PortailParentPage />} />
        <Route path="enfant/:id" element={<EnfantDetailsPage />} />
        <Route path="documents" element={<CompliancePage />} />
        <Route path="messagerie" element={<MessagerieSecuriseePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="parametres" element={<ParametresPage />} />
      </Route>

      {/* SUPERADMIN ROUTES */}
      <Route
        path="/superadmin"
        element={
          <ProtectedRoute allowedRole="superadmin">
            <DashboardLayoutV2 />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardSuperAdmin />} />
        <Route path="enfants" element={<EnfantsGlobalPage />} />
        <Route path="enfants/:id" element={<SuperAdminEnfantDetailsPage />} />
        <Route path="creches" element={<CrechesGlobalPage />} />
        <Route path="creches/:id" element={<EtablissementDetailsPage />} />
        <Route path="comptes" element={<GestionComptesPage />} />
        <Route path="tarifs" element={<GestionTarifsPage />} />
        <Route path="abonnements" element={<GestionAbonnementsPage />} />
        <Route path="statistiques" element={<DashboardSuperAdmin />} />
        <Route path="messagerie" element={<MessagerieSecuriseePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="parametres" element={<ParametresPage />} />
      </Route>

      {/* DEVELOPPEUR ROUTES */}
      <Route
        path="/developpeur"
        element={
          <ProtectedRoute allowedRole="developpeur">
            <DashboardLayoutV2 />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardDeveloppeur />} />
        <Route path="logs" element={<LogsSystemePage />} />
        <Route path="erreurs" element={<ErreursPage />} />
        <Route path="monitoring" element={<MonitoringPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="support/:id" element={<SupportPage />} />
        <Route path="api-docs" element={<DashboardDeveloppeur />} />
        <Route path="database" element={<DashboardDeveloppeur />} />
        <Route path="messagerie" element={<MessagerieSecuriseePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="parametres" element={<ParametresPage />} />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            richColors
            closeButton
            expand={false}
            toastOptions={{
              style: {
                fontSize: '13px',
              },
            }}
          />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
