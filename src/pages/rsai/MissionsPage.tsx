import React, { useState, useEffect, useMemo } from 'react';
import {
  IoCalendarOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoLocationOutline,
  IoDocumentTextOutline,
  IoPeopleOutline,
  IoAddOutline,
  IoReloadOutline,
  IoCloseOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoSearchOutline,
  IoBusinessOutline,
} from 'react-icons/io5';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Creche {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  capacite: number;
  nbEnfants: number;
  dateAffectation: Date;
  dateFin?: Date;
  statut: 'active' | 'terminee';
  prochainAudit?: Date;
  conformite: number;
}

export const MissionsPage: React.FC = () => {
  const [creches, setCreches] = useState<Creche[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | 'active' | 'terminee'>('all');

  // États des modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCreche, setSelectedCreche] = useState<Creche | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // États du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    ville: '',
    capacite: 30,
    nbEnfants: 0,
    dateAffectation: '',
    dateFin: '',
    prochainAudit: '',
  });

  useEffect(() => {
    loadCreches();
  }, []);

  const loadCreches = async () => {
    try {
      setLoading(true);
      // Simuler le chargement
      setTimeout(() => {
        setCreches([
          {
            id: '1',
            nom: 'Crèche Les Petits Loups',
            adresse: '12 Rue des Lilas',
            ville: 'Paris 15ème',
            capacite: 60,
            nbEnfants: 54,
            dateAffectation: new Date('2025-01-15'),
            statut: 'active',
            prochainAudit: new Date('2026-09-25'),
            conformite: 95,
          },
          {
            id: '2',
            nom: 'Multi-Accueil Montessori',
            adresse: '8 Avenue du Parc',
            ville: 'Paris 16ème',
            capacite: 45,
            nbEnfants: 42,
            dateAffectation: new Date('2025-03-10'),
            statut: 'active',
            prochainAudit: new Date('2026-10-05'),
            conformite: 88,
          },
          {
            id: '3',
            nom: 'Jardin d\'Enfants Soleil',
            adresse: '23 Boulevard Victor Hugo',
            ville: 'Paris 17ème',
            capacite: 30,
            nbEnfants: 28,
            dateAffectation: new Date('2025-06-01'),
            statut: 'active',
            prochainAudit: new Date('2026-09-18'),
            conformite: 75,
          },
          {
            id: '4',
            nom: 'Crèche Arc-en-Ciel',
            adresse: '5 Rue de la Paix',
            ville: 'Paris 18ème',
            capacite: 50,
            nbEnfants: 0,
            dateAffectation: new Date('2024-09-01'),
            dateFin: new Date('2025-08-31'),
            statut: 'terminee',
            conformite: 92,
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Erreur chargement crèches:', err);
      setLoading(false);
    }
  };

  const filteredCreches = useMemo(() => {
    return creches.filter((c) => {
      const matchSearch =
        searchQuery === '' ||
        c.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.ville.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatut = filterStatut === 'all' || c.statut === filterStatut;

      return matchSearch && matchStatut;
    });
  }, [creches, searchQuery, filterStatut]);

  const stats = useMemo(() => {
    const total = creches.length;
    const actives = creches.filter((c) => c.statut === 'active').length;
    const totalEnfants = creches.reduce((acc, c) => acc + c.nbEnfants, 0);
    const totalCapacite = creches.reduce((acc, c) => acc + c.capacite, 0);
    return { total, actives, totalEnfants, totalCapacite };
  }, [creches]);

  const openCreateModal = () => {
    setFormData({
      nom: '',
      adresse: '',
      ville: '',
      capacite: 30,
      nbEnfants: 0,
      dateAffectation: '',
      dateFin: '',
      prochainAudit: '',
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (creche: Creche) => {
    setSelectedCreche(creche);
    setFormData({
      nom: creche.nom,
      adresse: creche.adresse,
      ville: creche.ville,
      capacite: creche.capacite,
      nbEnfants: creche.nbEnfants,
      dateAffectation: creche.dateAffectation.toISOString().split('T')[0],
      dateFin: creche.dateFin ? creche.dateFin.toISOString().split('T')[0] : '',
      prochainAudit: creche.prochainAudit ? creche.prochainAudit.toISOString().split('T')[0] : '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (creche: Creche) => {
    setSelectedCreche(creche);
    setIsDeleteModalOpen(true);
  };

  const openDetailsModal = (creche: Creche) => {
    setSelectedCreche(creche);
    setIsDetailsModalOpen(true);
  };

  const handleCreate = async () => {
    setIsSaving(true);
    // Simuler la création
    setTimeout(() => {
      alert('Crèche ajoutée avec succès!');
      setIsCreateModalOpen(false);
      setIsSaving(false);
      loadCreches();
    }, 1000);
  };

  const handleEdit = async () => {
    setIsSaving(true);
    setTimeout(() => {
      alert('Crèche modifiée avec succès!');
      setIsEditModalOpen(false);
      setSelectedCreche(null);
      setIsSaving(false);
      loadCreches();
    }, 1000);
  };

  const handleDelete = async () => {
    setIsSaving(true);
    setTimeout(() => {
      alert('Crèche retirée de vos missions!');
      setIsDeleteModalOpen(false);
      setSelectedCreche(null);
      setIsSaving(false);
      loadCreches();
    }, 1000);
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-fuchsia-50/20 to-indigo-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <IoReloadOutline className="h-12 w-12 text-fuchsia-500 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-slate-600 dark:text-zinc-400">Chargement de vos missions...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 space-y-6 bg-gradient-to-br from-slate-50 via-fuchsia-50/20 to-indigo-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 font-sans antialiased"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Mes Missions RSAI</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Établissements dont vous êtes responsable
          </p>
        </div>

        <Button
          size="sm"
          onClick={openCreateModal}
          className="h-11 px-5 text-xs font-bold rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white transition-all shadow-md cursor-pointer"
        >
          <IoAddOutline className="h-4 w-4 mr-2" />
          Nouvelle mission
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Total Établissements</p>
                <p className="text-2xl font-black mt-1">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-950/30 flex items-center justify-center border border-fuchsia-200 dark:border-fuchsia-800">
                <IoBusinessOutline className="h-6 w-6 text-fuchsia-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Missions Actives</p>
                <p className="text-2xl font-black mt-1 text-emerald-600">{stats.actives}</p>
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
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Total Enfants</p>
                <p className="text-2xl font-black mt-1 text-blue-600">{stats.totalEnfants}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                <IoPeopleOutline className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Capacité Totale</p>
                <p className="text-2xl font-black mt-1 text-amber-600">{stats.totalCapacite}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                <IoLocationOutline className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recherche */}
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Rechercher par nom ou ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-xs rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
              />
            </div>

            {/* Filtre statut */}
            <div className="flex items-center gap-2">
              <Button
                variant={filterStatut === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatut('all')}
                className={`flex-1 h-10 text-xs font-bold rounded-xl ${
                  filterStatut === 'all' ? 'bg-fuchsia-600 hover:bg-fuchsia-700' : ''
                }`}
              >
                Toutes
              </Button>
              <Button
                variant={filterStatut === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatut('active')}
                className={`flex-1 h-10 text-xs font-bold rounded-xl ${
                  filterStatut === 'active' ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                }`}
              >
                Actives
              </Button>
              <Button
                variant={filterStatut === 'terminee' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatut('terminee')}
                className={`flex-1 h-10 text-xs font-bold rounded-xl ${
                  filterStatut === 'terminee' ? 'bg-slate-600 hover:bg-slate-700' : ''
                }`}
              >
                Terminées
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des crèches */}
      {filteredCreches.length === 0 ? (
        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-16 text-center">
            <IoBusinessOutline className="h-16 w-16 text-slate-300 dark:text-zinc-600 mx-auto mb-4" />
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
              {searchQuery || filterStatut !== 'all'
                ? 'Aucun établissement ne correspond aux critères'
                : 'Aucune mission affectée'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCreches.map((creche) => (
              <motion.div
                key={creche.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-6 space-y-4">
                    {/* Header avec nom et statut */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-fuchsia-500/30">
                          <AvatarFallback className="bg-fuchsia-50 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200 font-black text-sm">
                            {creche.nom.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold truncate">{creche.nom}</h3>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{creche.ville}</p>
                        </div>
                      </div>
                      <Badge
                        className={`text-[10px] px-2 py-0.5 ${
                          creche.statut === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        {creche.statut === 'active' ? 'Active' : 'Terminée'}
                      </Badge>
                    </div>

                    {/* Informations */}
                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-xs">
                        <IoLocationOutline className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="text-slate-600 dark:text-zinc-400 truncate">{creche.adresse}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <IoPeopleOutline className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="text-slate-600 dark:text-zinc-400">
                          {creche.nbEnfants} / {creche.capacite} enfants
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <IoCalendarOutline className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="text-slate-600 dark:text-zinc-400">
                          Depuis le {format(creche.dateAffectation, 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                      {creche.prochainAudit && (
                        <div className="flex items-center gap-2 text-xs">
                          <IoTimeOutline className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="text-slate-600 dark:text-zinc-400">
                            Prochain audit: {format(creche.prochainAudit, 'dd MMM yyyy', { locale: fr })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Conformité */}
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-400">Conformité</span>
                        <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-zinc-100">
                          {creche.conformite}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            creche.conformite >= 90
                              ? 'bg-emerald-600'
                              : creche.conformite >= 75
                              ? 'bg-amber-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${creche.conformite}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetailsModal(creche)}
                        className="flex-1 h-8 text-xs font-bold rounded-xl border-slate-200 dark:border-zinc-700 cursor-pointer"
                      >
                        Détails
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(creche)}
                        className="h-8 w-8 p-0 rounded-xl border-slate-200 dark:border-zinc-700 cursor-pointer"
                      >
                        <IoPencilOutline className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteModal(creche)}
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

      {/* MODAL DE CRÉATION */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl pointer-events-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-950/30 flex items-center justify-center border border-fuchsia-200 dark:border-fuchsia-800">
                      <IoAddOutline className="h-5 w-5 text-fuchsia-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black">Nouvelle Mission</h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">Ajouter un établissement à vos missions</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="h-8 w-8 p-0 rounded-xl"
                  >
                    <IoCloseOutline className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nom */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="nom" className="text-xs font-bold">
                        Nom de l'établissement *
                      </Label>
                      <Input
                        id="nom"
                        type="text"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        placeholder="Crèche Les Petits Loups"
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>

                    {/* Adresse */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="adresse" className="text-xs font-bold">
                        Adresse *
                      </Label>
                      <Input
                        id="adresse"
                        type="text"
                        value={formData.adresse}
                        onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                        placeholder="12 Rue des Lilas"
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>

                    {/* Ville */}
                    <div className="space-y-2">
                      <Label htmlFor="ville" className="text-xs font-bold">
                        Ville *
                      </Label>
                      <Input
                        id="ville"
                        type="text"
                        value={formData.ville}
                        onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                        placeholder="Paris 15ème"
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>

                    {/* Capacité */}
                    <div className="space-y-2">
                      <Label htmlFor="capacite" className="text-xs font-bold">
                        Capacité d'accueil *
                      </Label>
                      <Input
                        id="capacite"
                        type="number"
                        value={formData.capacite}
                        onChange={(e) => setFormData({ ...formData, capacite: parseInt(e.target.value) || 0 })}
                        min={1}
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>

                    {/* Nombre d'enfants */}
                    <div className="space-y-2">
                      <Label htmlFor="nbEnfants" className="text-xs font-bold">
                        Nombre d'enfants actuels
                      </Label>
                      <Input
                        id="nbEnfants"
                        type="number"
                        value={formData.nbEnfants}
                        onChange={(e) => setFormData({ ...formData, nbEnfants: parseInt(e.target.value) || 0 })}
                        min={0}
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>

                    {/* Date d'affectation */}
                    <div className="space-y-2">
                      <Label htmlFor="dateAffectation" className="text-xs font-bold">
                        Date d'affectation *
                      </Label>
                      <Input
                        id="dateAffectation"
                        type="date"
                        value={formData.dateAffectation}
                        onChange={(e) => setFormData({ ...formData, dateAffectation: e.target.value })}
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>

                    {/* Date de fin */}
                    <div className="space-y-2">
                      <Label htmlFor="dateFin" className="text-xs font-bold">
                        Date de fin (optionnel)
                      </Label>
                      <Input
                        id="dateFin"
                        type="date"
                        value={formData.dateFin}
                        onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>

                    {/* Prochain audit */}
                    <div className="space-y-2">
                      <Label htmlFor="prochainAudit" className="text-xs font-bold">
                        Prochain audit (optionnel)
                      </Label>
                      <Input
                        id="prochainAudit"
                        type="date"
                        value={formData.prochainAudit}
                        onChange={(e) => setFormData({ ...formData, prochainAudit: e.target.value })}
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={isSaving}
                    className="h-10 px-6 text-xs font-bold rounded-2xl"
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    disabled={isSaving || !formData.nom || !formData.adresse || !formData.ville || !formData.dateAffectation}
                    className="h-10 px-6 text-xs font-bold rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700"
                  >
                    {isSaving ? (
                      <>
                        <IoReloadOutline className="h-4 w-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <IoCheckmarkCircleOutline className="h-4 w-4 mr-2" />
                        Ajouter la mission
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL D'ÉDITION */}
      <AnimatePresence>
        {isEditModalOpen && selectedCreche && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl pointer-events-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-950/30 flex items-center justify-center border border-fuchsia-200 dark:border-fuchsia-800">
                      <IoPencilOutline className="h-5 w-5 text-fuchsia-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black">Modifier la Mission</h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">{selectedCreche.nom}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditModalOpen(false)}
                    className="h-8 w-8 p-0 rounded-xl"
                  >
                    <IoCloseOutline className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nom */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="edit-nom" className="text-xs font-bold">
                        Nom de l'établissement *
                      </Label>
                      <Input
                        id="edit-nom"
                        type="text"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        placeholder="Crèche Les Petits Loups"
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>

                    {/* Adresse */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="edit-adresse" className="text-xs font-bold">
                        Adresse *
                      </Label>
                      <Input
                        id="edit-adresse"
                        type="text"
                        value={formData.adresse}
                        onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                        placeholder="12 Rue des Lilas"
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>

                    {/* Ville */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-ville" className="text-xs font-bold">
                        Ville *
                      </Label>
                      <Input
                        id="edit-ville"
                        type="text"
                        value={formData.ville}
                        onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                        placeholder="Paris 15ème"
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>

                    {/* Capacité */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-capacite" className="text-xs font-bold">
                        Capacité d'accueil *
                      </Label>
                      <Input
                        id="edit-capacite"
                        type="number"
                        value={formData.capacite}
                        onChange={(e) => setFormData({ ...formData, capacite: parseInt(e.target.value) || 0 })}
                        min={1}
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>

                    {/* Nombre d'enfants */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-nbEnfants" className="text-xs font-bold">
                        Nombre d'enfants actuels
                      </Label>
                      <Input
                        id="edit-nbEnfants"
                        type="number"
                        value={formData.nbEnfants}
                        onChange={(e) => setFormData({ ...formData, nbEnfants: parseInt(e.target.value) || 0 })}
                        min={0}
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>

                    {/* Date d'affectation */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-dateAffectation" className="text-xs font-bold">
                        Date d'affectation *
                      </Label>
                      <Input
                        id="edit-dateAffectation"
                        type="date"
                        value={formData.dateAffectation}
                        onChange={(e) => setFormData({ ...formData, dateAffectation: e.target.value })}
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>

                    {/* Date de fin */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-dateFin" className="text-xs font-bold">
                        Date de fin (optionnel)
                      </Label>
                      <Input
                        id="edit-dateFin"
                        type="date"
                        value={formData.dateFin}
                        onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>

                    {/* Prochain audit */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-prochainAudit" className="text-xs font-bold">
                        Prochain audit (optionnel)
                      </Label>
                      <Input
                        id="edit-prochainAudit"
                        type="date"
                        value={formData.prochainAudit}
                        onChange={(e) => setFormData({ ...formData, prochainAudit: e.target.value })}
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={isSaving}
                    className="h-10 px-6 text-xs font-bold rounded-2xl"
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEdit}
                    disabled={isSaving || !formData.nom || !formData.adresse || !formData.ville || !formData.dateAffectation}
                    className="h-10 px-6 text-xs font-bold rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700"
                  >
                    {isSaving ? (
                      <>
                        <IoReloadOutline className="h-4 w-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <IoCheckmarkCircleOutline className="h-4 w-4 mr-2" />
                        Enregistrer les modifications
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL DE SUPPRESSION */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedCreche && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <Card className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl pointer-events-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center border border-rose-200 dark:border-rose-800">
                      <IoTrashOutline className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black">Retirer la Mission</h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">Cette action est irréversible</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="h-8 w-8 p-0 rounded-xl"
                  >
                    <IoCloseOutline className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
                    <p className="text-sm font-medium text-rose-900 dark:text-rose-300">
                      Êtes-vous sûr de vouloir retirer cette mission ?
                    </p>
                    <p className="text-xs text-rose-700 dark:text-rose-400 mt-2">
                      <span className="font-bold">{selectedCreche.nom}</span> ne sera plus dans votre liste de missions RSAI. Vous perdrez l'accès à l'historique et aux rapports associés.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <IoBusinessOutline className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-zinc-400">{selectedCreche.nom}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IoLocationOutline className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-zinc-400">{selectedCreche.adresse}, {selectedCreche.ville}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IoPeopleOutline className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-zinc-400">{selectedCreche.nbEnfants} enfants concernés</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-zinc-800">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isSaving}
                    className="h-10 px-6 text-xs font-bold rounded-2xl"
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="h-10 px-6 text-xs font-bold rounded-2xl bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    {isSaving ? (
                      <>
                        <IoReloadOutline className="h-4 w-4 mr-2 animate-spin" />
                        Suppression...
                      </>
                    ) : (
                      <>
                        <IoTrashOutline className="h-4 w-4 mr-2" />
                        Retirer la mission
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL DE DÉTAILS */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedCreche && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailsModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl pointer-events-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-fuchsia-500/30">
                      <AvatarFallback className="bg-fuchsia-50 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200 font-black">
                        {selectedCreche.nom.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-black">{selectedCreche.nom}</h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">{selectedCreche.ville}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="h-8 w-8 p-0 rounded-xl"
                  >
                    <IoCloseOutline className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6">
                  {/* Statut */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-3">Statut de la Mission</h4>
                    <Badge
                      className={`text-xs px-3 py-1 ${
                        selectedCreche.statut === 'active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {selectedCreche.statut === 'active' ? 'Mission Active' : 'Mission Terminée'}
                    </Badge>
                  </div>

                  {/* Informations générales */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-3">Informations Générales</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700">
                        <div className="flex items-center gap-2 mb-2">
                          <IoLocationOutline className="h-4 w-4 text-slate-400" />
                          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Adresse</span>
                        </div>
                        <p className="text-sm font-medium">{selectedCreche.adresse}</p>
                        <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">{selectedCreche.ville}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700">
                        <div className="flex items-center gap-2 mb-2">
                          <IoPeopleOutline className="h-4 w-4 text-slate-400" />
                          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Occupation</span>
                        </div>
                        <p className="text-2xl font-black">
                          {selectedCreche.nbEnfants} <span className="text-sm font-medium text-slate-500">/ {selectedCreche.capacite}</span>
                        </p>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                          Taux: {Math.round((selectedCreche.nbEnfants / selectedCreche.capacite) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dates importantes */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-3">Dates Importantes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700">
                        <div className="flex items-center gap-2 mb-2">
                          <IoCalendarOutline className="h-4 w-4 text-blue-500" />
                          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Affectation</span>
                        </div>
                        <p className="text-sm font-bold">
                          {format(selectedCreche.dateAffectation, 'dd MMMM yyyy', { locale: fr })}
                        </p>
                      </div>

                      {selectedCreche.dateFin && (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700">
                          <div className="flex items-center gap-2 mb-2">
                            <IoCalendarOutline className="h-4 w-4 text-amber-500" />
                            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Fin de mission</span>
                          </div>
                          <p className="text-sm font-bold">
                            {format(selectedCreche.dateFin, 'dd MMMM yyyy', { locale: fr })}
                          </p>
                        </div>
                      )}

                      {selectedCreche.prochainAudit && (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700">
                          <div className="flex items-center gap-2 mb-2">
                            <IoTimeOutline className="h-4 w-4 text-fuchsia-500" />
                            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Prochain audit</span>
                          </div>
                          <p className="text-sm font-bold">
                            {format(selectedCreche.prochainAudit, 'dd MMMM yyyy', { locale: fr })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Conformité */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-3">Niveau de Conformité</h4>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-800/50 dark:to-zinc-800/30 border border-slate-200 dark:border-zinc-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-black">{selectedCreche.conformite}%</span>
                        <Badge
                          className={`${
                            selectedCreche.conformite >= 90
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                              : selectedCreche.conformite >= 75
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                          }`}
                        >
                          {selectedCreche.conformite >= 90 ? 'Excellent' : selectedCreche.conformite >= 75 ? 'Satisfaisant' : 'À améliorer'}
                        </Badge>
                      </div>
                      <div className="h-3 w-full bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            selectedCreche.conformite >= 90
                              ? 'bg-emerald-600'
                              : selectedCreche.conformite >= 75
                              ? 'bg-amber-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${selectedCreche.conformite}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 mt-3">
                        {selectedCreche.conformite >= 90
                          ? 'L\'établissement respecte tous les critères de conformité.'
                          : selectedCreche.conformite >= 75
                          ? 'Quelques points nécessitent une attention particulière.'
                          : 'Des actions correctives importantes sont requises.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-3">Actions Rapides</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsDetailsModalOpen(false);
                          openEditModal(selectedCreche);
                        }}
                        className="h-12 justify-start text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700"
                      >
                        <IoPencilOutline className="h-4 w-4 mr-2" />
                        Modifier les informations
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-12 justify-start text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700"
                      >
                        <IoDocumentTextOutline className="h-4 w-4 mr-2" />
                        Voir les rapports d'audit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-12 justify-start text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700"
                      >
                        <IoCalendarOutline className="h-4 w-4 mr-2" />
                        Planifier un audit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsDetailsModalOpen(false);
                          openDeleteModal(selectedCreche);
                        }}
                        className="h-12 justify-start text-xs font-bold rounded-2xl border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/20"
                      >
                        <IoTrashOutline className="h-4 w-4 mr-2" />
                        Retirer la mission
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
                  <Button
                    size="sm"
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="h-10 px-6 text-xs font-bold rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700"
                  >
                    Fermer
                  </Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
