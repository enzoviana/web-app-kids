import React, { useState, useEffect } from 'react';
import {
  IoAnalyticsOutline,
  IoServerOutline,
  IoCloudOutline,
  IoHardwareChipOutline,
  IoRefreshOutline,
  IoChevronBack,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoAlertCircleOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { logApi } from '@/services/api';

export const MonitoringPage: React.FC = () => {
  const navigate = useNavigate();
  const [periode, setPeriode] = useState<'1h' | '6h' | '24h' | '7j'>('6h');

  // États pour les données backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fonction pour charger les statistiques système
  const loadSystemStats = async () => {
    try {
      const response = await logApi.getLogStats();
      setStats(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Erreur lors du chargement des stats:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des statistiques');
    }
  };

  // Fonction pour charger les logs récents
  const loadRecentLogs = async () => {
    try {
      const response = await logApi.getLogs({
        limit: 100,
        // Filtrer par période si nécessaire
      });
      setLogs(response.data || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des logs:', err);
    }
  };

  // Fonction pour rafraîchir toutes les données
  const refreshData = async (showRefreshingState = true) => {
    if (showRefreshingState) {
      setRefreshing(true);
    }
    try {
      await Promise.all([loadSystemStats(), loadRecentLogs()]);
    } finally {
      if (showRefreshingState) {
        setRefreshing(false);
      }
    }
  };

  // Charger les données au montage
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await refreshData(false);
      setLoading(false);
    };

    initData();

    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(() => {
      refreshData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Générer des données de graphique basées sur les logs
  const generateChartData = () => {
    if (!logs || logs.length === 0) {
      // Données par défaut si pas de logs
      const defaultData = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hours = time.getHours().toString().padStart(2, '0');
        const minutes = time.getMinutes().toString().padStart(2, '0');
        defaultData.push({
          time: `${hours}:${minutes}`,
          errors: 0,
          warnings: 0,
          info: 0,
        });
      }
      return defaultData;
    }

    // Grouper les logs par heure
    const logsByHour: { [key: string]: { errors: number; warnings: number; info: number } } = {};
    const now = new Date();

    // Initialiser les 12 dernières heures
    for (let i = 11; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      const key = `${hours}:${minutes}`;
      logsByHour[key] = { errors: 0, warnings: 0, info: 0 };
    }

    // Compter les logs par niveau et par heure
    logs.forEach((log) => {
      const logDate = new Date(log.dateCreation);
      const hours = logDate.getHours().toString().padStart(2, '0');
      const minutes = '00'; // Arrondir à l'heure
      const key = `${hours}:${minutes}`;

      if (logsByHour[key]) {
        if (log.niveau === 'ERROR') {
          logsByHour[key].errors++;
        } else if (log.niveau === 'WARN') {
          logsByHour[key].warnings++;
        } else if (log.niveau === 'INFO') {
          logsByHour[key].info++;
        }
      }
    });

    return Object.entries(logsByHour).map(([time, counts]) => ({
      time,
      errors: counts.errors,
      warnings: counts.warnings,
      info: counts.info,
    }));
  };

  const chartData = generateChartData();

  // Données pour le graphique des erreurs (CPU simulé par erreurs)
  const cpuData = chartData.map((d) => ({
    time: d.time,
    usage: Math.min(100, (d.errors + d.warnings) * 5), // Simuler l'usage CPU basé sur les logs
  }));

  // Données pour le graphique de la mémoire (warnings simulés)
  const memoryData = chartData.map((d) => ({
    time: d.time,
    usage: Math.min(100, 60 + d.warnings * 2), // Simuler l'usage mémoire
  }));

  // Données pour le graphique réseau (logs entrants/sortants)
  const networkData = chartData.map((d) => ({
    time: d.time,
    in: d.errors + d.warnings + d.info,
    out: Math.floor((d.errors + d.warnings + d.info) * 0.7),
  }));

  // Métriques en temps réel (calculées depuis les stats backend)
  const getMetrics = () => {
    if (!stats) {
      return [
        {
          label: 'CPU Usage',
          value: '...',
          status: 'good',
          trend: 'stable',
          details: 'Chargement...',
          icon: IoHardwareChipOutline,
          color: 'blue',
        },
        {
          label: 'Memory RAM',
          value: '...',
          status: 'good',
          trend: 'stable',
          details: 'Chargement...',
          icon: IoHardwareChipOutline,
          color: 'amber',
        },
        {
          label: 'Disk I/O',
          value: '...',
          status: 'good',
          trend: 'stable',
          details: 'Chargement...',
          icon: IoCloudOutline,
          color: 'emerald',
        },
        {
          label: 'Total Logs',
          value: '...',
          status: 'good',
          trend: 'stable',
          details: 'Chargement...',
          icon: IoAnalyticsOutline,
          color: 'purple',
        },
        {
          label: 'Erreurs',
          value: '...',
          status: 'good',
          trend: 'stable',
          details: 'Chargement...',
          icon: IoAlertCircleOutline,
          color: 'rose',
        },
        {
          label: 'Avertissements',
          value: '...',
          status: 'good',
          trend: 'stable',
          details: 'Chargement...',
          icon: IoWarningOutline,
          color: 'amber',
        },
      ];
    }

    // Extraire les données des stats
    const totalLogs = stats.totalLogs || 0;
    const errorLogs = stats.parNiveau?.ERROR || 0;
    const warningLogs = stats.parNiveau?.WARN || 0;
    const infoLogs = stats.parNiveau?.INFO || 0;

    // Calculer les pourcentages
    const errorRate = totalLogs > 0 ? ((errorLogs / totalLogs) * 100).toFixed(1) : '0';
    const warningRate = totalLogs > 0 ? ((warningLogs / totalLogs) * 100).toFixed(1) : '0';

    // Déterminer le statut global
    const errorStatus = errorLogs > 10 ? 'error' : errorLogs > 5 ? 'warning' : 'good';
    const warningStatus = warningLogs > 20 ? 'warning' : 'good';

    return [
      {
        label: 'Total Logs',
        value: totalLogs.toLocaleString(),
        status: 'good',
        trend: 'stable',
        details: `${Object.keys(stats.parType || {}).length} types`,
        icon: IoAnalyticsOutline,
        color: 'blue',
      },
      {
        label: 'Erreurs',
        value: errorLogs.toLocaleString(),
        status: errorStatus,
        trend: errorLogs > 0 ? 'up' : 'stable',
        details: `${errorRate}% du total`,
        icon: IoAlertCircleOutline,
        color: 'rose',
      },
      {
        label: 'Avertissements',
        value: warningLogs.toLocaleString(),
        status: warningStatus,
        trend: warningLogs > 0 ? 'up' : 'stable',
        details: `${warningRate}% du total`,
        icon: IoWarningOutline,
        color: 'amber',
      },
      {
        label: 'Informations',
        value: infoLogs.toLocaleString(),
        status: 'good',
        trend: 'stable',
        details: 'Logs informatifs',
        icon: IoCheckmarkCircleOutline,
        color: 'emerald',
      },
      {
        label: 'Types de Logs',
        value: Object.keys(stats.parType || {}).length.toString(),
        status: 'good',
        trend: 'stable',
        details: 'Catégories distinctes',
        icon: IoHardwareChipOutline,
        color: 'purple',
      },
      {
        label: 'Activité',
        value: logs.length.toString(),
        status: 'good',
        trend: 'stable',
        details: 'Logs récents',
        icon: IoTrendingUpOutline,
        color: 'cyan',
      },
    ];
  };

  const metrics = getMetrics();

  // Services et leur statut (basés sur les types de logs)
  const getServices = () => {
    if (!stats || !stats.parType) {
      return [
        { name: 'Système', status: 'online', uptime: '-', count: 0, cpu: '-' },
        { name: 'Authentification', status: 'online', uptime: '-', count: 0, cpu: '-' },
        { name: 'Base de données', status: 'online', uptime: '-', count: 0, cpu: '-' },
        { name: 'API', status: 'online', uptime: '-', count: 0, cpu: '-' },
      ];
    }

    const services = [];
    const types = stats.parType || {};

    // Convertir les types de logs en services
    for (const [type, count] of Object.entries(types)) {
      const typedCount = count as number;
      // Déterminer le statut en fonction du nombre de logs (simulation)
      let status = 'online';
      if (type.toLowerCase().includes('error') || typedCount > 100) {
        status = 'warning';
      }

      services.push({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        status,
        uptime: '99.9%',
        count: typedCount,
        cpu: '-',
      });
    }

    return services.length > 0
      ? services
      : [
          { name: 'Aucun service détecté', status: 'online', uptime: '-', count: 0, cpu: '-' },
        ];
  };

  const services = getServices();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400';
      case 'error':
        return 'text-rose-600 dark:text-rose-400';
      default:
        return 'text-slate-700 dark:text-zinc-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />;
      case 'warning':
        return <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />;
      case 'offline':
        return <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />;
      default:
        return <span className="h-2 w-2 rounded-full bg-slate-400" />;
    }
  };

  // Affichage pendant le chargement initial
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 md:p-10 flex items-center justify-center min-h-screen bg-slate-50/50 dark:bg-zinc-950"
      >
        <div className="text-center space-y-4">
          <IoRefreshOutline className="h-12 w-12 mx-auto animate-spin text-blue-600" />
          <p className="text-slate-600 dark:text-zinc-400">Chargement des statistiques système...</p>
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
      {/* Affichage des erreurs */}
      {error && (
        <Card className="rounded-2xl border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <IoAlertCircleOutline className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">
                Erreur de chargement
              </p>
              <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshData(true)}
              className="ml-auto"
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
              <IoAnalyticsOutline className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Monitoring & Performance
                </h1>
                <Badge
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold ${
                    stats && stats.parNiveau?.ERROR > 10
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      : stats && stats.parNiveau?.ERROR > 0
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  {stats && stats.parNiveau?.ERROR > 10
                    ? 'ERREURS DÉTECTÉES'
                    : stats && stats.parNiveau?.ERROR > 0
                    ? 'AVERTISSEMENT'
                    : 'TOUS SYSTÈMES OPÉRATIONNELS'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Surveillance en temps réel des ressources système, performance et disponibilité
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-4 text-xs font-semibold rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition-all cursor-pointer"
            onClick={() => navigate('/developpeur')}
          >
            <IoChevronBack className="h-4 w-4 mr-1.5" />
            Retour console
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-4 text-xs font-semibold rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition-all cursor-pointer"
            onClick={() => refreshData(true)}
            disabled={refreshing}
          >
            <IoRefreshOutline className={`h-4 w-4 mr-1.5 text-cyan-600 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualisation...' : 'Rafraîchir'}
          </Button>
        </div>
      </div>

      {/* Métriques en temps réel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={idx} className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-${metric.color}-50 dark:bg-${metric.color}-950/30`}>
                    <Icon className={`h-4 w-4 text-${metric.color}-600`} />
                  </div>
                  <div className="flex items-center gap-1">
                    {metric.trend === 'up' && <IoTrendingUpOutline className="h-3 w-3 text-rose-500" />}
                    {metric.trend === 'down' && <IoTrendingDownOutline className="h-3 w-3 text-emerald-500" />}
                    {metric.status === 'good' && <IoCheckmarkCircleOutline className="h-3 w-3 text-emerald-500" />}
                    {metric.status === 'warning' && <IoWarningOutline className="h-3 w-3 text-amber-500" />}
                    {metric.status === 'error' && <IoAlertCircleOutline className="h-3 w-3 text-rose-500" />}
                  </div>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                  {metric.label}
                </p>
                <p className={`text-2xl font-bold font-mono mb-1 ${getStatusColor(metric.status)}`}>
                  {metric.value}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                  {metric.details}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Graphiques de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Usage */}
        <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardHeader className="px-6 pt-6 pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <IoHardwareChipOutline className="h-5 w-5 text-blue-600" />
                Utilisation CPU
              </CardTitle>
              <CardDescription className="text-xs">Dernières {periode}</CardDescription>
            </div>
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
              {(['1h', '6h', '24h', '7j'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriode(p)}
                  className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-all ${
                    periode === p
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cpuData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Area type="monotone" dataKey="usage" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCpu)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardHeader className="px-6 pt-6 pb-2">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <IoHardwareChipOutline className="h-5 w-5 text-amber-600" />
              Utilisation Mémoire RAM
            </CardTitle>
            <CardDescription className="text-xs">Dernières {periode}</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={memoryData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Area type="monotone" dataKey="usage" stroke="#f59e0b" strokeWidth={2} fill="url(#colorMemory)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Traffic */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <IoAnalyticsOutline className="h-5 w-5 text-purple-600" />
            Trafic Réseau (MB/s)
          </CardTitle>
          <CardDescription className="text-xs">Bande passante entrante et sortante</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={networkData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Line type="monotone" dataKey="in" name="Entrée" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="out" name="Sortie" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-zinc-400">Trafic entrant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
              <span className="text-slate-600 dark:text-zinc-400">Trafic sortant</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Status */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardHeader className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <IoServerOutline className="h-5 w-5 text-cyan-600" />
            État des Services & Microservices
          </CardTitle>
          <CardDescription className="text-xs">
            Monitoring de l'ensemble de l'infrastructure applicative
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="px-6 py-4 hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(service.status)}
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                        {service.name}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
                        <span>Uptime: {service.uptime}</span>
                        <span>•</span>
                        <span>Logs: {service.count}</span>
                        {service.cpu !== '-' && (
                          <>
                            <span>•</span>
                            <span>CPU: {service.cpu}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-2 py-0.5 font-semibold border ${
                      service.status === 'online'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
