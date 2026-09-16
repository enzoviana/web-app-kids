import React, { useState, useEffect } from 'react';
import {
  IoShieldCheckmarkOutline,
  IoMailOutline,
  IoCallOutline,
  IoLocationOutline,
  IoNotificationsOutline,
  IoLanguageOutline,
  IoPencilOutline,
  IoSaveOutline,
  IoCheckmarkCircleOutline,
  IoCloseOutline,
  IoLockClosedOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { userApi, authApi } from '@/services/api';

interface Profile {
  prenom: string;
  nom: string;
  email: string;
  tel?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  langue?: string;
  timezone?: string;
  notificationEmail?: boolean;
  notificationPush?: boolean;
  notificationSMS?: boolean;
}

export const ParametresPage: React.FC = () => {
  const { user } = useAuth();

  // États principaux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // États des formulaires
  const [formData, setFormData] = useState<Partial<Profile>>({});

  // États des notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);

  // États des préférences
  const [langue, setLangue] = useState('fr');
  const [fuseau, setFuseau] = useState('Europe/Paris');

  // États du changement de mot de passe
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // État de sauvegarde
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Charger le profil au montage
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getProfile();
      const profileData = response.data;

      setProfile(profileData);
      setFormData(profileData);

      // Mettre à jour les états locaux
      setNotifEmail(profileData.notificationEmail ?? true);
      setNotifPush(profileData.notificationPush ?? true);
      setNotifSMS(profileData.notificationSMS ?? false);
      setLangue(profileData.langue || 'fr');
      setFuseau(profileData.timezone || 'Europe/Paris');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement du profil');
      console.error('Erreur chargement profil:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const updateData = {
        ...formData,
        langue,
        timezone: fuseau,
        notificationEmail: notifEmail,
        notificationPush: notifPush,
        notificationSMS: notifSMS,
      };

      await userApi.updateProfile(updateData);

      // Recharger le profil
      await loadProfile();

      setIsSaved(true);
      setIsEditing(false);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
      console.error('Erreur sauvegarde:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(profile || {});
    setError(null);
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('Les nouveaux mots de passe ne correspondent pas');
        return;
      }

      if (passwordData.newPassword.length < 8) {
        setError('Le nouveau mot de passe doit contenir au moins 8 caractères');
        return;
      }

      setIsSaving(true);
      setError(null);

      await authApi.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      setIsSaved(true);
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du changement de mot de passe');
      console.error('Erreur changement mot de passe:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // État de chargement
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans antialiased text-slate-900 dark:text-zinc-100 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
            <p className="mt-4 text-sm text-slate-500 dark:text-zinc-400">Chargement du profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans antialiased text-slate-900 dark:text-zinc-100 min-h-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            Paramètres du Compte
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Gérez vos informations personnelles, préférences de notifications et sécurité HDS
          </p>
        </div>

        {isSaved && (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-none font-semibold text-xs py-1.5 px-3">
            <IoCheckmarkCircleOutline className="mr-1.5 h-4 w-4" /> Modifications enregistrées
          </Badge>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Section Profil */}
      <Card className="shadow-none border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardHeader className="p-4 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60">
                <IoShieldCheckmarkOutline className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Profil Utilisateur</CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-zinc-400">
                  Renseignements d'identité et rôle sur l'établissement
                </CardDescription>
              </div>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setIsEditing(true)}
              >
                <IoPencilOutline className="mr-1.5 h-3.5 w-3.5" />
                Modifier
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-sky-200 dark:border-sky-900">
              <AvatarFallback className="bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-bold text-xl">
                {profile?.prenom?.[0] || user?.profile?.prenom?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {profile?.prenom} {profile?.nom}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="capitalize text-[10px]">
                  {user?.role || 'Personnel Éducatif'}
                </Badge>
                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 text-[10px]">
                  Compte Vérifié HDS
                </Badge>
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="prenom" className="text-xs font-bold">Prénom</Label>
                <Input
                  id="prenom"
                  value={formData.prenom || ''}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nom" className="text-xs font-bold">Nom</Label>
                <Input
                  id="nom"
                  value={formData.nom || ''}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="email" className="text-xs font-bold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  disabled
                  className="h-9 text-xs bg-slate-50 dark:bg-zinc-800/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tel" className="text-xs font-bold">Téléphone</Label>
                <Input
                  id="tel"
                  value={formData.tel || ''}
                  onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adresse" className="text-xs font-bold">Adresse</Label>
                <Input
                  id="adresse"
                  value={formData.adresse || ''}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="codePostal" className="text-xs font-bold">Code Postal</Label>
                <Input
                  id="codePostal"
                  value={formData.codePostal || ''}
                  onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ville" className="text-xs font-bold">Ville</Label>
                <Input
                  id="ville"
                  value={formData.ville || ''}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40">
                <IoMailOutline className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Adresse Email</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                    {profile?.email || 'Non renseigné'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40">
                <IoCallOutline className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Téléphone Direct</p>
                  <p className="text-xs font-mono font-semibold text-slate-800 dark:text-zinc-200">
                    {profile?.tel || 'Non renseigné'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 sm:col-span-2">
                <IoLocationOutline className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Adresse</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    {profile?.adresse
                      ? `${profile.adresse}${profile.codePostal ? `, ${profile.codePostal}` : ''}${profile.ville ? ` ${profile.ville}` : ''}`
                      : 'Non renseigné'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Sécurité - Changement de mot de passe */}
      <Card className="shadow-none border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardHeader className="p-4 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                <IoLockClosedOutline className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Sécurité & Mot de Passe</CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-zinc-400">
                  Gérez votre mot de passe et les paramètres de sécurité
                </CardDescription>
              </div>
            </div>
            {!showPasswordForm && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setShowPasswordForm(true)}
              >
                <IoPencilOutline className="mr-1.5 h-3.5 w-3.5" />
                Changer le mot de passe
              </Button>
            )}
          </div>
        </CardHeader>

        {showPasswordForm && (
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword" className="text-xs font-bold">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs font-bold">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="h-9 text-xs"
              />
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Minimum 8 caractères
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-bold">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setError(null);
                }}
              >
                <IoCloseOutline className="mr-1.5 h-4 w-4" />
                Annuler
              </Button>
              <Button
                size="sm"
                className="h-9 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                onClick={handleChangePassword}
                disabled={isSaving}
              >
                <IoSaveOutline className="mr-1.5 h-4 w-4" />
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Section Notifications */}
      <Card className="shadow-none border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardHeader className="p-4 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-200/60 dark:border-fuchsia-800/60">
              <IoNotificationsOutline className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Canaux de Notifications</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-zinc-400">
                Choisissez comment vous souhaitez être alerté sur les événements et urgences
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">Notifications par email</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Recevoir les bilans de santé, alertes sanitaires et synthèses IA
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifEmail}
              onChange={(e) => setNotifEmail(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">Notifications push navigateur</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Alertes visuelles en temps réel pendant votre session de travail
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifPush}
              onChange={(e) => setNotifPush(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">Alertes SMS d'urgence</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Exclusivement réservé aux incidents majeurs et protocoles PAI critiques
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifSMS}
              onChange={(e) => setNotifSMS(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section Préférences */}
      <Card className="shadow-none border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardHeader className="p-4 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              <IoLanguageOutline className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">Préférences Régionales</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-zinc-400">
                Langue de l'interface et paramètres d'horodatage des actes de soin
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="langue" className="text-xs font-bold">Langue de l'application</Label>
              <select
                id="langue"
                value={langue}
                onChange={(e) => setLangue(e.target.value)}
                className="w-full h-9 px-3 py-1 border border-slate-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="fr">Français (France)</option>
                <option value="en">English (UK)</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fuseau" className="text-xs font-bold">Fuseau Horaire</Label>
              <select
                id="fuseau"
                value={fuseau}
                onChange={(e) => setFuseau(e.target.value)}
                className="w-full h-9 px-3 py-1 border border-slate-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                <option value="Europe/London">Europe/London (GMT+0)</option>
                <option value="America/New_York">America/New_York (GMT-5)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barre d'Actions Finale */}
      {isEditing && (
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs font-semibold"
            onClick={handleCancelEdit}
            disabled={isSaving}
          >
            <IoCloseOutline className="mr-1.5 h-4 w-4" />
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
            className="h-9 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white"
            disabled={isSaving}
          >
            <IoSaveOutline className="mr-1.5 h-4 w-4" />
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      )}

      {/* Bouton de sauvegarde des préférences (notifications, langue, etc.) */}
      {!isEditing && (
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            onClick={handleSave}
            size="sm"
            className="h-9 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white"
            disabled={isSaving}
          >
            <IoSaveOutline className="mr-1.5 h-4 w-4" />
            {isSaving ? 'Enregistrement...' : 'Enregistrer les préférences'}
          </Button>
        </div>
      )}

    </div>
  );
};