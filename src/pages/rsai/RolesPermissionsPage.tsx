import React, { useState, useEffect } from 'react';
import { IoPersonAdd, IoShieldCheckmark, IoLockClosed, IoCheckmark, IoToggle } from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { userApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface Permission {
  module: string;
  view: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
}

interface Role {
  id: string;
  name: string;
  color: string;
  userCount: number;
  permissions: Permission[];
}

interface User {
  id: string;
  email: string;
  role: string;
  prenom: string;
  nom: string;
  isActive: boolean;
}

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Direction / Admin',
    color: 'primary',
    userCount: 3,
    permissions: [
      { module: 'Gestion des enfants', view: true, edit: true, delete: true, export: true },
      { module: 'Dossiers médicaux', view: true, edit: true, delete: false, export: true },
      { module: 'Gestion du personnel', view: true, edit: true, delete: true, export: true },
      { module: 'Documents obligatoires', view: true, edit: true, delete: false, export: true },
      { module: 'Paramètres système', view: true, edit: true, delete: false, export: false },
    ],
  },
  {
    id: '2',
    name: 'Médecin Pédiatre',
    color: 'success',
    userCount: 2,
    permissions: [
      { module: 'Gestion des enfants', view: true, edit: false, delete: false, export: false },
      { module: 'Dossiers médicaux', view: true, edit: true, delete: false, export: true },
      { module: 'Diagnostics IA', view: true, edit: true, delete: false, export: true },
      { module: 'Ordonnances', view: true, edit: true, delete: true, export: true },
      { module: 'Registre médicaments', view: true, edit: true, delete: false, export: false },
    ],
  },
  {
    id: '3',
    name: 'RSAI',
    color: 'warning',
    userCount: 2,
    permissions: [
      { module: 'Gestion des enfants', view: true, edit: true, delete: false, export: true },
      { module: 'Dossiers médicaux', view: true, edit: false, delete: false, export: true },
      { module: 'Documents obligatoires', view: true, edit: true, delete: false, export: true },
      { module: 'Journal d\'audit', view: true, edit: false, delete: false, export: true },
      { module: 'Geofencing', view: true, edit: true, delete: false, export: false },
    ],
  },
  {
    id: '4',
    name: 'Auxiliaire / Équipe',
    color: 'secondary',
    userCount: 12,
    permissions: [
      { module: 'Gestion des enfants', view: true, edit: false, delete: false, export: false },
      { module: 'Dossiers médicaux', view: true, edit: false, delete: false, export: false },
      { module: 'Registre médicaments', view: true, edit: true, delete: false, export: false },
      { module: 'Cahier de liaison', view: true, edit: true, delete: false, export: false },
    ],
  },
];

