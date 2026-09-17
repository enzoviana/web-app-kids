import React, { useMemo, useState, useEffect } from 'react';
import {
  IoBusinessOutline,
  IoPeopleOutline,
  IoShieldCheckmarkOutline,
  IoStatsChartOutline,
  IoPersonAddOutline,
  IoCardOutline,
  IoChevronForward,
  IoSparklesOutline,
  IoHeartOutline,
  IoAnalyticsOutline,
  IoWalletOutline,
  IoReloadOutline,
  IoAlertCircleOutline,
  IoDocumentTextOutline,
  IoWarningOutline,
  IoSparkles,
} from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { userApi, abonnementApi, tarifApi, enfantApi, etablissementApi } from '@/services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppBackground } from '@/components/AppBackground';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { toast } from 'sonner';

export const DashboardSuperAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [periodeGraphique, setPeriodeGraphique] = useState<'hebdomadaire' | 'mensuel' | 'annuel'>('mensuel');

  // État pour les données réelles
  const [users, setUsers] = useState<any[]>([]);
  const [abonnements, setAbonnements] = useState<any[]>([]);
  const [tarifs, setTarifs] = useState<any[]>([]);
  const [enfants, setEnfants] = useState<any[]>([]);
  const [etablissements, setEtablissements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données au montage
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [usersResponse, abonnementsResponse, tarifsResponse, enfantsResponse, etablissementsResponse] = await Promise.all([
          userApi.getAllUsers().catch(() => ({ data: [] })),
          abonnementApi.getAllAbonnements().catch(() => ({ data: [] })),
          tarifApi.getAllTarifs().catch(() => ({ data: [] })),
          enfantApi.getAllEnfants().catch(() => ({ data: [] })),
          etablissementApi.getAllEtablissements().catch(() => ({ data: [] })),
        ]);

        setUsers(usersResponse.data || []);
        setAbonnements(abonnementsResponse.data || []);
        setTarifs(tarifsResponse.data || []);
        setEnfants(enfantsResponse.data || []);
        setEtablissements(etablissementsResponse.data || []);
      } catch (err: any) {
        console.error('Erreur chargement dashboard:', err);
        setError('Erreur de chargement des données');
        toast.error('Erreur de chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Calculs des KPIs globaux à partir des vraies données
  const statsGlobales = useMemo(() => {
    const totalMedecins = users.filter(u => u.role === 'professionnel').length;
    const totalCreches = etablissements.length;
    const totalRSAI = users.filter(u => u.role === 'professionnel').length; // Même que médecins pour l'instant
    const totalParents = users.filter(u => u.role === 'parent').length;
    const abonnementsActifs = abonnements.filter(a => a.statut === 'actif' || a.statut === 'active').length;
    const abonnementsInactifs = abonnements.filter(a => a.statut === 'inactif' || a.statut === 'inactive').length;
    const totalAbonnements = abonnementsActifs + abonnementsInactifs || 1;

    // Statistiques enfants
    const totalEnfants = enfants.length;
    // Compter les enfants avec documents manquants ou vides
    const documentsManquants = enfants.filter((enfant: any) => {
      const docs = enfant.documents || [];
      return docs.length === 0 || docs.some((doc: any) => doc.statut === 'manquant' || doc.statut === 'expired');
    }).length;

    // Statistiques établissements
    const totalEtablissements = etablissements.length;
    // Compter les établissements nécessitant une surveillance (statut attention ou urgent)
    const etablissementsASurveiller = etablissements.filter((etab: any) => {
      return etab.statut === 'attention' || etab.statut === 'urgent';
    }).length;

    return {
      totalMedecins,
      totalCreches,
      totalRSAI,
      totalParents,
      abonnementsActifs,
      abonnementsInactifs,
      tauxActifs: Math.round((abonnementsActifs / totalAbonnements) * 100),
      totalEnfants,
      documentsManquants,
      totalEtablissements,
      etablissementsASurveiller,
    };
  }, [users, abonnements, enfants, etablissements]);

  // Distribution des abonnements par plan à partir des vraies données
  const distributionPlans = useMemo(() => {
    const plans = abonnements.reduce((acc, ab) => {
      if (ab.statut === 'actif' || ab.statut === 'active') {
        const planKey = ab.plan.toLowerCase();
        acc[planKey] = (acc[planKey] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalActifs = Object.values(plans).reduce((a, b) => a + b, 0) || 1;

    return {
      starter: plans.starter || 0,
      starterPercent: Math.round(((plans.starter || 0) / totalActifs) * 100),
      essentiel: plans.essentiel || 0,
      essentielPercent: Math.round(((plans.essentiel || 0) / totalActifs) * 100),
      premium: plans.premium || 0,
      premiumPercent: Math.round(((plans.premium || 0) / totalActifs) * 100),
      totalActifs,
    };
  }, [abonnements]);

  // Données structurées pour Recharts
  const donneesGraphique = useMemo(() => {
    if (periodeGraphique === 'hebdomadaire') {
      return [
        { name: 'Lun', abonnements: 4, ca: 450 },
        { name: 'Mar', abonnements: 6, ca: 720 },
        { name: 'Mer', abonnements: 5, ca: 590 },
        { name: 'Jeu', abonnements: 9, ca: 1050 },
        { name: 'Ven', abonnements: 8, ca: 890 },
        { name: 'Sam', abonnements: 3, ca: 300 },
        { name: 'Dim', abonnements: 2, ca: 150 },
      ];
    } else if (periodeGraphique === 'mensuel') {
      return [
        { name: 'Jan', abonnements: 12, ca: 1800 },
        { name: 'Fév', abonnements: 15, ca: 2250 },
        { name: 'Mar', abonnements: 18, ca: 2700 },
        { name: 'Avr', abonnements: 22, ca: 3300 },
        { name: 'Mai', abonnements: 25, ca: 3750 },
        { name: 'Juin', abonnements: 32, ca: 4800 },
      ];
    } else {
      return [
        { name: '2023', abonnements: 120, ca: 18000 },
        { name: '2024', abonnements: 210, ca: 31500 },
        { name: '2025', abonnements: 340, ca: 51000 },
        { name: '2026', abonnements: 490, ca: 73500 },
      ];
    }
  }, [periodeGraphique]);

  // Activité récente basée sur les derniers utilisateurs créés
  const activiteRecente = useMemo(() => {
    const recentUsers = [...users]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);

    return recentUsers.map((user, idx) => ({
      id: user.id,
      type: 'nouveau_compte',
      description: `Nouveau compte créé : ${user.profile?.prenom || ''} ${user.profile?.nom || ''}`,
      timestamp: new Date(user.createdAt),
      utilisateur: user.email,
    }));
  }, [users]);

  // Loading state
  if (isLoading) {
    return (
      <AppBackground>
        <div className="max-w-6xl mx-auto p-6 md:p-10 flex items-center justify-center h-[50vh]">
          <div className="text-center space-y-4">
            <IoReloadOutline className="h-12 w-12 text-amber-600 dark:text-amber-400 mx-auto animate-spin" />
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
              Chargement du tableau de bord...
            </p>
          </div>
        </div>
      </AppBackground>
    );
  }

  // Error state
  if (error) {
    return (
      <AppBackground>
        <div className="max-w-6xl mx-auto p-6 md:p-10 flex items-center justify-center h-[50vh]">
          <div className="text-center space-y-4">
            <IoAlertCircleOutline className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">{error}</p>
            <Button size="sm" onClick={() => window.location.reload()} className="bg-amber-600 hover:bg-amber-700">
              <IoReloadOutline className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 text-slate-900 dark:text-zinc-100"
      >
      {/* Top Header */}
      <div className="border-b border-slate-200/80 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-2.5 mb-2">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Tableau de bord SuperAdmin
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shadow-xs">
            <IoSparkles className="h-3.5 w-3.5" />
            Super Admin
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Administration centrale et supervision de la plateforme Kids'Med IA
        </p>
        <div className="flex items-center gap-3 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-4 text-xs font-semibold rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition-all"
            onClick={() => navigate('/superadmin/comptes')}
          >
            <IoPersonAddOutline className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
            Créer un compte
          </Button>
          <Button
            size="sm"
            className="h-10 px-4 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-sm"
            onClick={() => navigate('/superadmin/tarifs')}
          >
            <IoWalletOutline className="h-4 w-4 mr-2" />
            Gérer les tarifs
          </Button>
        </div>
      </div>

      {/* Grid KPIs Acteurs Principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Médecins', count: statsGlobales.totalMedecins, sub: 'Pédiatres référencés', icon: IoPeopleOutline, accent: 'border-l-blue-500' },
          { title: 'Crèches', count: statsGlobales.totalCreches, sub: 'Établissements actifs', icon: IoBusinessOutline, accent: 'border-l-emerald-500' },
          { title: 'Inspecteurs RSAI', count: statsGlobales.totalRSAI, sub: 'Agents de santé', icon: IoShieldCheckmarkOutline, accent: 'border-l-indigo-500' },
          { title: 'Parents', count: statsGlobales.totalParents, sub: 'Comptes parentaux', icon: IoHeartOutline, accent: 'border-l-pink-500' },
        ].map((item, idx) => (
          <Card key={idx} className={`rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xs border-l-4 ${item.accent}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5 space-y-0">
              <CardTitle className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                {item.title}
              </CardTitle>
              <item.icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{item.count}</div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
                {item.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vision Globale Plateforme - Nouvelles Cards Cliquables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-zinc-900 shadow-xs hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => navigate('/superadmin/enfants')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-sm">
                  <IoPeopleOutline className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Vue Globale Enfants
                  </CardTitle>
                  <CardDescription className="text-xs">Tous les enfants de la plateforme</CardDescription>
                </div>
              </div>
              <IoChevronForward className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 dark:text-zinc-400">Total enfants</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{statsGlobales.totalEnfants}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 dark:text-zinc-400">Documents manquants</p>
                <div className="flex items-center gap-2">
                  <IoWarningOutline className="h-4 w-4 text-amber-500" />
                  <p className="text-2xl font-bold text-amber-600">{statsGlobales.documentsManquants}</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4 text-xs font-semibold text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-xl"
            >
              Voir tous les enfants
              <IoChevronForward className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card
          className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-zinc-900 shadow-xs hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => navigate('/superadmin/creches')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm">
                  <IoBusinessOutline className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Vue Globale Établissements
                  </CardTitle>
                  <CardDescription className="text-xs">Toutes les crèches de la plateforme</CardDescription>
                </div>
              </div>
              <IoChevronForward className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 dark:text-zinc-400">Total établissements</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{statsGlobales.totalEtablissements}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 dark:text-zinc-400">À surveiller</p>
                <div className="flex items-center gap-2">
                  <IoDocumentTextOutline className="h-4 w-4 text-rose-500" />
                  <p className="text-2xl font-bold text-rose-600">{statsGlobales.etablissementsASurveiller}</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl"
            >
              Voir tous les établissements
              <IoChevronForward className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ======================================================== */}
      {/* VRAI GRAPHIQUE PROFESSIONNEL (RECHARTS)                    */}
      {/* ======================================================== */}
      <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 pt-6 pb-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <IoStatsChartOutline className="h-5 w-5 text-amber-600" />
              Performance financière et acquisition
            </CardTitle>
            <CardDescription className="text-xs">Suivi comparatif dynamique du Chiffre d'Affaires et des abonnements</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Légende propre */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-zinc-300">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                <span>CA (€)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Abonnements</span>
              </div>
            </div>

            {/* Sélecteur de période */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
              {(['hebdomadaire', 'mensuel', 'annuel'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodeGraphique(p)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all capitalize ${
                    periodeGraphique === p
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-4">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={donneesGraphique} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#cbd5e1' }} 
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#2563eb" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#10b981" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '12px', 
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#fff', padding: '2px 0' }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="ca" 
                  name="Chiffre d'Affaires (€)" 
                  stroke="#2563eb" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 7, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="abonnements" 
                  name="Abonnements actifs" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 7, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Contenu Principal - 2 Colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xs p-2">
            <CardHeader className="px-6 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IoAnalyticsOutline className="h-5 w-5 text-amber-600" />
                    Répartition des abonnements actifs
                  </CardTitle>
                  <CardDescription className="text-xs">Distribution par formule d'abonnement</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-amber-600 hover:bg-blue-50 dark:hover:bg-zinc-800 rounded-xl"
                  onClick={() => navigate('/superadmin/abonnements')}
                >
                  <span>Détails</span>
                  <IoChevronForward className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Portefeuille global ({distributionPlans.totalActifs} abonnements)</span>
                  <span>100%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                  <div className="bg-blue-600 h-full" style={{ width: `${distributionPlans.starterPercent}%` }} title={`Starter: ${distributionPlans.starterPercent}%`} />
                  <div className="bg-emerald-500 h-full" style={{ width: `${distributionPlans.essentielPercent}%` }} title={`Essentiel: ${distributionPlans.essentielPercent}%`} />
                  <div className="bg-pink-500 h-full" style={{ width: `${distributionPlans.premiumPercent}%` }} title={`Premium: ${distributionPlans.premiumPercent}%`} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">Plan Starter</span>
                    <span className="text-[11px] font-mono font-bold text-amber-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">{distributionPlans.starterPercent}%</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{distributionPlans.starter}</div>
                  <p className="text-[11px] text-slate-500">
                    {tarifs.find(t => t.plan === 'starter')?.prixMensuel || 49.99}€ / mois
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">Plan Essentiel</span>
                    <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">{distributionPlans.essentielPercent}%</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{distributionPlans.essentiel}</div>
                  <p className="text-[11px] text-slate-500">
                    {tarifs.find(t => t.plan === 'essentiel')?.prixMensuel || 99.99}€ / mois
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">Plan Premium</span>
                    <span className="text-[11px] font-mono font-bold text-pink-600 bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 rounded-md">{distributionPlans.premiumPercent}%</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{distributionPlans.premium}</div>
                  <p className="text-[11px] text-slate-500">
                    {tarifs.find(t => t.plan === 'premium')?.prixMensuel || 199.99}€ / mois
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xs">
            <CardHeader className="px-6 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Grille tarifaire</CardTitle>
                  <CardDescription className="text-xs">Tarifs actifs par formule</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-amber-600 hover:bg-blue-50 rounded-xl"
                  onClick={() => navigate('/superadmin/tarifs')}
                >
                  <span>Modifier</span>
                  <IoChevronForward className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tarifs.length > 0 ? (
                  tarifs.slice(0, 3).map((tarif) => (
                    <div key={tarif.id} className="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-200">{tarif.nom}</h4>
                          <Badge variant="outline" className="text-[10px] font-semibold border-slate-200 dark:border-zinc-700">
                            {tarif.plan.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-2xl font-bold text-slate-900 dark:text-white">{tarif.prixMensuel}€</span>
                          <span className="text-xs text-slate-400">/mois</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-200/50 dark:border-zinc-700 text-[11px] text-slate-500 flex justify-between items-center">
                        <span>Capacité :</span>
                        <span className="font-semibold text-slate-700 dark:text-zinc-300">
                          {tarif.limites?.enfants === -1 ? 'Illimité' : `${tarif.limites?.enfants || 0} enfants`}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8 text-slate-500 text-xs">
                    Aucun tarif disponible
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xs">
            <CardHeader className="px-6 pt-6">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Activité récente</CardTitle>
              <CardDescription className="text-xs">Derniers événements sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-4 relative before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200 dark:before:bg-zinc-800">
                {activiteRecente.map((activite) => (
                  <div key={activite.id} className="flex gap-3 relative pl-4">
                    <div className="absolute left-[-2px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-zinc-900" />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                        {activite.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{activite.utilisateur}</span>
                        <span>•</span>
                        <span>{format(activite.timestamp, 'HH:mm', { locale: fr })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xs">
            <CardHeader className="px-6 pt-6">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-2">
              {[
                { label: 'Créer un compte', icon: IoPersonAddOutline, path: '/superadmin/comptes' },
                { label: 'Gérer les tarifs', icon: IoWalletOutline, path: '/superadmin/tarifs' },
                { label: 'Gérer les abonnements', icon: IoCardOutline, path: '/superadmin/abonnements' },
                { label: 'Statistiques avancées', icon: IoStatsChartOutline, path: '/superadmin/statistiques' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className="w-full justify-between text-xs font-semibold h-11 rounded-xl border border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-all group"
                  onClick={() => navigate(action.path)}
                >
                  <span className="flex items-center gap-3">
                    <action.icon className="h-4 w-4 text-amber-600" />
                    {action.label}
                  </span>
                  <IoChevronForward className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-slate-200/80 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-bold text-amber-600 dark:text-amber-400">Kids'Med IA</span>
            <span>•</span>
            <span>© 2026 Tous droits réservés</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400">
            <a href="#" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Aide</a>
            <a href="#" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">CGU</a>
          </div>
        </div>
      </footer>
      </motion.div>
    </AppBackground>
  );
};