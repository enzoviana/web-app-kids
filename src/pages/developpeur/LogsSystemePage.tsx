import React, { useState, useMemo, useEffect } from 'react';
import {
  IoTerminalOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoRefreshOutline,
  IoTrashOutline,
  IoDownloadOutline,
  IoAlertCircleOutline,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoBugOutline,
  IoChevronBack,
} from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { logApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface LogEntry {
  id: string;
  niveau: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  service: string;
  message: string;
  timestamp: Date;
  ip?: string;
  userId?: string;
}

interface LogStats {
  total: number;
  parNiveau: {
    INFO: number;
    WARNING: number;
    ERROR: number;
    DEBUG: number;
  };
  parType: Record<string, number>;
}

export const LogsSystemePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterNiveau, setFilterNiveau] = useState<'tous' | 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG'>('tous');
  const [filterService, setFilterService] = useState<'tous' | 'API' | 'AUTH' | 'DATABASE' | 'PAYMENT' | 'CRON'>('tous');

  // États pour les données backend
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Charger les stats au montage du composant
  useEffect(() => {
    fetchStats();
  }, []);

  // Fonction pour charger les statistiques
  const fetchStats = async () => {
    try {
      const response = await logApi.getLogStats();
      setStats(response.data);
    } catch (err: any) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  // Recharger les logs quand les filtres changent
  useEffect(() => {
    const loadLogs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Construire les filtres
        const filters: {
          niveau?: string;
          type?: string;
          limit?: number;
        } = {
          limit: 100,
        };

        if (filterNiveau !== 'tous') {
          filters.niveau = filterNiveau;
        }

        if (filterService !== 'tous') {
          filters.type = filterService;
        }

        const response = await logApi.getLogs(filters);

        const logsData = response.data.map((log: any) => ({
          id: log.id,
          niveau: log.niveau,
          service: log.type || 'API',
          message: log.message,
          timestamp: new Date(log.createdAt),
          ip: log.metadata?.ip,
          userId: log.userId,
        }));

        setLogs(logsData);
      } catch (err: any) {
        console.error('Erreur lors du chargement des logs:', err);
        setError(err.response?.data?.error || 'Erreur lors du chargement des logs');
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterNiveau, filterService]);

  // Filtrage des logs (côté client pour la recherche)
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.ip && log.ip.includes(searchTerm));

      return matchesSearch;
    });
  }, [logs, searchTerm]);

  const getNiveauBadgeStyle = (niveau: string) => {
    switch (niveau) {
      case 'ERROR':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'WARNING':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'INFO':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'DEBUG':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  const getNiveauIcon = (niveau: string) => {
    switch (niveau) {
      case 'ERROR':
        return <IoAlertCircleOutline className="h-4 w-4 text-rose-500 shrink-0" />;
      case 'WARNING':
        return <IoWarningOutline className="h-4 w-4 text-amber-500 shrink-0" />;
      case 'INFO':
        return <IoInformationCircleOutline className="h-4 w-4 text-blue-500 shrink-0" />;
      case 'DEBUG':
        return <IoBugOutline className="h-4 w-4 text-purple-500 shrink-0" />;
      default:
        return null;
    }
  };

  // Fonction pour charger les logs manuellement
  const loadLogsManually = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filters: {
        niveau?: string;
        type?: string;
        limit?: number;
      } = {
        limit: 100,
      };

      if (filterNiveau !== 'tous') {
        filters.niveau = filterNiveau;
      }

      if (filterService !== 'tous') {
        filters.type = filterService;
      }

      const response = await logApi.getLogs(filters);

      const logsData = response.data.map((log: any) => ({
        id: log.id,
        niveau: log.niveau,
        service: log.type || 'API',
        message: log.message,
        timestamp: new Date(log.createdAt),
        ip: log.metadata?.ip,
        userId: log.userId,
      }));

      setLogs(logsData);
    } catch (err: any) {
      console.error('Erreur lors du chargement des logs:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des logs');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler pour nettoyer les anciens logs
  const handleClearLogs = async () => {
    const joursAConserver = parseInt(
      prompt('Combien de jours de logs souhaitez-vous conserver ?', '30') || '30'
    );

    if (!joursAConserver || joursAConserver < 1) {
      return;
    }

    if (
      window.confirm(
        `Voulez-vous vraiment supprimer tous les logs de plus de ${joursAConserver} jours ?`
      )
    ) {
      try {
        setIsLoading(true);
        await logApi.cleanOldLogs(joursAConserver);

        // Recharger les logs après nettoyage
        await loadLogsManually();
        await fetchStats();

        alert('Logs nettoyés avec succès');
      } catch (err: any) {
        console.error('Erreur lors du nettoyage des logs:', err);
        alert(err.response?.data?.error || 'Erreur lors du nettoyage des logs');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handler pour rafraîchir les logs
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadLogsManually();
      await fetchStats();
    } catch (err: any) {
      console.error('Erreur lors du rafraîchissement:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

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
              <IoTerminalOutline className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Logs Système & Audit
                </h1>
                <Badge className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                  REALTIME STREAM
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Journalisation en temps réel des événements, erreurs et flux d'exécution backend
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
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <IoRefreshOutline className={`h-4 w-4 mr-1.5 text-cyan-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Chargement...' : 'Rafraîchir'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-4 text-xs font-semibold rounded-xl border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-all cursor-pointer"
            onClick={handleClearLogs}
            disabled={isLoading}
          >
            <IoTrashOutline className="h-4 w-4 mr-1.5" />
            Nettoyer
          </Button>
        </div>
      </div>

      {/* Statistiques des logs */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Total</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {stats.total}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800">
                  <IoTerminalOutline className="h-5 w-5 text-slate-600 dark:text-zinc-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-blue-200/80 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">INFO</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                    {stats.parNiveau.INFO || 0}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                  <IoInformationCircleOutline className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-amber-200/80 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-600 dark:text-amber-400">WARNING</p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
                    {stats.parNiveau.WARNING || 0}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                  <IoWarningOutline className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-rose-200/80 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-rose-600 dark:text-rose-400">ERROR</p>
                  <p className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-1">
                    {stats.parNiveau.ERROR || 0}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/40">
                  <IoAlertCircleOutline className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-purple-200/80 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20 shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 dark:text-purple-400">DEBUG</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
                    {stats.parNiveau.DEBUG || 0}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40">
                  <IoBugOutline className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <Card className="rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-rose-700 dark:text-rose-400">
              <IoAlertCircleOutline className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Erreur de chargement</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => {
                  setError(null);
                  loadLogsManually();
                }}
              >
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Barre de recherche et filtres unifiés */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher dans les messages de logs, services ou adresses IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-xs bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 rounded-xl font-mono"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <IoFilterOutline className="h-4 w-4 text-slate-400 shrink-0" />
              
              <Select value={filterNiveau} onValueChange={(value: any) => setFilterNiveau(value)}>
                <SelectTrigger className="w-full md:w-[140px] h-10 text-xs bg-slate-50/50 dark:bg-zinc-800/50 rounded-xl border-slate-200 dark:border-zinc-700">
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous niveaux</SelectItem>
                  <SelectItem value="INFO">INFO</SelectItem>
                  <SelectItem value="WARNING">WARNING</SelectItem>
                  <SelectItem value="ERROR">ERROR</SelectItem>
                  <SelectItem value="DEBUG">DEBUG</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterService} onValueChange={(value: any) => setFilterService(value)}>
                <SelectTrigger className="w-full md:w-[150px] h-10 text-xs bg-slate-50/50 dark:bg-zinc-800/50 rounded-xl border-slate-200 dark:border-zinc-700">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous services</SelectItem>
                  <SelectItem value="API">API</SelectItem>
                  <SelectItem value="AUTH">AUTH</SelectItem>
                  <SelectItem value="DATABASE">DATABASE</SelectItem>
                  <SelectItem value="PAYMENT">PAYMENT</SelectItem>
                  <SelectItem value="CRON">CRON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Console de Flux des Logs */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800 px-6 pt-6">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Flux d'événements en direct
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {filteredLogs.length} entrée{filteredLogs.length > 1 ? 's' : ''} correspondante{filteredLogs.length > 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs font-semibold rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 cursor-pointer"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `system_logs_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
          >
            <IoDownloadOutline className="h-4 w-4 mr-1.5 text-cyan-600" />
            Exporter les logs
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-16 text-slate-400 dark:text-zinc-500 text-xs">
              <div className="flex flex-col items-center gap-3">
                <IoRefreshOutline className="h-8 w-8 animate-spin text-cyan-600" />
                <p>Chargement des logs système...</p>
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-zinc-500 text-xs">
              Aucun log système ne correspond aux critères de recherche actuels.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-mono text-xs">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 px-6 hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start md:items-center gap-3.5 min-w-0 flex-1">
                    {getNiveauIcon(log.niveau)}
                    
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-semibold border ${getNiveauBadgeStyle(log.niveau)}`}>
                          {log.niveau}
                        </Badge>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                          {log.service}
                        </span>
                        {log.ip && (
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                            IP: {log.ip}
                          </span>
                        )}
                        {log.userId && (
                          <span className="text-[10px] text-cyan-600 dark:text-cyan-400">
                            UID: {log.userId}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-800 dark:text-zinc-200 text-xs break-all leading-relaxed">
                        {log.message}
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 dark:text-zinc-500 shrink-0 self-start md:self-center font-mono">
                    {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
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