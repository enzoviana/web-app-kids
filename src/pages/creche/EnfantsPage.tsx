import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  IoSearchOutline,
  IoAddOutline,
  IoDownloadOutline,
  IoChevronForwardOutline,
  IoChevronBackOutline,
  IoReloadOutline,
  IoPeopleOutline,
  IoArrowForwardOutline,
} from 'react-icons/io5';
import { AppBackground } from '@/components/AppBackground';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { enfantApi } from '@/services/api';
import { CreateEnfantModal } from '@/components/modals/CreateEnfantModal';
import { CodeConfidentielModal } from '@/components/modals/CodeConfidentielModal';
import type { Enfant } from '@/types';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 8; // Optimisé pour liste vue RSAI
const DEFAULT_ETABLISSEMENT_ID = 'test-creche-001'; // Établissement par défaut du seed

export const EnfantsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isRSAI = user?.role === 'rsai' || user?.role === 'professionnel_rsai';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pai' | 'allergies'>('all');
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

  // Filtrage combiné (RSAI style: PAI + Allergies + Recherche)
  const filteredEnfants = useMemo(() => {
    return enfants.filter((e) => {
      const matchesSearch =
        searchQuery === '' ||
        `${e.prenom} ${e.nom}`.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === 'pai') return e.pai?.actif;
      if (activeTab === 'allergies') return e.allergies && e.allergies.length > 0;

      return true; // 'all'
    });
  }, [enfants, searchQuery, activeTab]);

  // Pagination des résultats filtrés
  const paginatedEnfants = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEnfants.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEnfants, currentPage]);

  const totalPages = Math.ceil(filteredEnfants.length / ITEMS_PER_PAGE) || 1;

  // Stats globales (style RSAI)
  const stats = useMemo(() => {
    const total = enfants.length;
    const paiActifs = enfants.filter((e) => e.pai?.actif).length;
    const allergiesSignalees = enfants.filter((e) => e.allergies && e.allergies.length > 0).length;
    const vaccinsAJour = enfants.filter((e) => e.vaccinations && e.vaccinations.length >= 2).length;
    const complianceRate = total > 0 ? Math.round((vaccinsAJour / total) * 100) : 0;
    return { total, paiActifs, allergiesSignalees, complianceRate };
  }, [enfants]);

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

  const handleTabChange = (tab: 'all' | 'pai' | 'allergies') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <AppBackground>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 md:p-10 space-y-8 min-h-screen text-slate-900 dark:text-zinc-100 font-sans antialiased"
      >

        {/* TOP CONTENT CONTAINER */}
        <div className="w-full max-w-6xl mx-auto space-y-6">

          {/* HEADER PRO */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-900">
                  Module Enfants
                </span>
                <span className="text-xs text-slate-500 font-mono">Effectif : {stats.total} enfants</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Registre des Enfants Inscrits
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {!isRSAI && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-medium text-xs h-9 px-4 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <IoAddOutline className="h-4 w-4" />
                  Ajouter un enfant
                </Button>
              )}
              <Button
                onClick={() => {
                  const headers = ['Prénom', 'Nom', 'Âge', 'Groupe sanguin', 'PAI', 'Allergies'];
                  const rows = filteredEnfants.map(e => [
                    e.prenom,
                    e.nom,
                    e.dateNaissance
                      ? `${Math.floor((new Date().getTime() - new Date(e.dateNaissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} ans`
                      : '',
                    e.groupeSanguin || 'N/A',
                    e.pai?.actif ? e.pai.pathologie : 'Non',
                    e.allergies && e.allergies.length > 0 ? e.allergies.join(', ') : 'Non'
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
                variant="outline"
                className="text-xs h-9 px-4 rounded-xl cursor-pointer"
              >
                <IoDownloadOutline className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </div>

          {/* KPI METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-sm border-l-4 border-l-fuchsia-600">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Enfants Inscrits</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
            </div>

            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-sm border-l-4 border-l-emerald-500">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Conformité Vaccinale</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.complianceRate}%</p>
            </div>

            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-sm border-l-4 border-l-amber-500">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">PAI Actifs (Urgences)</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.paiActifs}</p>
            </div>

            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-sm border-l-4 border-l-rose-500">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Allergies Signalées</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{stats.allergiesSignalees}</p>
            </div>
          </div>

          {/* TABLEAU DES ENFANTS */}
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Dossiers Nominatifs des Enfants</h2>
                <p className="text-xs text-slate-500">Affichage sous forme de liste structurée ({filteredEnfants.length} résultats)</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative w-full sm:w-60">
                  <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher par nom..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9 h-9 text-xs bg-white/40 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100/60 dark:bg-zinc-800/60 p-1 rounded-xl w-full sm:w-auto">
                  <button
                    onClick={() => handleTabChange('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'all' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => handleTabChange('pai')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'pai' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    PAI
                  </button>
                  <button
                    onClick={() => handleTabChange('allergies')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'allergies' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Allergies
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4">
              {paginatedEnfants.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-mono">
                  Aucun dossier enfant ne correspond aux critères actuels.
                </div>
              ) : (
                <div className="space-y-2">
                  {paginatedEnfants.map((enfant) => {
                    const age = enfant.dateNaissance
                      ? Math.floor((new Date().getTime() - new Date(enfant.dateNaissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                      : 0;

                    return (
                      <div
                        key={enfant.id || enfant._id}
                        onClick={() => navigate(`/${user?.role}/enfants/${enfant.id || enfant._id}`)}
                        className="p-3 bg-white/40 dark:bg-zinc-800/40 hover:bg-white/80 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-4 group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <Avatar className="h-9 w-9 border border-slate-200 dark:border-zinc-700 shrink-0">
                            <AvatarImage src={enfant.photo} />
                            <AvatarFallback className="bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200 text-xs font-mono font-bold">
                              {enfant.prenom?.[0]}{enfant.nom?.[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-fuchsia-600 transition-colors">
                                {enfant.prenom} {enfant.nom}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {age} ans
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1 mt-1">
                              {enfant.pai?.actif && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                  PAI actif
                                </span>
                              )}
                              {enfant.allergies && enfant.allergies.length > 0 && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                  Allergie(s)
                                </span>
                              )}
                              {enfant.vaccinations && enfant.vaccinations.length >= 2 && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  Vaccins OK
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 text-slate-400 group-hover:text-fuchsia-600 transition-colors">
                          <span className="text-xs font-mono hidden sm:inline">Dossier</span>
                          <IoArrowForwardOutline className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CONTRÔLES DE PAGINATION */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200/80 dark:border-zinc-800 px-1">
                  <span className="text-xs text-slate-500 font-mono">
                    Page {currentPage} / {totalPages}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className="h-8 px-2.5 text-xs rounded-xl cursor-pointer bg-white/40 dark:bg-zinc-900/40"
                    >
                      <IoChevronBackOutline className="h-3.5 w-3.5 mr-1" /> Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      className="h-8 px-2.5 text-xs rounded-xl cursor-pointer bg-white/40 dark:bg-zinc-900/40"
                    >
                      Suivant <IoChevronForwardOutline className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="w-full max-w-6xl mx-auto text-center border-t border-slate-200/30 dark:border-zinc-800/30 pt-4 mt-6">
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            Kids'Med IA © 2026 · Plateforme de gestion sanitaire de la petite enfance
          </p>
        </div>

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
    </AppBackground>
  );
};
