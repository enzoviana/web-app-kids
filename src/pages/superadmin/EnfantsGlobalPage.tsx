import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoPeopleOutline,
  IoSearchOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoBusinessOutline,
  IoReloadOutline,
  IoDownloadOutline,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { enfantApi, etablissementApi } from '@/services/api';
import { cn } from '@/lib/utils';

interface Enfant {
  id: string;
  prenom: string;
  nom: string;
  dateNaissance: Date;
  photo?: string;
  etablissement: {
    id: string;
    nom: string;
  };
  groupeSanguin?: string;
  allergies?: string[];
  vaccinations?: any[];
  pai?: { actif: boolean };
  documentsManquants: number;
  documentsExpires: number;
  statut: 'ok' | 'attention' | 'urgent';
}

type SortField = 'nom' | 'age' | 'etablissement' | 'statut' | 'documents';
type SortDirection = 'asc' | 'desc';

export const EnfantsGlobalPage: React.FC = () => {
  const navigate = useNavigate();
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterEtablissement, setFilterEtablissement] = useState<string>('all');
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

      // Charger tous les établissements et tous les enfants
      const [etablissementsResponse, enfantsResponse] = await Promise.all([
        etablissementApi.getAllEtablissements(),
        enfantApi.getAllEnfants(),
      ]);

      const etablissementsData = etablissementsResponse.data || [];
      const enfantsData = enfantsResponse.data || [];

      console.log('Enfants chargés:', enfantsData);
      console.log('Établissements pour mapping:', etablissementsData);

      // Mapper les données pour correspondre à l'interface Enfant
      const mappedEnfants: Enfant[] = enfantsData.map((enfant: any) => {
        const etablissementId = enfant.etablissement || enfant.etablissementId;
        console.log('Mapping enfant:', {
          id: enfant._id,
          prenom: enfant.prenom,
          etablissement: etablissementId,
          enfantComplet: enfant
        });

        // Trouver l'établissement correspondant
        const etablissement = etablissementsData.find((etab: any) =>
          etab._id === etablissementId || etab.id === etablissementId
        );

        if (!etablissement) {
          console.warn('Établissement non trouvé pour enfant:', enfant.prenom, etablissementId);
        }

        // Calculer les documents manquants et expirés (à adapter selon votre logique métier)
        const documentsManquants = 0; // TODO: calculer selon les documents obligatoires
        const documentsExpires = 0; // TODO: calculer selon les dates d'expiration

        // Déterminer le statut
        let statut: 'ok' | 'attention' | 'urgent' = 'ok';
        if (documentsManquants >= 3 || documentsExpires >= 2) {
          statut = 'urgent';
        } else if (documentsManquants > 0 || documentsExpires > 0) {
          statut = 'attention';
        }

        const enfantData = {
          id: enfant._id || enfant.id,
          prenom: enfant.prenom,
          nom: enfant.nom,
          dateNaissance: new Date(enfant.dateNaissance),
          photo: enfant.photo,
          etablissement: {
            id: etablissement?._id || etablissement?.id || '',
            nom: etablissement?.nom || 'Établissement inconnu',
          },
          groupeSanguin: enfant.groupeSanguin,
          allergies: enfant.allergies || [],
          vaccinations: enfant.vaccinations || [],
          pai: enfant.pai || { actif: false },
          documentsManquants,
          documentsExpires,
          statut,
        };

        console.log('Enfant mappé:', enfantData);
        return enfantData;
      });

      console.log('Tous les enfants mappés:', mappedEnfants);
      setEnfants(mappedEnfants);
      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement enfants:', err);
      setLoading(false);
    }
  };

  const getAge = (dateNaissance: Date) => {
    const years = differenceInYears(new Date(), new Date(dateNaissance));
    const months = differenceInMonths(new Date(), new Date(dateNaissance)) % 12;
    if (years > 0) {
      return `${years} an${years > 1 ? 's' : ''}`;
    }
    return `${months} mois`;
  };

  const filteredEnfants = useMemo(() => {
    return enfants.filter((e) => {
      const matchSearch =
        searchQuery === '' ||
        `${e.prenom} ${e.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.etablissement.nom.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatut = filterStatut === 'all' || e.statut === filterStatut;
      const matchEtablissement =
        filterEtablissement === 'all' || e.etablissement.id === filterEtablissement;

      return matchSearch && matchStatut && matchEtablissement;
    });
  }, [enfants, searchQuery, filterStatut, filterEtablissement]);

  const sortedEnfants = useMemo(() => {
    const sorted = [...filteredEnfants].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'nom':
          comparison = `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`);
          break;
        case 'age':
          comparison = new Date(b.dateNaissance).getTime() - new Date(a.dateNaissance).getTime();
          break;
        case 'etablissement':
          comparison = a.etablissement.nom.localeCompare(b.etablissement.nom);
          break;
        case 'statut':
          const statutOrder = { urgent: 0, attention: 1, ok: 2 };
          comparison = statutOrder[a.statut] - statutOrder[b.statut];
          break;
        case 'documents':
          comparison = (b.documentsManquants + b.documentsExpires) - (a.documentsManquants + a.documentsExpires);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredEnfants, sortField, sortDirection]);

  const paginatedEnfants = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedEnfants.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedEnfants, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedEnfants.length / itemsPerPage);

  const stats = useMemo(() => {
    return {
      total: enfants.length,
      ok: enfants.filter((e) => e.statut === 'ok').length,
      attention: enfants.filter((e) => e.statut === 'attention').length,
      urgent: enfants.filter((e) => e.statut === 'urgent').length,
      documentsManquants: enfants.reduce((acc, e) => acc + e.documentsManquants, 0),
      documentsExpires: enfants.reduce((acc, e) => acc + e.documentsExpires, 0),
    };
  }, [enfants]);

  const etablissements = useMemo(() => {
    const unique = new Map();
    enfants.forEach((e) => unique.set(e.etablissement.id, e.etablissement));
    return Array.from(unique.values());
  }, [enfants]);

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
          <p className="text-sm text-slate-600 dark:text-zinc-400">Chargement des enfants...</p>
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
          <h1 className="text-2xl font-black tracking-tight">Tous les Enfants</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Vue d'ensemble de tous les enfants de la plateforme
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
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Total Enfants</p>
                <p className="text-2xl font-black mt-1">{stats.total}</p>
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
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Dossiers OK</p>
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
                <p className="text-2xl font-black mt-1 text-amber-600">{stats.attention}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                <IoAlertCircleOutline className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Urgents</p>
                <p className="text-2xl font-black mt-1 text-rose-600">{stats.urgent}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center border border-rose-200 dark:border-rose-800">
                <IoWarningOutline className="h-6 w-6 text-rose-600" />
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
                placeholder="Rechercher par nom ou établissement..."
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
                <SelectItem value="ok">Dossiers OK</SelectItem>
                <SelectItem value="attention">À surveiller</SelectItem>
                <SelectItem value="urgent">Urgents</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterEtablissement} onValueChange={setFilterEtablissement}>
              <SelectTrigger className="h-10 text-xs rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700">
                <SelectValue placeholder="Filtrer par établissement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les établissements</SelectItem>
                {etablissements.map((etab) => (
                  <SelectItem key={etab.id} value={etab.id}>
                    {etab.nom}
                  </SelectItem>
                ))}
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
                    Enfant
                    <SortIcon field="nom" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('age')}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide hover:text-purple-600 transition-colors"
                  >
                    Âge
                    <SortIcon field="age" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('etablissement')}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide hover:text-purple-600 transition-colors"
                  >
                    Établissement
                    <SortIcon field="etablissement" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
                    Infos Médicales
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('documents')}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide hover:text-purple-600 transition-colors"
                  >
                    Documents
                    <SortIcon field="documents" />
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
              {paginatedEnfants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <IoPeopleOutline className="h-16 w-16 text-slate-300 dark:text-zinc-600 mx-auto mb-4" />
                    <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
                      Aucun enfant ne correspond aux critères
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedEnfants.map((enfant) => {
                  console.log('Rendering enfant row:', { id: enfant.id, prenom: enfant.prenom, nom: enfant.nom });
                  return (
                  <tr
                    key={enfant.id || Math.random()}
                    onClick={() => {
                      console.log('Clicked enfant:', { id: enfant.id, prenom: enfant.prenom });
                      if (enfant.id) {
                        navigate(`/superadmin/enfants/${enfant.id}`);
                      } else {
                        console.error('ID manquant pour l\'enfant:', enfant);
                      }
                    }}
                    className="hover:bg-purple-50/50 dark:hover:bg-purple-950/20 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-purple-500/30">
                          <AvatarImage src={enfant.photo} />
                          <AvatarFallback className="bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-200 font-bold text-xs">
                            {enfant.prenom[0]}{enfant.nom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                            {enfant.prenom} {enfant.nom}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">
                            {format(new Date(enfant.dateNaissance), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700 dark:text-zinc-300">{getAge(enfant.dateNaissance)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <IoBusinessOutline className="h-4 w-4 text-slate-400 shrink-0" />
                        <p className="text-sm text-slate-700 dark:text-zinc-300 truncate max-w-[200px]">
                          {enfant.etablissement.nom}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {enfant.pai?.actif && (
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 text-[10px] px-1.5 py-0">
                            PAI
                          </Badge>
                        )}
                        {enfant.allergies && enfant.allergies.length > 0 && (
                          <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 text-[10px] px-1.5 py-0">
                            {enfant.allergies.length} allergie{enfant.allergies.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {enfant.groupeSanguin && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 text-[10px] px-1.5 py-0">
                            {enfant.groupeSanguin}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {enfant.documentsManquants > 0 || enfant.documentsExpires > 0 ? (
                        <div className="flex items-center gap-2">
                          <IoWarningOutline className="h-4 w-4 text-rose-600 shrink-0" />
                          <div className="text-xs">
                            {enfant.documentsManquants > 0 && (
                              <p className="text-rose-700 dark:text-rose-400 font-medium">
                                {enfant.documentsManquants} manquant{enfant.documentsManquants > 1 ? 's' : ''}
                              </p>
                            )}
                            {enfant.documentsExpires > 0 && (
                              <p className="text-amber-700 dark:text-amber-400 font-medium">
                                {enfant.documentsExpires} expiré{enfant.documentsExpires > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-600">
                          <IoCheckmarkCircleOutline className="h-4 w-4" />
                          <span className="text-xs font-medium">À jour</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={cn('text-[10px] px-2 py-0.5 font-bold', getStatutColor(enfant.statut))}>
                        {enfant.statut === 'ok' ? 'OK' : enfant.statut === 'attention' ? 'Attention' : 'Urgent'}
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
        {paginatedEnfants.length > 0 && (
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
                entrées sur {sortedEnfants.length}
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
