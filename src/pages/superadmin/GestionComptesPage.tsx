import React, { useState, useMemo, useEffect } from 'react';
import {
  IoPersonAddOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoPeopleOutline,
  IoBusinessOutline,
  IoShieldCheckmarkOutline,
  IoMedkitOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoMailOutline,
  IoCallOutline,
  IoChevronForward,
  IoReloadOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { UserRole } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { userApi } from '@/services/api';
import { mapBackendRoleToRoute, mapFrontendRoleToBackend } from '@/utils/roleMapper';

interface UserAccount {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: UserRole;
  statut: 'actif' | 'inactif';
  dateCreation: string;
}

export const GestionComptesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'tous'>('tous');
  const [filterStatus, setFilterStatus] = useState<'tous' | 'actif' | 'inactif'>('tous');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  // Backend state
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state for creation
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    prenom: '',
    nom: '',
    tel: '',
    role: 'creche' as UserRole,
  });

  // Form state for edition
  const [editFormData, setEditFormData] = useState({
    prenom: '',
    nom: '',
    tel: '',
    role: 'creche' as UserRole,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load users from backend
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await userApi.getAllUsers();
      const backendUsers = response.data || [];

      // Transform backend users to UserAccount format
      const transformedUsers: UserAccount[] = backendUsers.map((u: any) => ({
        id: u.id,
        nom: u.profile?.nom || 'Nom',
        prenom: u.profile?.prenom || 'Prénom',
        email: u.email,
        telephone: u.profile?.tel || undefined,
        role: mapBackendRoleToRoute(u.role) as UserRole,
        statut: u.isActive ? 'actif' : 'inactif',
        dateCreation: u.createdAt || new Date().toISOString(),
      }));

      setAllUsers(transformedUsers);
    } catch (err: any) {
      console.error('❌ Erreur chargement utilisateurs:', err);
      setError(err.response?.data?.error || 'Erreur de chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrage combiné (Recherche + Rôle + Statut)
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      const matchesSearch =
        user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = filterRole === 'tous' || user.role === filterRole;
      const matchesStatus = filterStatus === 'tous' || user.statut === filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [allUsers, searchTerm, filterRole, filterStatus]);

  // Statistiques par rôle
  const roleStats = useMemo(() => {
    const stats: Record<string, number> = {};
    allUsers.forEach(user => {
      stats[user.role] = (stats[user.role] || 0) + 1;
    });
    return stats;
  }, [allUsers]);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'creche':
        return <IoBusinessOutline className="h-4 w-4" />;
      case 'medecin':
        return <IoMedkitOutline className="h-4 w-4" />;
      case 'rsai':
      case 'superadmin':
      case 'developpeur':
        return <IoShieldCheckmarkOutline className="h-4 w-4" />;
      default:
        return <IoPeopleOutline className="h-4 w-4" />;
    }
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'creche':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'medecin':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'rsai':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'parent':
        return 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400 border-pink-200 dark:border-pink-800';
      case 'superadmin':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'developpeur':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
      superadmin: 'Super Admin',
      creche: 'Crèche',
      developpeur: 'Développeur',
      auxiliaire: 'Auxiliaire',
      medecin: 'Médecin',
      rsai: 'RSAI',
      parent: 'Parent'
    };
    return labels[role] || role;
  };

  const handleToggleStatus = async (userId: string, currentStatus: 'actif' | 'inactif') => {
    try {
      await userApi.toggleUserStatus(userId, currentStatus === 'inactif');
      console.log('✅ Statut utilisateur modifié');
      await loadUsers();
    } catch (err: any) {
      console.error('❌ Erreur modification statut:', err);
      alert(err.response?.data?.error || 'Erreur lors de la modification du statut');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      await userApi.deleteUser(userId);
      console.log('✅ Utilisateur supprimé');
      await loadUsers();
    } catch (err: any) {
      console.error('❌ Erreur suppression utilisateur:', err);
      alert(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.prenom || !formData.nom) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert frontend role to backend role
      const backendRole = mapFrontendRoleToBackend(formData.role);

      await userApi.createUser({
        email: formData.email,
        password: formData.password,
        prenom: formData.prenom,
        nom: formData.nom,
        tel: formData.tel,
        role: backendRole,
        mustChangePassword: true,
      });
      console.log('✅ Utilisateur créé avec succès');

      // Reset form
      setFormData({
        email: '',
        password: '',
        prenom: '',
        nom: '',
        tel: '',
        role: 'creche' as UserRole,
      });

      setIsCreateModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      console.error('❌ Erreur création utilisateur:', err);
      alert(err.response?.data?.error || 'Erreur lors de la création de l\'utilisateur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (user: UserAccount) => {
    setSelectedUser(user);
    setEditFormData({
      prenom: user.prenom,
      nom: user.nom,
      tel: user.telephone || '',
      role: user.role,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    if (!editFormData.prenom || !editFormData.nom) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsSubmitting(true);

      // Update profile via admin endpoint
      await userApi.updateUserProfile(selectedUser.id, {
        prenom: editFormData.prenom,
        nom: editFormData.nom,
        tel: editFormData.tel,
      });

      console.log('✅ Utilisateur modifié avec succès');

      setIsEditModalOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (err: any) {
      console.error('❌ Erreur modification utilisateur:', err);
      alert(err.response?.data?.error || 'Erreur lors de la modification de l\'utilisateur');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-16 text-center space-y-4 max-w-md mx-auto mt-20">
        <IoReloadOutline className="h-12 w-12 text-blue-500 mx-auto animate-spin" />
        <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
          Chargement des utilisateurs...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-16 text-center space-y-4 max-w-md mx-auto mt-20">
        <IoAlertCircleOutline className="h-12 w-12 text-rose-500 mx-auto" />
        <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
          Erreur de chargement
        </p>
        <p className="text-xs text-slate-500 dark:text-zinc-400">{error}</p>
        <Button onClick={loadUsers}>
          <IoReloadOutline className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-10 space-y-8 bg-slate-50/50 dark:bg-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 font-sans antialiased"
    >
      
      {/* Top Header Professionnel & Épuré (Identique au Dashboard) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
              <IoPeopleOutline className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Gestion des Comptes Utilisateurs
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Supervision centralisée, création et administration des accès de la plateforme
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-4 text-xs font-semibold rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition-all"
            onClick={() => navigate('/superadmin')}
          >
            Retour au tableau de bord
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-10 px-4 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm cursor-pointer"
          >
            <IoPersonAddOutline className="h-4 w-4 mr-2" />
            Créer un compte
          </Button>
        </div>
      </div>

      {/* Grid Statistiques cliquables par rôle (Même style que les KPIs du Dashboard) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        {(['creche', 'medecin', 'rsai', 'parent', ] as UserRole[]).map(role => (
          <Card 
            key={role} 
            onClick={() => setFilterRole(filterRole === role ? 'tous' : role)}
            className={cn(
              "rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs transition-all cursor-pointer hover:border-blue-400 dark:hover:border-blue-600",
              filterRole === role && "ring-2 ring-blue-600 dark:ring-blue-500"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-zinc-400">
                {getRoleIcon(role)}
                <span className="text-[11px] font-semibold truncate">
                  {getRoleLabel(role)}
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{roleStats[role] || 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Barre de recherche et filtres unifiés */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher par nom, prénom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-xs bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <IoFilterOutline className="h-4 w-4 text-slate-400 shrink-0" />
              
              <Select value={filterRole} onValueChange={(value) => setFilterRole(value as UserRole | 'tous')}>
                <SelectTrigger className="w-full md:w-[160px] h-10 text-xs bg-slate-50/50 dark:bg-zinc-800/50 rounded-xl border-slate-200 dark:border-zinc-700">
                  <SelectValue placeholder="Rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les rôles</SelectItem>
                  <SelectItem value="creche">Crèches</SelectItem>
                  <SelectItem value="medecin">Médecins</SelectItem>
                  <SelectItem value="rsai">RSAI</SelectItem>
                  <SelectItem value="parent">Parents</SelectItem>
                  
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                <SelectTrigger className="w-full md:w-[140px] h-10 text-xs bg-slate-50/50 dark:bg-zinc-800/50 rounded-xl border-slate-200 dark:border-zinc-700">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous statuts</SelectItem>
                  <SelectItem value="actif">Actifs</SelectItem>
                  <SelectItem value="inactif">Inactifs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste / Répertoire des utilisateurs */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800 px-6 pt-6">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Répertoire des utilisateurs
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {filteredUsers.length} compte{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-zinc-500 text-xs">
              Aucun utilisateur ne correspond aux critères de recherche.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-xs">
                        {user.prenom?.[0] || 'U'}{user.nom?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {user.prenom} {user.nom}
                        </p>
                        <Badge variant="outline" className={cn('text-[10px] px-2 py-0.5 font-semibold border', getRoleBadgeStyle(user.role))}>
                          {getRoleLabel(user.role)}
                        </Badge>
                        <button
                          onClick={() => handleToggleStatus(user.id, user.statut)}
                          className={cn(
                            'inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity',
                            user.statut === 'actif'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                          )}
                          title="Cliquer pour changer le statut"
                        >
                          {user.statut === 'actif' ? <IoCheckmarkCircleOutline className="h-3 w-3" /> : <IoCloseCircleOutline className="h-3 w-3" />}
                          {user.statut}
                        </button>
                      </div>

                      <div className="flex items-center gap-4 mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1.5 truncate">
                          <IoMailOutline className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          {user.email}
                        </span>
                        {user.telephone && (
                          <span className="flex items-center gap-1.5 truncate">
                            <IoCallOutline className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            {user.telephone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Rapides par ligne */}
                  <div className="flex items-center gap-2 pl-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer rounded-lg"
                      onClick={() => handleOpenEditModal(user)}
                      title="Modifier"
                    >
                      <IoCreateOutline className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer rounded-lg"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Supprimer"
                    >
                      <IoTrashOutline className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de création de compte */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              Créer un nouveau compte
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-zinc-400">
              Remplissez les informations pour créer un nouveau compte utilisateur
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Prénom *
                </Label>
                <Input
                  id="prenom"
                  placeholder="Jean"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nom" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Nom *
                </Label>
                <Input
                  id="nom"
                  placeholder="Dupont"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jean.dupont@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Mot de passe temporaire *
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="text-xs"
                required
                minLength={8}
              />
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                L'utilisateur devra changer ce mot de passe à la première connexion
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tel" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Téléphone
              </Label>
              <Input
                id="tel"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                value={formData.tel}
                onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Rôle *
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creche">Crèche (Admin Structure)</SelectItem>
                  <SelectItem value="medecin">Médecin (Professionnel)</SelectItem>
                  <SelectItem value="rsai">RSAI (Professionnel)</SelectItem>
                  <SelectItem value="auxiliaire">Auxiliaire (Professionnel)</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                  <SelectItem value="developpeur">Développeur</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                Les rôles Médecin, RSAI et Auxiliaire sont des professionnels avec les mêmes permissions
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-xs bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <IoReloadOutline className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <IoPersonAddOutline className="h-4 w-4 mr-2" />
                    Créer le compte
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de modification de compte */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              Modifier le compte
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-zinc-400">
              Modifiez les informations de l'utilisateur {selectedUser?.prenom} {selectedUser?.nom}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-prenom" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Prénom *
                </Label>
                <Input
                  id="edit-prenom"
                  placeholder="Jean"
                  value={editFormData.prenom}
                  onChange={(e) => setEditFormData({ ...editFormData, prenom: e.target.value })}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-nom" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Nom *
                </Label>
                <Input
                  id="edit-nom"
                  placeholder="Dupont"
                  value={editFormData.nom}
                  onChange={(e) => setEditFormData({ ...editFormData, nom: e.target.value })}
                  className="text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tel" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Téléphone
              </Label>
              <Input
                id="edit-tel"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                value={editFormData.tel}
                onChange={(e) => setEditFormData({ ...editFormData, tel: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Email (non modifiable)
              </Label>
              <Input
                value={selectedUser?.email || ''}
                disabled
                className="text-xs bg-slate-100 dark:bg-zinc-800"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Rôle (non modifiable)
              </Label>
              <Input
                value={getRoleLabel(selectedUser?.role || 'parent')}
                disabled
                className="text-xs bg-slate-100 dark:bg-zinc-800"
              />
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                Pour changer le rôle, veuillez contacter un développeur
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-xs bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <IoReloadOutline className="h-4 w-4 mr-2 animate-spin" />
                    Modification...
                  </>
                ) : (
                  <>
                    <IoCreateOutline className="h-4 w-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// Utilitaire de classes CSS
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}