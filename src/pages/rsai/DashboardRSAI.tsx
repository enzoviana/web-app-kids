import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoDownloadOutline,
  IoSearchOutline,
  IoLockClosedOutline,
  IoRadioButtonOnOutline,
  IoReloadOutline,
  IoPeopleOutline,
  IoArrowForwardOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
} from 'react-icons/io5';
import { AppBackground } from '@/components/AppBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { GeofencingStatus } from './GeofencingStatus';
import { enfantApi, logApi } from '@/services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

const DEFAULT_ETABLISSEMENT_ID = 'test-creche-001';
const CRECHE_DATA = {
  nom: 'Micro-Crèche Les Petits Sourires',
  adresse: '12 Rue des Lilas, 75015 Paris',
};

export const DashboardRSAI: React.FC = () => {
  const navigate = useNavigate();
  const [isOnSite, setIsOnSite] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pai' | 'allergies'>('all');
  
  // Pagination (Optimisé pour 20+ enfants)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [enfants, setEnfants] = useState<any[]>([]);
  const [logsSecurite, setLogsSecurite] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const enfantsResponse = await enfantApi.getEnfantsByEtablissement(DEFAULT_ETABLISSEMENT_ID);
      setEnfants(enfantsResponse.data || []);

      try {
        const logsResponse = await logApi.getLogs({ limit: 5 });
        setLogsSecurite(logsResponse.data || []);
      } catch (err) {
        setLogsSecurite([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const paiActifs = enfants.filter((e) => e.pai?.actif);
  const vaccinsAJour = enfants.filter((e) => e.vaccinations && e.vaccinations.length >= 2).length;
  const complianceRate = enfants.length > 0 ? Math.round((vaccinsAJour / enfants.length) * 100) : 0;
  const allergiesList = enfants.filter((e) => e.allergies && e.allergies.length > 0);

  // Filtrage combiné
  const filteredEnfants = enfants.filter((e) => {
    const matchesSearch = `${e.prenom} ${e.nom}`.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'pai') return e.pai?.actif;
    if (activeTab === 'allergies') return e.allergies && e.allergies.length > 0;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEnfants.length / itemsPerPage) || 1;
  const paginatedEnfants = filteredEnfants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportPDF = () => {
    alert("Export officiel du Registre Sanitaire (PDF/A-3).");
  };

  if (loading) {
    return (
      <AppBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-3">
            <IoReloadOutline className="h-8 w-8 text-fuchsia-600 animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-500">Chargement sécurisé du registre...</p>
          </div>
        </div>
      </AppBackground>
    );
  }

  if (!isOnSite) {
    return (
      <AppBackground>
        <GeofencingStatus isOnSite={isOnSite} onToggle={() => setIsOnSite(!isOnSite)} creche={CRECHE_DATA} />
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen text-slate-900 dark:text-zinc-100 flex flex-col justify-between p-6 md:p-10 font-sans antialiased space-y-6"
      >
        {/* TOP CONTENT CONTAINER */}
        <div className="w-full max-w-6xl mx-auto space-y-6">
          
          {/* HEADER PRO */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-900">
                  Module Sanitaire RSAI
                </span>
                <span className="text-xs text-slate-500 font-mono">Effectif : {enfants.length} enfants</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Registre de Santé & Traçabilité
              </h1>
            </div>

            <Button
              onClick={handleExportPDF}
              className="bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-medium text-xs h-9 px-4 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <IoDownloadOutline className="h-4 w-4" />
              Exporter le Registre (PDF)
            </Button>
          </div>

          {/* STATUT GEOFENCING */}
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-fuchsia-200/50 dark:border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-950/60 border border-fuchsia-200 dark:border-fuchsia-900 flex items-center justify-center text-fuchsia-700 dark:text-fuchsia-300 shrink-0">
                <IoRadioButtonOnOutline className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Périmètre de Sécurité Validé</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                    Actif (&lt;50m)
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-mono">
                  <IoLocationOutline className="inline mr-1 text-fuchsia-600" /> {CRECHE_DATA.nom} — {CRECHE_DATA.adresse}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsOnSite(false)}
              variant="outline"
              size="sm"
              className="h-8 text-xs font-mono border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer rounded-xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md"
            >
              <IoLockClosedOutline className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
              Simuler sortie de zone
            </Button>
          </div>

          {/* KPI METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-sm border-l-4 border-l-fuchsia-600">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Enfants Inscrits</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{enfants.length}</p>
            </div>

            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-sm border-l-4 border-l-emerald-500">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Conformité Vaccinale</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{complianceRate}%</p>
            </div>

            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-sm border-l-4 border-l-amber-500">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">PAI Actifs (Urgences)</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{paiActifs.length}</p>
            </div>

            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-sm border-l-4 border-l-rose-500">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Allergies Signalées</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{allergiesList.length}</p>
            </div>
          </div>

          {/* TABLEAU DES ENFANTS (Optimisé 20+ enfants, propre et pro) */}
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
                    onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'all' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => { setActiveTab('pai'); setCurrentPage(1); }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'pai' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    PAI
                  </button>
                  <button
                    onClick={() => { setActiveTab('allergies'); setCurrentPage(1); }}
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
                  {paginatedEnfants.map((enfant) => (
                    <div
                      key={enfant.id || enfant._id}
                      onClick={() => navigate(`/rsai/enfants/${enfant.id || enfant._id}`)}
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
                              {enfant.dateNaissance
                                ? `${Math.floor((new Date().getTime() - new Date(enfant.dateNaissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} ans`
                                : ''}
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
                  ))}
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

          {/* JOURNAL D'AUDIT COMPACT */}
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IoTimeOutline className="h-4 w-4 text-slate-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">Journal d'Audit Récent</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/rsai/audit')}
                className="text-xs text-fuchsia-700 dark:text-fuchsia-400 h-7 font-bold cursor-pointer hover:bg-transparent"
              >
                Historique complet <IoArrowForwardOutline className="ml-1 h-3 w-3" />
              </Button>
            </div>

            <div className="p-4 space-y-2">
              {logsSecurite.length === 0 ? (
                <p className="text-xs text-slate-400 font-mono text-center py-2">Aucun log récent consigné.</p>
              ) : (
                logsSecurite.map((log) => (
                  <div
                    key={log._id || log.id}
                    className="p-2.5 rounded-xl bg-white/40 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/50 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="min-w-0 pr-4">
                      <span className="font-bold text-slate-900 dark:text-zinc-100 uppercase text-[10px]">
                        {log.action || log.type}
                      </span>
                      <p className="text-slate-500 text-[11px] truncate mt-0.5">{log.message || log.details}</p>
                    </div>
                    <span className="text-slate-400 text-[10px] shrink-0">
                      {format(new Date(log.createdAt || log.timestamp), 'dd/MM · HH:mm', { locale: fr })}
                    </span>
                  </div>
                ))
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
      </motion.div>
    </AppBackground>
  );
};