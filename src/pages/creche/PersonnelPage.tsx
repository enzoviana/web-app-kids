import React, { useState, useMemo, useEffect } from 'react';
import {
  IoSearchOutline,
  IoAddOutline,
  IoPeopleOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoCallOutline,
  IoMailOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoTimeOutline,
  IoReloadOutline,
  IoTrashOutline,
  IoPencilOutline,
  IoPersonOutline,
  IoCloseOutline,
} from 'react-icons/io5';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { personnelApi } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const DEFAULT_ETABLISSEMENT_ID = 'test-creche-001';

type FilterRole = 'all' | 'directeur' | 'educateur' | 'auxiliaire' | 'autre';
type FilterContrat = 'all' | 'CDI' | 'CDD' | 'Vacation' | 'Interim';
type FilterStatut = 'all' | 'actif' | 'inactif';

export const PersonnelPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [filterContrat, setFilterContrat] = useState<FilterContrat>('all');
  const [filterStatut, setFilterStatut] = useState<FilterStatut>('all');

  // États backend
  const [personnels, setPersonnels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États des modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // États du formulaire
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    tel: '',
    role: 'Auxiliaire Puéricultrice',
    contrat: 'CDI',
    diplome: '',
    dateEmbauche: '',
    dateDiplome: '',
    habilitations: [] as string[],
    isActive: true,
  });

  // Charger les données
  useEffect(() => {
    loadPersonnels();
  }, []);

  const loadPersonnels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await personnelApi.getPersonnelByEtablissement(DEFAULT_ETABLISSEMENT_ID);
      setPersonnels(response.data || []);
    } catch (err: any) {
      console.error('Erreur chargement personnel:', err);
      setError(err.response?.data?.error || 'Erreur de chargement du personnel');
      setPersonnels([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrage
  const filteredPersonnels = useMemo(() => {
    return personnels.filter((p) => {
      const matchSearch =
        searchQuery === '' ||
        `${p.prenom} ${p.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRole =
        filterRole === 'all' ||
        p.role.toLowerCase().includes(filterRole.toLowerCase());

      const matchContrat =
        filterContrat === 'all' ||
        p.contrat === filterContrat;

      const matchStatut =
        filterStatut === 'all' ||
        (filterStatut === 'actif' && p.isActive) ||
        (filterStatut === 'inactif' && !p.isActive);

      return matchSearch && matchRole && matchContrat && matchStatut;
    });
  }, [personnels, searchQuery, filterRole, filterContrat, filterStatut]);

  // Stats
  const stats = useMemo(() => {
    const total = personnels.length;
    const actifs = personnels.filter((p) => p.isActive).length;
    const cdi = personnels.filter((p) => p.contrat === 'CDI').length;
    const diplomesExpires = personnels.filter((p) => p.statutDiplome === 'expire' || p.statutDiplome === 'expire_bientot').length;
    return { total, actifs, cdi, diplomesExpires };
  }, [personnels]);

  // Ouvrir modal de création
  const openCreateModal = () => {
    setFormData({
      prenom: '',
      nom: '',
      email: '',
      tel: '',
      role: 'Auxiliaire Puéricultrice',
      contrat: 'CDI',
      diplome: '',
      dateEmbauche: '',
      dateDiplome: '',
      habilitations: [],
      isActive: true,
    });
    setIsCreateModalOpen(true);
  };

  // Ouvrir modal d'édition
  const openEditModal = (personnel: any) => {
    setSelectedPersonnel(personnel);
    setFormData({
      prenom: personnel.prenom || '',
      nom: personnel.nom || '',
      email: personnel.email || '',
      tel: personnel.tel || '',
      role: personnel.role || 'Auxiliaire Puéricultrice',
      contrat: personnel.contrat || 'CDI',
      diplome: personnel.diplome || '',
      dateEmbauche: personnel.dateEmbauche ? personnel.dateEmbauche.split('T')[0] : '',
      dateDiplome: personnel.dateDiplome ? personnel.dateDiplome.split('T')[0] : '',
      habilitations: personnel.habilitations || [],
      isActive: personnel.isActive !== undefined ? personnel.isActive : true,
    });
    setIsEditModalOpen(true);
  };

  // Ouvrir modal de suppression
  const openDeleteModal = (personnel: any) => {
    setSelectedPersonnel(personnel);
    setIsDeleteModalOpen(true);
  };

  // Créer un personnel
  const handleCreate = async () => {
    try {
      setIsSaving(true);
      await personnelApi.createPersonnel({
        ...formData,
        etablissementId: DEFAULT_ETABLISSEMENT_ID,
      });
      setIsCreateModalOpen(false);
      await loadPersonnels();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setIsSaving(false);
    }
  };

  // Modifier un personnel
  const handleEdit = async () => {
    if (!selectedPersonnel) return;

    try {
      setIsSaving(true);
      await personnelApi.updatePersonnel(selectedPersonnel.id, formData);
      setIsEditModalOpen(false);
      setSelectedPersonnel(null);
      await loadPersonnels();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la modification');
    } finally {
      setIsSaving(false);
    }
  };

  // Supprimer un personnel
  const handleDelete = async () => {
    if (!selectedPersonnel) return;

    try {
      setIsSaving(true);
      await personnelApi.deletePersonnel(selectedPersonnel.id);
      setIsDeleteModalOpen(false);
      setSelectedPersonnel(null);
      await loadPersonnels();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la suppression');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-indigo-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <IoReloadOutline className="h-12 w-12 text-teal-500 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-slate-600 dark:text-zinc-400">Chargement du personnel...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 space-y-6 font-sans antialiased text-slate-900 dark:text-zinc-100 bg-gradient-to-br from-slate-50 via-teal-50/20 to-indigo-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 min-h-screen"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Équipe & Personnel</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Gérez votre équipe et suivez les qualifications
          </p>
        </div>

        <Button
          size="sm"
          onClick={openCreateModal}
          className="h-11 px-5 text-xs font-bold rounded-2xl bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-md cursor-pointer"
        >
          <IoAddOutline className="h-4 w-4 mr-2" />
          Ajouter un membre
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Total Personnel</p>
                <p className="text-2xl font-black mt-1">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center border border-teal-200 dark:border-teal-800">
                <IoPeopleOutline className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Personnel Actif</p>
                <p className="text-2xl font-black mt-1 text-emerald-600">{stats.actifs}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                <IoCheckmarkCircleOutline className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">CDI</p>
                <p className="text-2xl font-black mt-1 text-blue-600">{stats.cdi}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                <IoDocumentTextOutline className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Diplômes à Renouveler</p>
                <p className="text-2xl font-black mt-1 text-amber-600">{stats.diplomesExpires}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                <IoAlertCircleOutline className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Rechercher par nom, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-xs rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
              />
            </div>

            {/* Filtre Rôle */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as FilterRole)}
              className="h-10 px-3 text-xs font-medium rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 cursor-pointer"
            >
              <option value="all">Tous les rôles</option>
              <option value="directeur">Directeur</option>
              <option value="educateur">Éducateur</option>
              <option value="auxiliaire">Auxiliaire</option>
              <option value="autre">Autre</option>
            </select>

            {/* Filtre Contrat */}
            <select
              value={filterContrat}
              onChange={(e) => setFilterContrat(e.target.value as FilterContrat)}
              className="h-10 px-3 text-xs font-medium rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 cursor-pointer"
            >
              <option value="all">Tous les contrats</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Vacation">Vacation</option>
              <option value="Interim">Intérim</option>
            </select>

            {/* Filtre Statut */}
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value as FilterStatut)}
              className="h-10 px-3 text-xs font-medium rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Liste du personnel */}
      {error && (
        <Card className="rounded-3xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <IoAlertCircleOutline className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
          </CardContent>
        </Card>
      )}

      {filteredPersonnels.length === 0 ? (
        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-16 text-center">
            <IoPersonOutline className="h-16 w-16 text-slate-300 dark:text-zinc-600 mx-auto mb-4" />
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
              {searchQuery || filterRole !== 'all' || filterContrat !== 'all' || filterStatut !== 'all'
                ? 'Aucun membre du personnel ne correspond aux critères'
                : 'Aucun membre du personnel enregistré'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPersonnels.map((personnel) => (
              <motion.div
                key={personnel.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-6 space-y-4">
                    {/* Header avec avatar */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-teal-500/30">
                          <AvatarImage src={personnel.photo} alt={personnel.prenom} />
                          <AvatarFallback className="bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200 font-black text-sm">
                            {personnel.prenom[0]}{personnel.nom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold truncate">
                            {personnel.prenom} {personnel.nom}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                            {personnel.role}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={`text-[10px] px-2 py-0.5 ${
                          personnel.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        {personnel.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>

                    {/* Infos principales */}
                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-xs">
                        <IoMailOutline className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="text-slate-600 dark:text-zinc-400 truncate">{personnel.email}</span>
                      </div>
                      {personnel.tel && (
                        <div className="flex items-center gap-2 text-xs">
                          <IoCallOutline className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="text-slate-600 dark:text-zinc-400">{personnel.tel}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs">
                        <IoDocumentTextOutline className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="text-slate-600 dark:text-zinc-400">{personnel.contrat} • {personnel.diplome}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <IoCalendarOutline className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="text-slate-600 dark:text-zinc-400">
                          Embauché le {format(new Date(personnel.dateEmbauche), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </div>

                    {/* Diplôme status */}
                    {personnel.statutDiplome !== 'valide' && (
                      <div className={`p-2 rounded-xl flex items-center gap-2 text-xs ${
                        personnel.statutDiplome === 'expire'
                          ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                          : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                      }`}>
                        <IoAlertCircleOutline className="h-4 w-4 shrink-0" />
                        <span className="font-medium">
                          {personnel.statutDiplome === 'expire' ? 'Diplôme expiré' : 'Diplôme expire bientôt'}
                        </span>
                      </div>
                    )}

                    {/* Habilitations */}
                    {personnel.habilitations && personnel.habilitations.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {personnel.habilitations.map((hab: string, idx: number) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-[9px] px-2 py-0 bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700"
                          >
                            {hab}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(personnel)}
                        className="flex-1 h-8 text-xs font-bold rounded-xl border-slate-200 dark:border-zinc-700 cursor-pointer"
                      >
                        <IoPencilOutline className="h-3 w-3 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteModal(personnel)}
                        className="h-8 w-8 p-0 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/20 cursor-pointer"
                      >
                        <IoTrashOutline className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal de création */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full shadow-2xl my-8 max-h-[90vh] flex flex-col"
          >
            <div className="p-5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 border border-teal-200 dark:border-teal-800">
                  <IoAddOutline className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-black tracking-tight">Ajouter un membre du personnel</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <IoCloseOutline className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prenom" className="font-bold text-slate-700 dark:text-zinc-300">Prénom *</Label>
                  <Input
                    id="prenom"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    placeholder="ex: Marie"
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="nom" className="font-bold text-slate-700 dark:text-zinc-300">Nom *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="ex: Dupont"
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="font-bold text-slate-700 dark:text-zinc-300">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ex: marie.dupont@example.com"
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tel" className="font-bold text-slate-700 dark:text-zinc-300">Téléphone</Label>
                  <Input
                    id="tel"
                    type="tel"
                    value={formData.tel}
                    onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                    placeholder="ex: 06 12 34 56 78"
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="role" className="font-bold text-slate-700 dark:text-zinc-300">Rôle / Poste *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="h-10 text-xs rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Directeur">Directeur / Directrice</SelectItem>
                      <SelectItem value="Éducateur de Jeunes Enfants">Éducateur de Jeunes Enfants (EJE)</SelectItem>
                      <SelectItem value="Auxiliaire Puéricultrice">Auxiliaire Puéricultrice</SelectItem>
                      <SelectItem value="Agent Technique">Agent Technique</SelectItem>
                      <SelectItem value="Cuisinier">Cuisinier</SelectItem>
                      <SelectItem value="Psychologue">Psychologue</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contrat" className="font-bold text-slate-700 dark:text-zinc-300">Type de contrat *</Label>
                  <Select
                    value={formData.contrat}
                    onValueChange={(value) => setFormData({ ...formData, contrat: value })}
                  >
                    <SelectTrigger className="h-10 text-xs rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                      <SelectItem value="Vacation">Vacation</SelectItem>
                      <SelectItem value="Interim">Intérim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="diplome" className="font-bold text-slate-700 dark:text-zinc-300">Diplôme principal</Label>
                  <Input
                    id="diplome"
                    value={formData.diplome}
                    onChange={(e) => setFormData({ ...formData, diplome: e.target.value })}
                    placeholder="ex: CAP Petite Enfance"
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dateDiplome" className="font-bold text-slate-700 dark:text-zinc-300">Date d'obtention du diplôme</Label>
                  <Input
                    id="dateDiplome"
                    type="date"
                    value={formData.dateDiplome}
                    onChange={(e) => setFormData({ ...formData, dateDiplome: e.target.value })}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dateEmbauche" className="font-bold text-slate-700 dark:text-zinc-300">Date d'embauche *</Label>
                <Input
                  id="dateEmbauche"
                  type="date"
                  value={formData.dateEmbauche}
                  onChange={(e) => setFormData({ ...formData, dateEmbauche: e.target.value })}
                  className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded text-teal-600 cursor-pointer"
                />
                <Label htmlFor="isActive" className="font-bold text-slate-700 dark:text-zinc-300 cursor-pointer">
                  Personnel actif (en poste)
                </Label>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSaving}
                className="h-10 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="button"
                disabled={isSaving || !formData.prenom || !formData.nom || !formData.email || !formData.dateEmbauche}
                onClick={handleCreate}
                className="h-10 text-xs font-bold rounded-2xl bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-md"
              >
                {isSaving ? 'Création...' : 'Créer le membre'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal d'édition */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full shadow-2xl my-8 max-h-[90vh] flex flex-col"
          >
            <div className="p-5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 border border-teal-200 dark:border-teal-800">
                  <IoPencilOutline className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-black tracking-tight">Modifier {selectedPersonnel?.prenom} {selectedPersonnel?.nom}</h3>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedPersonnel(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <IoCloseOutline className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-prenom" className="font-bold text-slate-700 dark:text-zinc-300">Prénom *</Label>
                  <Input
                    id="edit-prenom"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    placeholder="ex: Marie"
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-nom" className="font-bold text-slate-700 dark:text-zinc-300">Nom *</Label>
                  <Input
                    id="edit-nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="ex: Dupont"
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-email" className="font-bold text-slate-700 dark:text-zinc-300">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ex: marie.dupont@example.com"
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-tel" className="font-bold text-slate-700 dark:text-zinc-300">Téléphone</Label>
                  <Input
                    id="edit-tel"
                    type="tel"
                    value={formData.tel}
                    onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                    placeholder="ex: 06 12 34 56 78"
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-role" className="font-bold text-slate-700 dark:text-zinc-300">Rôle / Poste *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="h-10 text-xs rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Directeur">Directeur / Directrice</SelectItem>
                      <SelectItem value="Éducateur de Jeunes Enfants">Éducateur de Jeunes Enfants (EJE)</SelectItem>
                      <SelectItem value="Auxiliaire Puéricultrice">Auxiliaire Puéricultrice</SelectItem>
                      <SelectItem value="Agent Technique">Agent Technique</SelectItem>
                      <SelectItem value="Cuisinier">Cuisinier</SelectItem>
                      <SelectItem value="Psychologue">Psychologue</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-contrat" className="font-bold text-slate-700 dark:text-zinc-300">Type de contrat *</Label>
                  <Select
                    value={formData.contrat}
                    onValueChange={(value) => setFormData({ ...formData, contrat: value })}
                  >
                    <SelectTrigger className="h-10 text-xs rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                      <SelectItem value="Vacation">Vacation</SelectItem>
                      <SelectItem value="Interim">Intérim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-diplome" className="font-bold text-slate-700 dark:text-zinc-300">Diplôme principal</Label>
                  <Input
                    id="edit-diplome"
                    value={formData.diplome}
                    onChange={(e) => setFormData({ ...formData, diplome: e.target.value })}
                    placeholder="ex: CAP Petite Enfance"
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-dateDiplome" className="font-bold text-slate-700 dark:text-zinc-300">Date d'obtention du diplôme</Label>
                  <Input
                    id="edit-dateDiplome"
                    type="date"
                    value={formData.dateDiplome}
                    onChange={(e) => setFormData({ ...formData, dateDiplome: e.target.value })}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-dateEmbauche" className="font-bold text-slate-700 dark:text-zinc-300">Date d'embauche *</Label>
                <Input
                  id="edit-dateEmbauche"
                  type="date"
                  value={formData.dateEmbauche}
                  onChange={(e) => setFormData({ ...formData, dateEmbauche: e.target.value })}
                  className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded text-teal-600 cursor-pointer"
                />
                <Label htmlFor="edit-isActive" className="font-bold text-slate-700 dark:text-zinc-300 cursor-pointer">
                  Personnel actif (en poste)
                </Label>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedPersonnel(null);
                }}
                disabled={isSaving}
                className="h-10 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="button"
                disabled={isSaving || !formData.prenom || !formData.nom || !formData.email || !formData.dateEmbauche}
                onClick={handleEdit}
                className="h-10 text-xs font-bold rounded-2xl bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-md"
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && selectedPersonnel && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full shadow-2xl"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center border border-red-200 dark:border-red-800">
                  <IoAlertCircleOutline className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight">Confirmer la suppression</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Cette action est irréversible
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <p className="text-xs text-slate-700 dark:text-zinc-300">
                  Êtes-vous sûr de vouloir supprimer <span className="font-bold">{selectedPersonnel.prenom} {selectedPersonnel.nom}</span> de votre équipe ?
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2">
                  Toutes les données associées à ce membre seront définitivement supprimées.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedPersonnel(null);
                }}
                disabled={isSaving}
                className="h-10 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="button"
                disabled={isSaving}
                onClick={handleDelete}
                className="h-10 text-xs font-bold rounded-2xl bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-md"
              >
                {isSaving ? 'Suppression...' : 'Supprimer définitivement'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
