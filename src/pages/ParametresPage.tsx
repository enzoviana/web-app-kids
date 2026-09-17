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
  IoReloadOutline,
  IoSettingsOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { userApi, authApi } from '@/services/api';
import { AppBackground } from '@/components/AppBackground';
import { motion } from 'framer-motion';

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

  // Détection du rôle pour les couleurs
  const isRSAI = user?.role === 'rsai' || user?.role === 'professionnel_rsai';
  const isCreche = user?.role === 'creche' || user?.role === 'professionnel';
  const isMedecin = user?.role === 'medecin';

  // Thème de couleur basé sur le rôle
  const roleTheme = isRSAI
    ? { primary: 'fuchsia', hex: '#FF007A', light: 'fuchsia-50', dark: 'fuchsia-950', border: 'fuchsia-200', text: 'fuchsia-600', darkText: 'fuchsia-400' }
    : isCreche
    ? { primary: 'lime', hex: '#8BC34A', light: 'lime-50', dark: 'lime-950', border: 'lime-200', text: 'lime-600', darkText: 'lime-400' }
    : { primary: 'cyan', hex: '#0099FF', light: 'cyan-50', dark: 'cyan-950', border: 'cyan-200', text: 'cyan-600', darkText: 'cyan-400' };

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
      <AppBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <IoReloadOutline className={`h-12 w-12 ${isRSAI ? 'text-fuchsia-600' : isCreche ? 'text-lime-600' : 'text-cyan-600'} mx-auto mb-3 animate-spin`} />
            <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">Chargement du profil...</p>
          </div>
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 text-slate-900 dark:text-zinc-100"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Paramètres du Compte</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-${roleTheme.light} dark:bg-${roleTheme.dark}/50 text-${roleTheme.text} dark:text-${roleTheme.darkText} border border-${roleTheme.border} dark:border-${roleTheme.text}/20`}>
                <IoSettingsOutline className="h-3.5 w-3.5" />
                Paramètres
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">
              Gérez vos informations personnelles, préférences de notifications et sécurité HDS
            </p>
          </div>

          {isSaved && (
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-semibold text-xs py-1.5 px-3">
              <IoCheckmarkCircleOutline className="mr-1.5 h-4 w-4" /> Modifications enregistrées
            </Badge>
          )}
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Section Profil */}
        <Card className="rounded-xl border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
          <CardHeader className="p-4 sm:p-6 border-b border-slate-100 dark:border-zinc-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg border ${isRSAI ? 'bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-200/60 dark:border-fuchsia-800/60' : isCreche ? 'bg-lime-50 dark:bg-lime-950/40 text-lime-600 dark:text-lime-400 border-lime-200/60 dark:border-lime-800/60' : 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border-cyan-200/60 dark:border-cyan-800/60'}`}>
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
                  className="h-8 text-xs font-bold rounded-xl"
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
            <Avatar className={`h-16 w-16 border-2 ${isRSAI ? 'border-fuchsia-200 dark:border-fuchsia-900' : isCreche ? 'border-lime-200 dark:border-lime-900' : 'border-cyan-200 dark:border-cyan-900'}`}>
              <AvatarFallback className={`text-white font-bold text-xl ${isRSAI ? 'bg-gradient-to-br from-fuchsia-500 to-pink-600' : isCreche ? 'bg-gradient-to-br from-lime-500 to-green-600' : 'bg-gradient-to-br from-cyan-500 to-blue-600'}`}>
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
        <Card className="rounded-xl border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
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
        <Card className="rounded-xl border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
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
        <Card className="rounded-xl border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
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
            className={`h-9 text-xs font-semibold text-white ${isRSAI ? 'bg-fuchsia-700 hover:bg-fuchsia-600' : isCreche ? 'bg-lime-700 hover:bg-lime-600' : 'bg-cyan-700 hover:bg-cyan-600'}`}
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
              className={`h-9 text-xs font-semibold text-white ${isRSAI ? 'bg-fuchsia-700 hover:bg-fuchsia-600' : isCreche ? 'bg-lime-700 hover:bg-lime-600' : 'bg-cyan-700 hover:bg-cyan-600'}`}
              disabled={isSaving}
            >
              <IoSaveOutline className="mr-1.5 h-4 w-4" />
              {isSaving ? 'Enregistrement...' : 'Enregistrer les préférences'}
            </Button>
          </div>
        )}

        {/* Professional Footer */}
        <footer className="mt-8 pt-6 border-t border-slate-200 dark:border-zinc-800 text-center">
          <p className="text-xs text-slate-500 dark:text-zinc-500 font-medium">
            Kids'Med IA © 2026 - Paramètres du Compte
          </p>
        </footer>
      </motion.div>
    </AppBackground>
  );
};