import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoBusinessOutline,
  IoSearchOutline,
  IoPeopleOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoLocationOutline,
  IoReloadOutline,
  IoDownloadOutline,
  IoStatsChartOutline,
  IoWarningOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
} from 'react-icons/io5';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { etablissementApi, enfantApi, abonnementApi } from '@/services/api';

interface Creche {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  telephone: string;
  email: string;
  capacite: number;
  nbEnfants: number;
  nbPersonnel: number;
  dateCreation: Date;
  abonnement: {
    plan: string;
    statut: string;
  };
  conformite: number;
  documentsManquants: number;
  documentsExpires: number;
  statut: 'ok' | 'attention' | 'urgent';
}

type SortField = 'nom' | 'ville' | 'capacite' | 'conformite' | 'statut' | 'plan';
type SortDirection = 'asc' | 'desc';

export const CrechesGlobalPage: React.FC = () => {
  const navigate = useNavigate();
  const [creches, setCreches] = useState<Creche[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('nom');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger tous les établissements, abonnements et enfants
      const [etablissementsResponse, abonnementsResponse] = await Promise.all([
        etablissementApi.getAllEtablissements(),
        abonnementApi.getAllAbonnements(),
      ]);

      const etablissementsData = etablissementsResponse.data || [];
      const abonnementsData = abonnementsResponse.data || [];

      console.log('Établissements chargés:', etablissementsData);

      // Mapper les données pour correspondre à l'interface Creche
      const mappedCreches: Creche[] = await Promise.all(
        etablissementsData.map(async (etab: any) => {
          console.log('Mapping établissement:', { id: etab._id, nom: etab.nom });
          // Récupérer les enfants de cet établissement
          let nbEnfants = 0;
          try {
            const enfantsResponse = await enfantApi.getEnfantsByEtablissement(etab._id);
            nbEnfants = enfantsResponse.data?.length || 0;
          } catch (err) {
            console.error(`Erreur chargement enfants pour ${etab.nom}:`, err);
          }

          // Trouver l'abonnement correspondant
          const abonnement = abonnementsData.find((abo: any) => abo.etablissement === etab._id);

          // Calculer les documents manquants et expirés (à adapter selon votre logique métier)
          const documentsManquants = 0; // TODO: calculer selon les documents obligatoires
          const documentsExpires = 0; // TODO: calculer selon les dates d'expiration

          // Calculer la conformité (exemple basique)
          const conformite = documentsManquants === 0 && documentsExpires === 0 ? 100 : 85;

          // Déterminer le statut
          let statut: 'ok' | 'attention' | 'urgent' = 'ok';
          if (conformite < 80 || documentsManquants >= 3 || documentsExpires >= 2) {
            statut = 'urgent';
          } else if (conformite < 90 || documentsManquants > 0 || documentsExpires > 0) {
            statut = 'attention';
          }

          const crecheData = {
            id: etab._id || etab.id,
            nom: etab.nom,
            adresse: etab.adresse || '',
            ville: etab.ville || '',
            codePostal: etab.codePostal || '',
            telephone: etab.telephone || '',
            email: etab.email || '',
            capacite: etab.capaciteAccueil || 0,
            nbEnfants,
            nbPersonnel: 0, // TODO: ajouter une API pour récupérer le nombre de personnel
            dateCreation: new Date(etab.createdAt || new Date()),
            abonnement: {
              plan: abonnement?.plan || 'Basic',
              statut: abonnement?.statut || 'inactif',
            },
            conformite,
            documentsManquants,
            documentsExpires,
            statut,
          };

          console.log('Creche mappée:', crecheData);
          return crecheData;
        })
      );

      console.log('Toutes les crèches mappées:', mappedCreches);
      setCreches(mappedCreches);
      setLoading(false);
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
      const matchPlan = filterPlan === 'all' || c.abonnement.plan === filterPlan;

      return matchSearch && matchStatut && matchPlan;
    });
  }, [creches, searchQuery, filterStatut, filterPlan]);

  const sortedCreches = useMemo(() => {
    const sorted = [...filteredCreches].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'nom':
          comparison = a.nom.localeCompare(b.nom);
          break;
        case 'ville':
          comparison = a.ville.localeCompare(b.ville);
          break;
        case 'capacite':
          comparison = a.capacite - b.capacite;
          break;
        case 'conformite':
          comparison = a.conformite - b.conformite;
          break;
        case 'statut':
          const statutOrder = { urgent: 0, attention: 1, ok: 2 };
          comparison = statutOrder[a.statut] - statutOrder[b.statut];
          break;
        case 'plan':
          const planOrder = { Basic: 0, Premium: 1, Pro: 2 };
          comparison = planOrder[a.abonnement.plan as keyof typeof planOrder] - planOrder[b.abonnement.plan as keyof typeof planOrder];
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredCreches, sortField, sortDirection]);

  const paginatedCreches = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedCreches.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedCreches, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedCreches.length / itemsPerPage);

  const stats = useMemo(() => {
    return {
      total: creches.length,
      ok: creches.filter((c) => c.statut === 'ok').length,
      attention: creches.filter((c) => c.statut === 'attention').length,
      urgent: creches.filter((c) => c.statut === 'urgent').length,
      totalEnfants: creches.reduce((acc, c) => acc + c.nbEnfants, 0),
      totalCapacite: creches.reduce((acc, c) => acc + c.capacite, 0),
      totalPersonnel: creches.reduce((acc, c) => acc + c.nbPersonnel, 0),
    };
  }, [creches]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'ok':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
      case 'attention':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
      case 'urgent':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Basic':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
      case 'Premium':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400';
      case 'Pro':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <IoArrowUpOutline className="h-3.5 w-3.5" />
    ) : (
      <IoArrowDownOutline className="h-3.5 w-3.5" />
    );
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <IoReloadOutline className="h-12 w-12 text-purple-500 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-slate-600 dark:text-zinc-400">Chargement des établissements...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 font-sans antialiased"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Tous les Établissements</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Vue d'ensemble de toutes les crèches de la plateforme
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => alert('Export des données en cours...')}
          className="h-11 px-5 text-xs font-bold rounded-2xl bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
        >
          <IoDownloadOutline className="h-4 w-4 mr-2" />
          Exporter les données
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Total Établissements</p>
                <p className="text-2xl font-black mt-1">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                <IoBusinessOutline className="h-6 w-6 text-purple-600" />
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
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  / {stats.totalCapacite} places
                </p>
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
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Conformes</p>
                <p className="text-2xl font-black mt-1 text-emerald-600">{stats.ok}</p>
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
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">À Surveiller</p>
                <p className="text-2xl font-black mt-1 text-amber-600">{stats.attention + stats.urgent}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <Select value={filterStatut} onValueChange={setFilterStatut}>
              <SelectTrigger className="h-10 text-xs rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="ok">Conformes</SelectItem>
                <SelectItem value="attention">À surveiller</SelectItem>
                <SelectItem value="urgent">Urgents</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPlan} onValueChange={setFilterPlan}>
              <SelectTrigger className="h-10 text-xs rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700">
                <SelectValue placeholder="Filtrer par plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les plans</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-700">
              <tr>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('nom')}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide hover:text-purple-600 transition-colors"
                  >
                    Établissement
                    <SortIcon field="nom" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('ville')}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide hover:text-purple-600 transition-colors"
                  >
                    Localisation
                    <SortIcon field="ville" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('capacite')}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide hover:text-purple-600 transition-colors"
                  >
                    Capacité
                    <SortIcon field="capacite" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
                    Personnel
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('conformite')}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide hover:text-purple-600 transition-colors"
                  >
                    Conformité
                    <SortIcon field="conformite" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('plan')}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide hover:text-purple-600 transition-colors"
                  >
                    Plan
                    <SortIcon field="plan" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('statut')}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide hover:text-purple-600 transition-colors"
                  >
                    Statut
                    <SortIcon field="statut" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {paginatedCreches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <IoBusinessOutline className="h-16 w-16 text-slate-300 dark:text-zinc-600 mx-auto mb-4" />
                    <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
                      Aucun établissement ne correspond aux critères
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedCreches.map((creche) => {
                  console.log('Rendering creche row:', { id: creche.id, nom: creche.nom });
                  return (
                  <tr
                    key={creche.id || Math.random()}
                    onClick={() => {
                      console.log('Clicked creche:', { id: creche.id, nom: creche.nom });
                      if (creche.id) {
                        navigate(`/superadmin/creches/${creche.id}`);
                      } else {
                        console.error('ID manquant pour la crèche:', creche);
                      }
                    }}
                    className="hover:bg-purple-50/50 dark:hover:bg-purple-950/20 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                          {creche.nom}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          {creche.telephone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <IoLocationOutline className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-700 dark:text-zinc-300">
                          <p className="font-medium">{creche.ville} ({creche.codePostal})</p>
                          <p className="text-slate-500 dark:text-zinc-400 truncate max-w-[180px]">{creche.adresse}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <IoPeopleOutline className="h-4 w-4 text-blue-500" />
                        <div className="text-sm">
                          <span className="font-bold text-slate-900 dark:text-zinc-100">{creche.nbEnfants}</span>
                          <span className="text-slate-500 dark:text-zinc-400"> / {creche.capacite}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700 dark:text-zinc-300 font-medium">
                        {creche.nbPersonnel} agents
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {creche.conformite >= 90 ? (
                          <IoCheckmarkCircleOutline className="h-4 w-4 text-emerald-600" />
                        ) : creche.conformite >= 80 ? (
                          <IoAlertCircleOutline className="h-4 w-4 text-amber-600" />
                        ) : (
                          <IoWarningOutline className="h-4 w-4 text-rose-600" />
                        )}
                        <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                          {creche.conformite}%
                        </span>
                      </div>
                      {(creche.documentsManquants > 0 || creche.documentsExpires > 0) && (
                        <div className="text-[10px] text-rose-700 dark:text-rose-400 mt-1">
                          {creche.documentsManquants > 0 && <p>{creche.documentsManquants} manquant(s)</p>}
                          {creche.documentsExpires > 0 && <p>{creche.documentsExpires} expiré(s)</p>}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={cn('text-[10px] px-2 py-0.5 font-bold', getPlanColor(creche.abonnement.plan))}>
                        {creche.abonnement.plan}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={cn('text-[10px] px-2 py-0.5 font-bold', getStatutColor(creche.statut))}>
                        {creche.statut === 'ok' ? 'Conforme' : creche.statut === 'attention' ? 'Attention' : 'Urgent'}
                      </Badge>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginatedCreches.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-zinc-700 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-800/30">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600 dark:text-zinc-400">
                Afficher
              </span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="h-8 w-20 text-xs rounded-xl bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-slate-600 dark:text-zinc-400">
                entrées sur {sortedCreches.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-xl border-slate-200 dark:border-zinc-700"
              >
                <IoChevronBackOutline className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                    return false;
                  })
                  .map((page, idx, arr) => {
                    if (idx > 0 && page - arr[idx - 1] > 1) {
                      return (
                        <React.Fragment key={`ellipsis-${page}`}>
                          <span className="px-2 text-xs text-slate-400">...</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              'h-8 w-8 p-0 rounded-xl text-xs font-bold',
                              currentPage === page
                                ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                                : 'border-slate-200 dark:border-zinc-700'
                            )}
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      );
                    }
                    return (
                      <Button
                        key={page}
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          'h-8 w-8 p-0 rounded-xl text-xs font-bold',
                          currentPage === page
                            ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                            : 'border-slate-200 dark:border-zinc-700'
                        )}
                      >
                        {page}
                      </Button>
                    );
                  })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-xl border-slate-200 dark:border-zinc-700"
              >
                <IoChevronForwardOutline className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
