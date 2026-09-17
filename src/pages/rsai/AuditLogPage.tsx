import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoShieldCheckmark,
  IoSearchOutline,
  IoDownloadOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoReloadOutline,
  IoArrowForwardOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { logApi } from '@/services/api';
import { motion } from 'framer-motion';
import { AppBackground } from '@/components/AppBackground';

interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  role: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'warning';
  details: string;
}

interface LogStats {
  totalToday: number;
  successRate: number;
  failedCount: number;
  activeUsers: number;
}

export const AuditLogPage: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<LogStats>({
    totalToday: 0,
    successRate: 0,
    failedCount: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, [filterStatus]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const logsResponse = await logApi.getLogs({
        type: filterStatus !== 'all' ? filterStatus : undefined,
        limit: 100,
      });

      const statsResponse = await logApi.getLogStats();

      const transformedLogs: AuditLog[] = logsResponse.data.map((log: any) => ({
        id: log._id,
        timestamp: new Date(log.createdAt),
        user: log.userName || 'Utilisateur inconnu',
        role: log.details?.role || 'N/A',
        action: log.action,
        resource: log.module,
        resourceId: log.details?.enfantId || log.details?.resourceId,
        ipAddress: log.ipAddress || 'N/A',
        status: log.type === 'error' ? 'failed' : log.type === 'warning' ? 'warning' : 'success',
        details: log.message,
      }));

      setLogs(transformedLogs);
      setStats({
        totalToday: statsResponse.data.totalToday || 0,
        successRate: statsResponse.data.successRate || 0,
        failedCount: statsResponse.data.failedCount || 0,
        activeUsers: statsResponse.data.activeUsers || 0,
      });
    } catch (err: any) {
      console.error('Erreur lors du chargement des logs:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const renderStatusBadge = (status: AuditLog['status']) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px] px-2 py-0.5 font-bold">
            <IoCheckmarkCircleOutline className="mr-1 h-3 w-3" /> Réussi
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800 text-[10px] px-2 py-0.5 font-bold">
            <IoCloseCircleOutline className="mr-1 h-3 w-3" /> Échoué
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-[10px] px-2 py-0.5 font-bold">
            <IoAlertCircleOutline className="mr-1 h-3 w-3" /> Attention
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleLogClick = (log: AuditLog) => {
    if (log.resource === 'enfant' && log.resourceId) {
      navigate(`/rsai/enfants/${log.resourceId}`);
    }
  };

  const isLogClickable = (log: AuditLog) => {
    return log.resource === 'enfant' && log.resourceId;
  };

  return (
    <AppBackground>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 text-slate-900 dark:text-zinc-100"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Journal d'Audit & Traçabilité HDS</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-fuchsia-50 dark:bg-fuchsia-950/50 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-800 shadow-xs">
                <IoShieldCheckmark className="h-3.5 w-3.5" />
                HDS Certifié
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">
              Suivi complet des actions sur les données de santé (conforme certification HDS)
            </p>
          </div>
          <Button
            variant="outline"
            className="h-10 text-xs font-bold rounded-2xl cursor-pointer border-slate-200 dark:border-zinc-700 hover:bg-fuchsia-50 hover:text-fuchsia-600 transition-all shadow-xs"
            onClick={() =>
              alert(
                'Export des logs d\'audit\n\nFormats disponibles:\n- CSV (Excel)\n- JSON (analyse technique)\n- PDF (rapport d\'audit)\n\nLes exports incluent:\n- Horodatage précis\n- Utilisateur et rôle\n- Actions effectuées\n- Adresses IP\n- Statut des opérations\n\nConformité: HDS / RGPD'
              )
            }
          >
            <IoDownloadOutline className="h-4 w-4 mr-2" />
            Exporter les logs
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <Card className="rounded-xl border-rose-200 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/20 backdrop-blur-md border-l-4 border-l-rose-500">
            <CardContent className="p-4">
              <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="relative rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-md border-l-4 border-l-fuchsia-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Actions Aujourd'hui</p>
                  <p className="text-3xl font-black mt-2 font-mono">{loading ? '...' : stats.totalToday}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-950/40 flex items-center justify-center border border-fuchsia-200 dark:border-fuchsia-800">
                  <IoShieldCheckmark className="h-6 w-6 text-fuchsia-600 dark:text-fuchsia-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-md border-l-4 border-l-emerald-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Taux de Succès</p>
                  <p className="text-3xl font-black mt-2 text-emerald-600 dark:text-emerald-400 font-mono">
                    {loading ? '...' : Math.round(stats.successRate)}%
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  <IoCheckmarkCircleOutline className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-md border-l-4 border-l-rose-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Tentatives Échouées</p>
                  <p className="text-3xl font-black mt-2 text-rose-600 dark:text-rose-400 font-mono">
                    {loading ? '...' : stats.failedCount}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center border border-rose-200 dark:border-rose-800">
                  <IoCloseCircleOutline className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-md border-l-4 border-l-slate-400">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Utilisateurs Actifs</p>
                  <p className="text-3xl font-black mt-2 font-mono">{loading ? '...' : stats.activeUsers}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center border border-slate-200 dark:border-zinc-700">
                  <IoPersonOutline className="h-6 w-6 text-slate-500 dark:text-zinc-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Section */}
        <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-md">
          <CardHeader className="p-6 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-black">Historique des Actions</CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Tous les événements tracés • Cliquez sur un log pour voir le dossier associé
                </CardDescription>
              </div>
              <div className="flex gap-1.5 bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl border border-slate-200/80 dark:border-zinc-700">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === 'all'
                      ? 'bg-fuchsia-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setFilterStatus('success')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === 'success'
                      ? 'bg-fuchsia-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Réussis
                </button>
                <button
                  onClick={() => setFilterStatus('failed')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === 'failed'
                      ? 'bg-fuchsia-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Échoués
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Rechercher par utilisateur, action ou détails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-xs bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-2xl focus:border-fuchsia-500 focus:ring-fuchsia-500"
              />
            </div>

            {/* Logs List */}
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-12">
                  <IoReloadOutline className="h-12 w-12 text-fuchsia-600 mx-auto mb-3 animate-spin" />
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                    Chargement des logs d'audit...
                  </p>
                </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <IoTimeOutline className="h-16 w-16 text-slate-300 dark:text-zinc-600 mx-auto mb-4" />
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Aucun événement ne correspond à vos critères de recherche.
                </p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl border transition-all ${
                    isLogClickable(log)
                      ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]'
                      : ''
                  } ${
                    log.status === 'success'
                      ? 'bg-slate-50 dark:bg-zinc-900/50 border-slate-200/80 dark:border-zinc-800'
                      : log.status === 'failed'
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                      : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                  }`}
                  onClick={() => handleLogClick(log)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="shrink-0">
                        {log.status === 'success' ? (
                          <IoCheckmarkCircleOutline className="h-5 w-5 text-emerald-600" />
                        ) : log.status === 'failed' ? (
                          <IoCloseCircleOutline className="h-5 w-5 text-rose-600" />
                        ) : (
                          <IoAlertCircleOutline className="h-5 w-5 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono uppercase text-[10px]">
                            {log.action}
                          </span>
                          {renderStatusBadge(log.status)}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 truncate">{log.details}</p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 dark:text-zinc-500">
                          <span className="font-semibold">{log.user}</span>
                          <span>•</span>
                          <span className="font-mono">{log.ipAddress}</span>
                          <span>•</span>
                          <span className="capitalize">{log.resource}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <IoTimeOutline className="h-3.5 w-3.5" />
                        <span>{format(log.timestamp, 'dd/MM HH:mm', { locale: fr })}</span>
                      </div>
                      {isLogClickable(log) && (
                        <IoArrowForwardOutline className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Professional Footer */}
        <footer className="mt-8 pt-6 border-t border-slate-200 dark:border-zinc-800 text-center">
          <p className="text-xs text-slate-500 dark:text-zinc-500 font-medium">
            Kids'Med IA © 2026 - Journal d'Audit HDS / RGPD
          </p>
        </footer>
      </motion.div>
    </AppBackground>
  );
};
