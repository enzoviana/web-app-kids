import React, { useState, useMemo, useEffect } from 'react';
import {
  IoCardOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoPauseCircleOutline,
  IoCalendarOutline,
  IoBusinessOutline,
  IoCreateOutline,
  IoStatsChartOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { abonnementApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

export const GestionAbonnementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<'tous' | 'actif' | 'inactif' | 'suspendu'>('tous');
  const [filterPlan, setFilterPlan] = useState<'tous' | 'basic' | 'premium' | 'enterprise'>('tous');

  // États pour le backend
  const [abonnements, setAbonnements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Charger les abonnements et les stats en parallèle
        const [abonnementsResponse, statsResponse] = await Promise.all([
          abonnementApi.getAllAbonnements(),
          abonnementApi.getAbonnementStats(),
        ]);

        setAbonnements(abonnementsResponse.data || []);
        setStats(statsResponse.data || {});
      } catch (err: any) {
        console.error('Erreur lors du chargement des données:', err);
        setError(err.response?.data?.error || 'Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrage des abonnements
  const filteredAbonnements = useMemo(() => {
    return abonnements.filter(ab => {
      const matchesSearch =
        (ab.crecheNom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ab.crecheEmail || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatut = filterStatut === 'tous' || ab.statut === filterStatut;
      const matchesPlan = filterPlan === 'tous' || ab.plan === filterPlan;

      return matchesSearch && matchesStatut && matchesPlan;
    });
  }, [abonnements, searchTerm, filterStatut, filterPlan]);

  // Handlers pour les actions
  const handleSuspendre = async (abonnementId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir suspendre cet abonnement ?')) {
      return;
    }

    try {
      const raison = prompt('Raison de la suspension :');
      if (!raison) return;

      await abonnementApi.suspendreAbonnement(abonnementId, raison);

      // Recharger les données
      const [abonnementsResponse, statsResponse] = await Promise.all([
        abonnementApi.getAllAbonnements(),
        abonnementApi.getAbonnementStats(),
      ]);

      setAbonnements(abonnementsResponse.data || []);
      setStats(statsResponse.data || {});
    } catch (err: any) {
      console.error('Erreur lors de la suspension:', err);
      alert(err.response?.data?.error || 'Erreur lors de la suspension');
    }
  };

  const handleReactiver = async (abonnementId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir réactiver cet abonnement ?')) {
      return;
    }

    try {
      await abonnementApi.reactiverAbonnement(abonnementId);

      // Recharger les données
      const [abonnementsResponse, statsResponse] = await Promise.all([
        abonnementApi.getAllAbonnements(),
        abonnementApi.getAbonnementStats(),
      ]);

      setAbonnements(abonnementsResponse.data || []);
      setStats(statsResponse.data || {});
    } catch (err: any) {
      console.error('Erreur lors de la réactivation:', err);
      alert(err.response?.data?.error || 'Erreur lors de la réactivation');
    }
  };

  const handleModifier = async (abonnementId: string) => {
    // TODO: Ouvrir un modal de modification ou naviguer vers une page de détails
    console.log('Modifier abonnement:', abonnementId);
    alert('Fonctionnalité de modification à implémenter');
  };

  const getPlanBadgeStyle = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'premium':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'enterprise':
        return 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400 border-pink-200 dark:border-pink-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  // État de loading
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="p-6 md:p-10 space-y-8 bg-slate-50/50 dark:bg-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 font-sans antialiased"
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Chargement des abonnements...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="p-6 md:p-10 space-y-8 bg-slate-50/50 dark:bg-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 font-sans antialiased"
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full rounded-2xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-zinc-900">
            <CardContent className="p-8 text-center space-y-4">
              <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-950/40 w-fit mx-auto">
                <IoAlertCircleOutline className="h-8 w-8 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Erreur de chargement</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2">{error}</p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="h-10 px-4 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-10 space-y-8 bg-slate-50/50 dark:bg-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 font-sans antialiased"
    >
      {/* Top Header Professionnel & Épuré (Aligné avec le Dashboard) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
              <IoCardOutline className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Gestion des Abonnements
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Suivi et supervision centralisée des abonnements des crèches
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
            className="h-10 px-4 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm cursor-pointer"
            onClick={() => navigate('/superadmin/tarifs')}
          >
            <IoStatsChartOutline className="h-4 w-4 mr-2" />
            Gérer les tarifs
          </Button>
        </div>
      </div>

      {/* Grid Statistiques (Même style que le Dashboard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Abonnements Actifs
            </CardTitle>
            <IoCheckmarkCircleOutline className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{stats?.actifs || 0}</div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
              Sur {stats?.total || 0} abonnements totaux
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs border-l-4 border-l-rose-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Inactifs
            </CardTitle>
            <IoCloseCircleOutline className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{stats?.inactifs || 0}</div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
              En attente de renouvellement
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Suspendus
            </CardTitle>
            <IoPauseCircleOutline className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{stats?.suspendus || 0}</div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
              Comptes temporairement bloqués
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Revenu Total
            </CardTitle>
            <IoCardOutline className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              {(stats?.revenuTotal || 0).toLocaleString('fr-FR')} €
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
              {stats?.revenuMensuel || 0}€/mois + {stats?.revenuAnnuel || 0}€/an
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche et filtres unifiés */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher par nom ou email de crèche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-xs bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <IoFilterOutline className="h-4 w-4 text-slate-400 shrink-0" />
              
              <Select value={filterStatut} onValueChange={(value: any) => setFilterStatut(value)}>
                <SelectTrigger className="w-full md:w-[150px] h-10 text-xs bg-slate-50/50 dark:bg-zinc-800/50 rounded-xl border-slate-200 dark:border-zinc-700">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous statuts</SelectItem>
                  <SelectItem value="actif">Actifs</SelectItem>
                  <SelectItem value="inactif">Inactifs</SelectItem>
                  <SelectItem value="suspendu">Suspendus</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPlan} onValueChange={(value: any) => setFilterPlan(value)}>
                <SelectTrigger className="w-full md:w-[150px] h-10 text-xs bg-slate-50/50 dark:bg-zinc-800/50 rounded-xl border-slate-200 dark:border-zinc-700">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les plans</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des abonnements */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800 px-6 pt-6">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Liste des abonnements
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {filteredAbonnements.length} abonnement{filteredAbonnements.length > 1 ? 's' : ''} affiché{filteredAbonnements.length > 1 ? 's' : ''}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredAbonnements.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-zinc-500 text-xs">
              Aucun abonnement ne correspond aux critères de recherche.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filteredAbonnements.map((ab) => (
                <div
                  key={ab._id}
                  className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 shrink-0">
                      <IoBusinessOutline className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {ab.crecheNom}
                        </p>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-semibold border ${getPlanBadgeStyle(ab.plan)}`}>
                          {ab.plan.toUpperCase()}
                        </Badge>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                          ab.statut === 'actif' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                          ab.statut === 'suspendu' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                          'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}>
                          {ab.statut === 'actif' && <IoCheckmarkCircleOutline className="h-3 w-3" />}
                          {ab.statut === 'suspendu' && <IoPauseCircleOutline className="h-3 w-3" />}
                          {ab.statut === 'inactif' && <IoCloseCircleOutline className="h-3 w-3" />}
                          {ab.statut}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-1 text-[11px] text-slate-500 dark:text-zinc-400 flex-wrap">
                        <span className="flex items-center gap-1 font-mono font-semibold text-slate-700 dark:text-zinc-300">
                          <IoCardOutline className="h-3.5 w-3.5 text-slate-400" />
                          {ab.montant}€ / {ab.periodePaiement === 'mensuel' ? 'mois' : 'an'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <IoCalendarOutline className="h-3.5 w-3.5 text-slate-400" />
                          Du {format(new Date(ab.dateDebut), 'dd/MM/yyyy', { locale: fr })} au{' '}
                          {format(new Date(ab.dateFin), 'dd/MM/yyyy', { locale: fr })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModifier(ab._id)}
                      className="h-8 text-xs font-semibold rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 cursor-pointer"
                    >
                      <IoCreateOutline className="h-3.5 w-3.5 mr-1 text-blue-600" />
                      Modifier
                    </Button>
                    {ab.statut === 'actif' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSuspendre(ab._id)}
                        className="h-8 text-xs font-semibold rounded-xl text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                      >
                        Suspendre
                      </Button>
                    )}
                    {ab.statut === 'suspendu' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReactiver(ab._id)}
                        className="h-8 text-xs font-semibold rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                      >
                        Réactiver
                      </Button>
                    )}
                    {ab.statut === 'inactif' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReactiver(ab._id)}
                        className="h-8 text-xs font-semibold rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                      >
                        Réactiver
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};