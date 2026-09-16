import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  IoSearchOutline,
  IoAddOutline,
  IoDownloadOutline,
  IoMedkitOutline,
  IoShieldCheckmarkOutline,
  IoWarningOutline,
  IoAlertCircleOutline,
  IoChevronForwardOutline,
  IoChevronBackOutline,
  IoSparkles,
  IoHappyOutline,
  IoReloadOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { enfantApi } from '@/services/api';
import { CreateEnfantModal } from '@/components/modals/CreateEnfantModal';
import { CodeConfidentielModal } from '@/components/modals/CodeConfidentielModal';
import type { Enfant } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const ITEMS_PER_PAGE = 12; // Optimisation pour une navigation fluide par lots
const DEFAULT_ETABLISSEMENT_ID = 'test-creche-001'; // Établissement par défaut du seed

export const EnfantsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'sain' | 'symptome' | 'attention'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [newlyCreatedEnfant, setNewlyCreatedEnfant] = useState<Enfant | null>(null);

  // États pour les données API
  const [enfants, setEnfants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les enfants depuis le backend
  useEffect(() => {
    const loadEnfants = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await enfantApi.getEnfantsByEtablissement(DEFAULT_ETABLISSEMENT_ID);
        setEnfants(response.data || []);
      } catch (err: any) {
        console.error('Erreur chargement enfants:', err);
        setError(err.response?.data?.error || 'Erreur de chargement des enfants');
        setEnfants([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEnfants();
  }, []);

  // Filtrage global
  const filteredEnfants = useMemo(() => {
    return enfants.filter((e) => {
      const matchSearch =
        searchQuery === '' ||
        `${e.prenom} ${e.nom}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = filterStatus === 'all' || e.statut === filterStatus;
      return matchSearch && matchFilter;
    });
  }, [enfants, searchQuery, filterStatus]);

  // Pagination des résultats filtrés
  const paginatedEnfants = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEnfants.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEnfants, currentPage]);

  const totalPages = Math.ceil(filteredEnfants.length / ITEMS_PER_PAGE);

  // Stats globales
  const stats = useMemo(() => {
    const total = enfants.length;
    const sains = enfants.filter((e) => e.statut === 'sain').length;
    const symptomes = enfants.filter((e) => e.statut === 'symptome').length;
    const surveillance = enfants.filter((e) => e.statut === 'attention').length;
    return { total, sains, symptomes, surveillance };
  }, [enfants]);

  const handleDeleteEnfant = async (enfantId: string, prenom: string, nom: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${prenom} ${nom} ? Cette action est irréversible.`)) {
      return;
    }

    try {
      setIsLoading(true);
      await enfantApi.deleteEnfant(enfantId);

      // Recharger la liste des enfants
      const response = await enfantApi.getEnfantsByEtablissement(DEFAULT_ETABLISSEMENT_ID);
      setEnfants(response.data || []);

      console.log('✅ Enfant supprimé avec succès');
    } catch (err: any) {
      console.error('❌ Erreur suppression enfant:', err);
      alert(err.response?.data?.error || 'Erreur lors de la suppression de l\'enfant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnfantCreated = async (enfantData: any) => {
    try {
      // Ajouter l'établissement par défaut aux données
      const dataWithEtablissement = {
        ...enfantData,
        etablissementId: DEFAULT_ETABLISSEMENT_ID,
      };

      const response = await enfantApi.createEnfant(dataWithEtablissement);
      const newEnfant = response.data;

      // Ajouter le nouvel enfant à la liste locale
      setEnfants((prev) => [...prev, newEnfant]);

      setIsCreateModalOpen(false);
      setNewlyCreatedEnfant(newEnfant);
      setIsCodeModalOpen(true);

      console.log('✅ Enfant créé avec succès:', newEnfant);
    } catch (err: any) {
      console.error('❌ Erreur création enfant:', err);
      alert(err.response?.data?.error || 'Erreur lors de la création de l\'enfant');
    }
  };

  // Réinitialiser la page courante en cas de changement de filtre ou de recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (status: 'all' | 'sain' | 'symptome' | 'attention') => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-10 space-y-8 bg-gradient-to-br from-slate-50 via-teal-50/20 to-indigo-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 font-sans antialiased"
    >
      
      {/* Header Créatif */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-lg shadow-slate-200/50 dark:shadow-none">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <IoHappyOutline className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Registre des Enfants</h1>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {stats.total} inscrits au total
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">
                Fiches individuelles, suivi pédiatrique et protocoles d'urgence optimisés.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Créer CSV avec les données des enfants
              const headers = ['Prénom', 'Nom', 'Âge', 'Date de naissance', 'Statut', 'Section', 'Groupe sanguin'];
              const rows = filteredEnfants.map(e => [
                e.prenom,
                e.nom,
                e.age,
                e.dateNaissance,
                e.statut,
                e.section?.nom || '',
                e.groupeSanguin || ''
              ]);

              const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
              ].join('\n');

              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `enfants_${new Date().toISOString().split('T')[0]}.csv`;
              link.click();
            }}
            className="h-11 px-4 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition-all cursor-pointer shadow-xs"
          >
            <IoDownloadOutline className="h-4 w-4 mr-2 text-slate-500" />
            Exporter CSV
          </Button>
          <Button
            size="sm"
            className="h-11 px-5 text-xs font-bold rounded-2xl bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-md cursor-pointer"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <IoAddOutline className="h-4 w-4 mr-2" />
            Ajouter un enfant
          </Button>
        </div>
      </div>

      {/* Control Bar: Search & Status Tabs */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
        <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Rechercher par nom ou prénom..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/80 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 transition-all font-medium"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              Tous ({stats.total})
            </button>
            <button
              onClick={() => handleFilterChange('sain')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'sain'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              En forme ({stats.sains})
            </button>
            <button
              onClick={() => handleFilterChange('symptome')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'symptome'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              Symptômes ({stats.symptomes})
            </button>
            <button
              onClick={() => handleFilterChange('attention')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'attention'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              Surveillance ({stats.surveillance})
            </button>
          </div>

        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <IoReloadOutline className="h-12 w-12 text-teal-500 animate-spin" />
            <p className="text-sm font-semibold text-slate-600 dark:text-zinc-400">
              Chargement des enfants...
            </p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="p-8 text-center border-red-200 dark:border-red-900">
          <div className="flex flex-col items-center gap-4">
            <IoAlertCircleOutline className="h-12 w-12 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                Erreur de chargement
              </p>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                {error}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              <IoReloadOutline className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && enfants.length === 0 && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <IoHappyOutline className="h-12 w-12 text-slate-400" />
            <div>
              <p className="text-sm font-semibold text-slate-600 dark:text-zinc-400 mb-2">
                Aucun enfant inscrit
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-500">
                Commencez par ajouter votre premier enfant
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-2"
            >
              <IoAddOutline className="h-4 w-4 mr-2" />
              Ajouter un enfant
            </Button>
          </div>
        </Card>
      )}

      {/* Grid Children avec Animation */}
      {!isLoading && !error && enfants.length > 0 && (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {paginatedEnfants.map((enfant) => {
              // Calculer l'âge à partir de dateNaissance
              const age = enfant.dateNaissance
                ? Math.floor((new Date().getTime() - new Date(enfant.dateNaissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                : 0;

              return (
            <motion.div
              key={enfant.id || enfant._id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all shadow-md hover:shadow-xl flex flex-col justify-between h-full group"
              >
                <CardContent className="p-6 space-y-4">

                  {/* Profile Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <Avatar className="h-12 w-12 border-2 border-teal-500/30 shadow-md group-hover:scale-105 transition-transform">
                        <AvatarImage src={enfant.photo} alt={enfant.prenom} />
                        <AvatarFallback className="text-xs font-bold bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                          {enfant.prenom?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {enfant.prenom} {enfant.nom}
                        </h3>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5 font-medium">
                          {age} ans · Groupe {enfant.groupeSanguin || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Main Status Badge */}
                    <div>
                      {enfant.statut === 'sain' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-xl">
                          En forme
                        </span>
                      )}
                      {enfant.statut === 'symptome' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-xl animate-pulse">
                          <IoAlertCircleOutline className="h-3 w-3" />
                          Symptôme
                        </span>
                      )}
                      {enfant.statut === 'attention' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-xl">
                          <IoWarningOutline className="h-3 w-3" />
                          Surveillance
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Health Alerts Block */}
                  <div className="space-y-2 pt-1">
                    {enfant.pai?.actif ? (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-[11px] font-bold">
                        <IoShieldCheckmarkOutline className="h-4 w-4 shrink-0" />
                        <span className="truncate">PAI : {enfant.pai.pathologie}</span>
                      </div>
                    ) : null}

                    {enfant.allergies && enfant.allergies.length > 0 ? (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 text-[11px] font-bold">
                        <IoWarningOutline className="h-4 w-4 shrink-0" />
                        <span className="truncate">Allergie(s) : {enfant.allergies.join(', ')}</span>
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 text-[11px] font-semibold">
                      <span className="flex items-center gap-2">
                        <IoMedkitOutline className="h-4 w-4 text-slate-400" />
                        Groupe sanguin
                      </span>
                      <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-zinc-700">
                        {enfant.groupeSanguin || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 flex items-center gap-2 border-t border-slate-100 dark:border-zinc-800/80">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 text-xs font-bold rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 dark:hover:text-teal-400 transition-all cursor-pointer shadow-xs"
                      onClick={() => navigate(`/creche/enfants/${enfant.id || enfant._id}`)}
                    >
                      <span>Voir dossier</span>
                      <IoChevronForwardOutline className="ml-1 h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const symptome = prompt('Décrire le symptôme:');
                        if (symptome) {
                          alert(`Symptôme signalé pour ${enfant.prenom} ${enfant.nom}: ${symptome}\n\nCette fonctionnalité sera développée prochainement avec suivi détaillé.`);
                        }
                      }}
                      className="h-9 text-xs font-bold rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900/40 dark:text-amber-400 dark:hover:bg-amber-950/30 cursor-pointer shadow-xs"
                    >
                      + Symptôme
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteEnfant(enfant.id || enfant._id, enfant.prenom, enfant.nom)}
                      className="h-9 w-9 p-0 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/30 cursor-pointer shadow-xs"
                    >
                      <IoTrashOutline className="h-4 w-4" />
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          );
            })}
        </AnimatePresence>
      </motion.div>
      )}

      {/* Pagination Controls (Optimisé pour 20+ enfants) */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-4 px-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-md">
          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
            Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, filteredEnfants.length)} sur {filteredEnfants.length} enfants
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="h-9 px-3 text-xs font-bold rounded-xl border-slate-200 dark:border-zinc-700 cursor-pointer"
            >
              <IoChevronBackOutline className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-100 dark:bg-zinc-800 rounded-xl text-slate-700 dark:text-zinc-300">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="h-9 px-3 text-xs font-bold rounded-xl border-slate-200 dark:border-zinc-700 cursor-pointer"
            >
              Suivant
              <IoChevronForwardOutline className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* État Vide */}
      {filteredEnfants.length === 0 && (
        <div className="p-16 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md space-y-3">
          <IoHappyOutline className="h-10 w-10 text-slate-400 mx-auto animate-bounce" />
          <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
            Aucun enfant ne correspond à votre recherche.
          </p>
          <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
            Essayez de modifier vos filtres ou de réinitialiser la recherche.
          </p>
        </div>
      )}

      {/* Modals */}
      <CreateEnfantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEnfantCreated={handleEnfantCreated}
      />

      {newlyCreatedEnfant && (
        <CodeConfidentielModal
          isOpen={isCodeModalOpen}
          onClose={() => {
            setIsCodeModalOpen(false);
            setNewlyCreatedEnfant(null);
          }}
          enfant={newlyCreatedEnfant}
          userId={user?.id || 'c1'}
          userRole={user?.role as 'creche' | 'rsai' | 'superadmin'}
        />
      )}

    </motion.div>
  );
};