export const RolesPermissionsPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role | null>(mockRoles[0]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les utilisateurs au montage
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await userApi.getAllUsers();
        setUsers(response.data);
      } catch (err: any) {
        console.error('Erreur lors du chargement des utilisateurs:', err);
        setError(err.response?.data?.error || 'Erreur lors du chargement des utilisateurs');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Mettre à jour le comptage des utilisateurs par rôle
  const rolesWithCounts = mockRoles.map((role) => ({
    ...role,
    userCount: users.filter((u) => u.role === role.name).length,
  }));

  // Activer/Désactiver un utilisateur
  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await userApi.toggleUserStatus(userId, !isActive);

      // Mettre à jour l'état local
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === userId ? { ...u, isActive: !isActive } : u))
      );
    } catch (err: any) {
      console.error('Erreur lors du changement de statut:', err);
      alert(err.response?.data?.error || 'Erreur lors du changement de statut');
    }
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 dark:bg-zinc-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-zinc-100">Gestion des Rôles & Autorisations</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Contrôle d'accès basé sur les rôles (RBAC) - Conforme RGPD
          </p>
        </div>
        <Button onClick={() => alert('Création de rôle personnalisé\n\nCette fonctionnalité permettra de:\n- Créer un nouveau rôle avec un nom personnalisé\n- Définir les permissions granulaires par module\n- Assigner le rôle aux utilisateurs\n- Tracer toutes les modifications dans le journal d\'audit')}>
          <IoPersonAdd className="h-4 w-4 mr-2" />
          Créer un rôle
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <Card className="shadow-none border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20">
          <CardContent className="p-4">
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dark:bg-zinc-900 dark:border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-zinc-400">Rôles actifs</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-zinc-100 mt-1">{mockRoles.length}</p>
              </div>
              <IoShieldCheckmark className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-zinc-900 dark:border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-zinc-400">Utilisateurs</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-zinc-100 mt-1">
                  {loading ? '...' : users.length}
                </p>
              </div>
              <Avatar className="h-10 w-10 bg-slate-200 dark:bg-zinc-700">
                <AvatarFallback className="text-slate-600 dark:text-zinc-300">👥</AvatarFallback>
              </Avatar>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-zinc-900 dark:border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-zinc-400">Modules protégés</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-zinc-100 mt-1">12</p>
              </div>
              <IoLockClosed className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-zinc-900 dark:border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-zinc-400">Conformité</p>
                <p className="text-2xl font-semibold text-emerald-600 mt-1">100%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                <IoCheckmark className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <Card className="dark:bg-zinc-900 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="dark:text-zinc-100">Rôles disponibles</CardTitle>
            <CardDescription className="dark:text-zinc-400">Sélectionnez un rôle pour voir ses permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {rolesWithCounts.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedRole?.id === role.id
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={role.color as any}>{role.name}</Badge>
                  <span className="text-sm text-slate-500 dark:text-zinc-400">
                    {loading ? '...' : role.userCount} utilisateurs
                  </span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Permissions Matrix */}
        <Card className="lg:col-span-2 dark:bg-zinc-900 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="dark:text-zinc-100">Matrice des permissions</CardTitle>
            <CardDescription className="dark:text-zinc-400">
              {selectedRole ? `Permissions du rôle "${selectedRole.name}"` : 'Sélectionnez un rôle'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedRole && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="dark:text-zinc-300">Module</TableHead>
                    <TableHead className="text-center dark:text-zinc-300">Voir</TableHead>
                    <TableHead className="text-center dark:text-zinc-300">Modifier</TableHead>
                    <TableHead className="text-center dark:text-zinc-300">Supprimer</TableHead>
                    <TableHead className="text-center dark:text-zinc-300">Exporter</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedRole.permissions.map((perm, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium dark:text-zinc-100">{perm.module}</TableCell>
                      <TableCell className="text-center">
                        {perm.view ? (
                          <IoCheckmark className="h-5 w-5 text-emerald-500 mx-auto" />
                        ) : (
                          <span className="text-slate-300 dark:text-zinc-700">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {perm.edit ? (
                          <IoCheckmark className="h-5 w-5 text-emerald-500 mx-auto" />
                        ) : (
                          <span className="text-slate-300 dark:text-zinc-700">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {perm.delete ? (
                          <IoCheckmark className="h-5 w-5 text-emerald-500 mx-auto" />
                        ) : (
                          <span className="text-slate-300 dark:text-zinc-700">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {perm.export ? (
                          <IoCheckmark className="h-5 w-5 text-emerald-500 mx-auto" />
                        ) : (
                          <span className="text-slate-300 dark:text-zinc-700">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Management Section */}
      <Card className="dark:bg-zinc-900 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="dark:text-zinc-100">Gestion des utilisateurs</CardTitle>
          <CardDescription className="dark:text-zinc-400">
            Liste des utilisateurs avec leur rôle et statut
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-sm text-slate-500 dark:text-zinc-400">
              Chargement des utilisateurs...
            </p>
          ) : users.length === 0 ? (
            <p className="text-center py-8 text-sm text-slate-500 dark:text-zinc-400">
              Aucun utilisateur trouvé.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="dark:text-zinc-300">Nom</TableHead>
                  <TableHead className="dark:text-zinc-300">Email</TableHead>
                  <TableHead className="dark:text-zinc-300">Rôle</TableHead>
                  <TableHead className="text-center dark:text-zinc-300">Statut</TableHead>
                  <TableHead className="text-center dark:text-zinc-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium dark:text-zinc-100">
                      {user.prenom} {user.nom}
                    </TableCell>
                    <TableCell className="dark:text-zinc-300">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={user.isActive ? 'default' : 'destructive'}
                        className={
                          user.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : ''
                        }
                      >
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                        disabled={user.id === currentUser?.id}
                      >
                        <IoToggle className="h-4 w-4 mr-2" />
                        {user.isActive ? 'Désactiver' : 'Activer'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5 dark:bg-primary/10 dark:border-primary/30">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <IoShieldCheckmark className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-zinc-100 mb-1">Sécurité & Conformité</p>
              <p className="text-sm text-slate-600 dark:text-zinc-300">
                Toutes les modifications de permissions sont tracées dans le journal d'audit HDS.
                Les accès sont contrôlés en temps réel et révoqués automatiquement en cas de détection d'anomalie.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
