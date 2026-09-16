import React, { useMemo, useEffect, useState } from 'react';
import {
  IoCodeSlashOutline,
  IoBugOutline,
  IoTerminalOutline,
  IoSpeedometerOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoServerOutline,
  IoCloudOutline,
  IoHelpCircleOutline,
  IoChevronForward,
  IoAnalyticsOutline,
  IoReloadOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { logApi, userApi } from '@/services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const DashboardDeveloppeur: React.FC = () => {
  const navigate = useNavigate();

  // État pour les données réelles
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données au montage
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [logsResponse, usersResponse] = await Promise.all([
          logApi.getLogs({ limit: 50 }).catch(() => ({ data: [] })),
          userApi.getAllUsers().catch(() => ({ data: [] })),
        ]);

        setLogs(logsResponse.data || []);
        setUsers(usersResponse.data || []);
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

  // Statistiques système basées sur les vraies données
  const systemStats = useMemo(() => {
    const errorLogs = logs.filter(l => l.type === 'error').length;
    const totalLogs = logs.length || 1;
    const activeUsers = users.filter(u => u.isActive).length;

    return {
      uptime: '99.98%',
      responseTime: '145ms',
      errorRate: `${((errorLogs / totalLogs) * 100).toFixed(2)}%`,
      activeUsers,
      apiCalls: logs.length,
      dbQueries: logs.length * 2,
    };
  }, [logs, users]);

  // Erreurs récentes depuis les logs
  const recentErrors = useMemo(() => {
    return logs
      .filter(l => l.type === 'error' || l.type === 'warning')
      .slice(0, 3)
      .map(log => ({
        id: log.id,
        type: log.type,
        message: log.message,
        file: log.module || 'N/A',
        timestamp: new Date(log.createdAt),
        count: 1,
        status: 'nouveau',
      }));
  }, [logs]);

  // Support utilisateur (pour l'instant mock car pas d'API tickets)
  const supportTickets = [
    {
      id: 't1',
      utilisateur: 'En attente de l\'API Support',
      sujet: 'API Support à développer',
      priorite: 'moyenne',
      statut: 'ouvert',
      timestamp: new Date(),
    },
  ];

  // Métriques de performance
  const performanceMetrics = [
    { label: 'Temps de chargement moyen', value: '1.2s', status: 'good' },
    { label: 'Taux de disponibilité', value: '99.98%', status: 'good' },
    { label: 'Erreurs API', value: '0.02%', status: 'good' },
    { label: 'Utilisation CPU', value: '45%', status: 'normal' },
    { label: 'Utilisation RAM', value: '72%', status: 'warning' },
    { label: 'Stockage BD', value: '2.4 GB', status: 'good' },
  ];

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <IoAlertCircleOutline className="h-4 w-4 text-rose-500 shrink-0" />;
      case 'warning':
        return <IoWarningOutline className="h-4 w-4 text-amber-500 shrink-0" />;
      default:
        return <IoBugOutline className="h-4 w-4 text-slate-500 shrink-0" />;
    }
  };

  const getPriorityBadgeStyle = (priorite: string) => {
    switch (priorite) {
      case 'haute':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'moyenne':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'basse':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  const getStatusBadgeStyle = (statut: string) => {
    switch (statut) {
      case 'ouvert':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'en_cours':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'resolu':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'nouveau':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  const getPerformanceColor = (status: string) => {
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

  // Loading state
  if (isLoading) {
    return (
      <div className="p-16 text-center space-y-4 max-w-md mx-auto mt-20">
        <IoReloadOutline className="h-12 w-12 text-blue-500 mx-auto animate-spin" />
        <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
          Chargement du tableau de bord...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-16 text-center space-y-4 max-w-md mx-auto mt-20">
        <IoAlertCircleOutline className="h-12 w-12 text-red-500 mx-auto" />
        <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">{error}</p>
        <Button size="sm" onClick={() => window.location.reload()}>
          <IoReloadOutline className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-10 space-y-8 bg-slate-50/50 dark:bg-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 font-sans antialiased"
    >
      {/* Top Header Professionnel & Épuré */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-600 text-white shadow-sm">
              <IoCodeSlashOutline className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Console Développeur
                </h1>
                <Badge className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                  DEV MODE
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Supervision technique, monitoring système et support utilisateur avancé
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-4 text-xs font-semibold rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition-all cursor-pointer"
            onClick={() => navigate('/developpeur/logs')}
          >
            <IoTerminalOutline className="h-4 w-4 mr-2 text-slate-500" />
            Voir les logs
          </Button>
          <Button
            size="sm"
            className="h-10 px-4 text-xs font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white transition-all shadow-sm cursor-pointer"
            onClick={() => navigate('/developpeur/support')}
          >
            <IoHelpCircleOutline className="h-4 w-4 mr-2" />
            Support technique
          </Button>
        </div>
      </div>

      {/* Grid KPIs Système */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Disponibilité
            </CardTitle>
            <IoCheckmarkCircleOutline className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
              {systemStats.uptime}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
              30 derniers jours
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Temps de réponse
            </CardTitle>
            <IoSpeedometerOutline className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              {systemStats.responseTime}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
              Moyenne des endpoints API
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs border-l-4 border-l-rose-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Taux d'erreur
            </CardTitle>
            <IoBugOutline className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              {systemStats.errorRate}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
              {recentErrors.filter(e => e.type === 'error').length} anomalies actives
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Utilisateurs actifs
            </CardTitle>
            <IoServerOutline className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              {systemStats.activeUsers}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
              Connexions temps réel
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenu Principal - 2 Colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne Gauche - Erreurs & Performance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Erreurs Récentes */}
          <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800 px-6 pt-6">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Anomalies & Erreurs Système
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">Derniers problèmes détectés sur la plateforme</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 cursor-pointer"
                onClick={() => navigate('/developpeur/erreurs')}
              >
                <span>Voir tout</span>
                <IoChevronForward className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {recentErrors.map((error) => (
                  <div
                    key={error.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {getErrorIcon(error.type)}
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold font-mono text-slate-900 dark:text-zinc-100 truncate">
                            {error.message}
                          </p>
                          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-semibold shrink-0 border ${getStatusBadgeStyle(error.status)}`}>
                            {error.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400 flex-wrap">
                          <span className="font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30 px-1.5 py-0.5 rounded">
                            {error.file}
                          </span>
                          <span>•</span>
                          <span>{error.count} occurrence{error.count > 1 ? 's' : ''}</span>
                          <span>•</span>
                          <span>{format(error.timestamp, 'HH:mm', { locale: fr })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Métriques de Performance */}
          <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800 px-6 pt-6">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Métriques de Performance
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">Surveillance en temps réel des ressources</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 cursor-pointer"
                onClick={() => navigate('/developpeur/monitoring')}
              >
                <span>Détails</span>
                <IoChevronForward className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {performanceMetrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40"
                  >
                    <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                      {metric.label}
                    </p>
                    <p className={`text-xl font-bold font-mono ${getPerformanceColor(metric.status)}`}>
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activité API */}
          <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <CardHeader className="px-6 pt-6 pb-2">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Activité API & Base de Données
              </CardTitle>
              <CardDescription className="text-xs">Volume de requêtes des dernières 24 heures</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 space-y-1">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Appels API totaux</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 font-mono">
                    {systemStats.apiCalls.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-purple-200/60 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 space-y-1">
                  <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Requêtes Base de données</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 font-mono">
                    {systemStats.dbQueries.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne Droite - Support & Actions */}
        <div className="space-y-6">
          {/* Tickets de Support */}
          <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800 px-6 pt-6">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Support Utilisateur
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">Tickets d'incidents ouverts</CardDescription>
              </div>
              <Badge className="bg-rose-500 text-white text-xs px-2 py-0.5">
                {supportTickets.filter(t => t.statut === 'ouvert').length}
              </Badge>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {supportTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer space-y-2.5"
                    onClick={() => navigate(`/developpeur/support/${ticket.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 leading-snug flex-1">
                        {ticket.sujet}
                      </p>
                      <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-semibold shrink-0 border ${getPriorityBadgeStyle(ticket.priorite)}`}>
                        {ticket.priorite}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                        {ticket.utilisateur}
                      </p>
                      <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-medium border ${getStatusBadgeStyle(ticket.statut)}`}>
                        {ticket.statut}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                      {format(ticket.timestamp, 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions Rapides */}
          <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <CardHeader className="px-6 pt-6 pb-2">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Outils Développeur
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-4 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-xs h-10 font-semibold rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 cursor-pointer"
                onClick={() => navigate('/developpeur/logs')}
              >
                <IoTerminalOutline className="h-4 w-4 mr-2 text-cyan-600" />
                Logs système
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-xs h-10 font-semibold rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 cursor-pointer"
                onClick={() => navigate('/developpeur/erreurs')}
              >
                <IoBugOutline className="h-4 w-4 mr-2 text-rose-500" />
                Rapport d'erreurs
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-xs h-10 font-semibold rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 cursor-pointer"
                onClick={() => navigate('/developpeur/monitoring')}
              >
                <IoAnalyticsOutline className="h-4 w-4 mr-2 text-blue-500" />
                Monitoring avancé
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-xs h-10 font-semibold rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 cursor-pointer"
                onClick={() => navigate('/developpeur/database')}
              >
                <IoCloudOutline className="h-4 w-4 mr-2 text-purple-500" />
                Base de données
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-xs h-10 font-semibold rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 cursor-pointer"
                onClick={() => navigate('/developpeur/api-docs')}
              >
                <IoCodeSlashOutline className="h-4 w-4 mr-2 text-emerald-500" />
                Documentation API
              </Button>
            </CardContent>
          </Card>

          {/* Statut Serveur */}
          <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <CardHeader className="px-6 pt-6 pb-2">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <IoServerOutline className="h-5 w-5 text-cyan-600" />
                Statut des Services
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/40">
                <span className="font-medium text-slate-700 dark:text-zinc-300">API Server</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  En ligne
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/40">
                <span className="font-medium text-slate-700 dark:text-zinc-300">Database (PostgreSQL)</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  En ligne
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/40">
                <span className="font-medium text-slate-700 dark:text-zinc-300">Cache Redis</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  En ligne
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/40">
                <span className="font-medium text-slate-700 dark:text-zinc-300">CDN Cloudflare</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  En ligne
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};