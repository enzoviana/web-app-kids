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
  IoBusinessOutline,
  IoAlertCircleOutline,
  IoStatsChartOutline,
  IoArrowForwardOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
        console.error('Erreur chargement logs:', err);
        setLogsSecurite([]);
      }
    } catch (err: any) {
      console.error('Erreur chargement données RSAI:', err);
      setError(err.response?.data?.error || 'Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const paiActifs = enfants.filter((e) => e.pai?.actif).length;
  const vaccinsAJour = enfants.filter((e) => e.vaccinations && e.vaccinations.length >= 2).length;
  const complianceRate = enfants.length > 0 ? Math.round((vaccinsAJour / enfants.length) * 100) : 0;
  const allergiesCount = enfants.filter((e) => e.allergies && e.allergies.length > 0).length;

  const filteredEnfants = enfants.filter((e) =>
    `${e.prenom} ${e.nom}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewEnfant = (enfantId: string) => {
    navigate(`/rsai/enfants/${enfantId}`);
  };

  const handleExportPDF = () => {
    alert(
      'Export du registre sanitaire en PDF\n\nCette fonctionnalité génèrera un rapport PDF complet incluant:\n- Liste des enfants avec leurs informations de santé\n- Statut des PAI actifs\n- Conformité vaccinale\n- Allergies et informations médicales\n- Journal d\'audit des accès\n\nFormat: PDF/A-3 (archivage légal)'
    );
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-fuchsia-50/20 to-indigo-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <IoReloadOutline className="h-12 w-12 text-fuchsia-500 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-slate-600 dark:text-zinc-400">Chargement du registre sanitaire...</p>
        </div>
      </div>
    );
  }

  if (!isOnSite) {
    return (
      <GeofencingStatus isOnSite={isOnSite} onToggle={() => setIsOnSite(!isOnSite)} creche={CRECHE_DATA} />
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
          <h1 className="text-2xl font-black tracking-tight">Tableau de bord RSAI</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Vue d'ensemble du registre sanitaire</p>
        </div>
      </div>

      {/* Bannière de Statut de Géorepérage */}
      <Card className="rounded-3xl border-fuchsia-200 dark:border-fuchsia-900/50 bg-fuchsia-50/40 dark:bg-fuchsia-950/20 backdrop-blur-xl shadow-md">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-900/60 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-800">
              <IoRadioButtonOnOutline className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-fuchsia-900 dark:text-fuchsia-200">
                  Accès Contrôlé RSAI — Présence Validée
                </span>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 text-[10px]"
                >
                  Périmètre &lt; 50m
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                <IoLocationOutline className="h-3.5 w-3.5 text-fuchsia-600 dark:text-fuchsia-400" />
                {CRECHE_DATA.nom} — {CRECHE_DATA.adresse}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsOnSite(false)}
            variant="outline"
            size="sm"
            className="h-9 text-xs border-fuchsia-200 dark:border-fuchsia-800 text-fuchsia-700 dark:text-fuchsia-300 hover:bg-fuchsia-100/50 dark:hover:bg-fuchsia-950/50 cursor-pointer rounded-2xl"
          >
            <IoLockClosedOutline className="mr-1.5 h-3.5 w-3.5" />
            Simuler sortie de zone (DEV)
          </Button>
        </CardContent>
      </Card>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Enfants Enregistrés</p>
                <p className="text-2xl font-black mt-1">{enfants.length}</p>
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
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Conformité Vaccinale</p>
                <p className="text-2xl font-black mt-1 text-emerald-600">{complianceRate}%</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                <IoShieldCheckmarkOutline className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">PAI Actifs</p>
                <p className="text-2xl font-black mt-1 text-amber-600">{paiActifs}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                <IoDocumentTextOutline className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Allergies Déclarées</p>
                <p className="text-2xl font-black mt-1 text-rose-600">{allergiesCount}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center border border-rose-200 dark:border-rose-800">
                <IoWarningOutline className="h-6 w-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dossiers des Enfants */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
        <CardHeader className="p-6 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-black">Dossiers des Enfants</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-zinc-400">
                Accès rapide aux informations de santé
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Rechercher un enfant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 text-xs rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                />
              </div>
              <Button
                size="sm"
                onClick={handleExportPDF}
                className="h-10 text-xs bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold shrink-0 cursor-pointer rounded-2xl"
              >
                <IoDownloadOutline className="mr-1.5 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {filteredEnfants.length === 0 ? (
            <div className="text-center py-12">
              <IoPeopleOutline className="h-16 w-16 text-slate-300 dark:text-zinc-600 mx-auto mb-4" />
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                {searchQuery ? 'Aucun enfant ne correspond à votre recherche.' : 'Aucun enfant enregistré.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEnfants.map((enfant) => (
                <motion.div
                  key={enfant.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                  onClick={() => handleViewEnfant(enfant.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 border-2 border-fuchsia-500/30">
                      <AvatarImage src={enfant.photo} />
                      <AvatarFallback className="bg-fuchsia-50 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200 text-sm font-bold">
                        {enfant.prenom[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold truncate">
                          {enfant.prenom} {enfant.nom}
                        </h4>
                        <IoArrowForwardOutline className="h-4 w-4 text-slate-400 shrink-0" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        {enfant.dateNaissance
                          ? Math.floor(
                              (new Date().getTime() - new Date(enfant.dateNaissance).getTime()) /
                                (365.25 * 24 * 60 * 60 * 1000)
                            )
                          : 0}{' '}
                        ans
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {enfant.pai?.actif && (
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 text-[10px] px-1.5 py-0">
                            PAI
                          </Badge>
                        )}
                        {enfant.allergies && enfant.allergies.length > 0 && (
                          <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 text-[10px] px-1.5 py-0">
                            Allergies
                          </Badge>
                        )}
                        {enfant.vaccinations && enfant.vaccinations.length >= 2 && (
                          <IoCheckmarkCircleOutline className="h-4 w-4 text-emerald-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Journal d'Audit */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
        <CardHeader className="p-6 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                <IoTimeOutline className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-black">Journal d'Audit</CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-zinc-400">
                  Dernières activités sur la plateforme
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/rsai/audit')}
              className="h-9 text-xs font-bold rounded-2xl cursor-pointer"
            >
              Voir tout
              <IoArrowForwardOutline className="ml-2 h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-3">
          {logsSecurite.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500 dark:text-zinc-400">Aucun événement de sécurité récent.</p>
            </div>
          ) : (
            logsSecurite.map((log) => {
              const isAuthorized = log.type === 'info' || log.type === 'success';

              return (
                <div
                  key={log._id || log.id}
                  className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                    isAuthorized
                      ? 'bg-slate-50 dark:bg-zinc-900/50 border-slate-200/80 dark:border-zinc-800'
                      : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isAuthorized ? (
                      <IoShieldCheckmarkOutline className="h-5 w-5 text-emerald-600 shrink-0" />
                    ) : (
                      <IoWarningOutline className="h-5 w-5 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono uppercase text-[10px]">
                        {log.action || log.type.replace(/_/g, ' ')}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        {log.message || log.details}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {format(new Date(log.createdAt || log.timestamp), 'dd/MM/yyyy · HH:mm', { locale: fr })}
                  </span>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
