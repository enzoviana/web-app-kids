import React, { useState, useMemo, useEffect } from 'react';
import {
  IoBugOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoRefreshOutline,
  IoTrashOutline,
  IoAlertCircleOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoChevronBack,
  IoCodeSlashOutline,
  IoTimeOutline,
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

interface ErrorEntry {
  id: string;
  type: 'error' | 'warning' | 'critical';
  message: string;
  stackTrace: string;
  file: string;
  line: number;
  timestamp: Date;
  count: number;
  statut: 'nouveau' | 'en_cours' | 'resolu' | 'ignore';
  affectedUsers?: number;
}

export const ErreursPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'tous' | 'error' | 'warning' | 'critical'>('tous');
  const [filterStatut, setFilterStatut] = useState<'tous' | 'nouveau' | 'en_cours' | 'resolu' | 'ignore'>('tous');

  // États pour les données backend
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les erreurs au montage du composant
  useEffect(() => {
    fetchErrors();
  }, []);

  // Fonction pour charger les erreurs depuis le backend
  const fetchErrors = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Récupérer les logs de type 'error' et 'critical'
      const [errorLogs, criticalLogs] = await Promise.all([
        logApi.getLogsByType('error', 100),
        logApi.getLogsByType('critical', 100),
      ]);

      // Combiner et transformer les données
      const allErrorLogs = [...errorLogs.data, ...criticalLogs.data];
      const transformedErrors: ErrorEntry[] = allErrorLogs.map((log: any) => ({
        id: log.id,
        type: log.type as 'error' | 'critical',
        message: log.message,
        stackTrace: log.details?.stackTrace || 'Stack trace non disponible',
        file: log.details?.file || 'Fichier inconnu',
        line: log.details?.line || 0,
        timestamp: new Date(log.createdAt),
        count: log.details?.count || 1,
        statut: 'nouveau',
        affectedUsers: log.details?.affectedUsers,
      }));

      setErrors(transformedErrors);
    } catch (err: any) {
      console.error('Erreur lors du chargement des erreurs:', err);
      setError(err.response?.data?.error || 'Impossible de charger les erreurs');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrage des erreurs
  const filteredErrors = useMemo(() => {
    return errors.filter((error) => {
      const matchesSearch =
        error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        error.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
        error.stackTrace.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'tous' || error.type === filterType;
      const matchesStatut = filterStatut === 'tous' || error.statut === filterStatut;

      return matchesSearch && matchesType && matchesStatut;
    });
  }, [errors, searchTerm, filterType, filterStatut]);

  // Statistiques
  const stats = useMemo(() => {
    const total = errors.length;
    const critiques = errors.filter(e => e.type === 'critical').length;
    const erreurs = errors.filter(e => e.type === 'error').length;
    const warnings = errors.filter(e => e.type === 'warning').length;
    const nouveaux = errors.filter(e => e.statut === 'nouveau').length;

    return { total, critiques, erreurs, warnings, nouveaux };
  }, [errors]);

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'error':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'warning':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  const getStatutBadgeStyle = (statut: string) => {
    switch (statut) {
      case 'nouveau':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'en_cours':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'resolu':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'ignore':
        return 'bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <IoAlertCircleOutline className="h-5 w-5 text-rose-500 shrink-0" />;
      case 'error':
        return <IoBugOutline className="h-5 w-5 text-orange-500 shrink-0" />;
      case 'warning':
        return <IoWarningOutline className="h-5 w-5 text-amber-500 shrink-0" />;
      default:
        return null;
    }
  };

  const handleResolve = (id: string) => {
    setErrors(errors.map(e => e.id === id ? { ...e, statut: 'resolu' as const } : e));
  };

  const handleIgnore = (id: string) => {
    setErrors(errors.map(e => e.id === id ? { ...e, statut: 'ignore' as const } : e));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-10 space-y-8 bg-slate-50/50 dark:bg-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 font-sans antialiased"
    >
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-sm">
              <IoBugOutline className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Gestion des Erreurs & Anomalies
                </h1>
                <Badge className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  {stats.nouveaux} NOUVEAUX
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Suivi et résolution des erreurs système, exceptions et anomalies applicatives
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
            onClick={fetchErrors}
            disabled={isLoading}
          >
            <IoRefreshOutline className={`h-4 w-4 mr-1.5 text-cyan-600 ${isLoading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs border-l-4 border-l-rose-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Critiques
            </CardTitle>
            <IoAlertCircleOutline className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 font-mono">
              {stats.critiques}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
              Nécessitent action immédiate
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Erreurs
            </CardTitle>
            <IoBugOutline className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              {stats.erreurs}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
              Erreurs applicatives
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Avertissements
            </CardTitle>
            <IoWarningOutline className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              {stats.warnings}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
              Warnings système
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Total
            </CardTitle>
            <IoCodeSlashOutline className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              {stats.total}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
              Toutes anomalies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher dans les erreurs, fichiers ou stack traces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-xs bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 rounded-xl font-mono"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <IoFilterOutline className="h-4 w-4 text-slate-400 shrink-0" />

              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-full md:w-[140px] h-10 text-xs bg-slate-50/50 dark:bg-zinc-800/50 rounded-xl border-slate-200 dark:border-zinc-700">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous types</SelectItem>
                  <SelectItem value="critical">Critiques</SelectItem>
                  <SelectItem value="error">Erreurs</SelectItem>
                  <SelectItem value="warning">Warnings</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatut} onValueChange={(value: any) => setFilterStatut(value)}>
                <SelectTrigger className="w-full md:w-[140px] h-10 text-xs bg-slate-50/50 dark:bg-zinc-800/50 rounded-xl border-slate-200 dark:border-zinc-700">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous statuts</SelectItem>
                  <SelectItem value="nouveau">Nouveaux</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="resolu">Résolus</SelectItem>
                  <SelectItem value="ignore">Ignorés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des erreurs */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800 px-6 pt-6">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Rapport d'erreurs détaillé
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {filteredErrors.length} erreur{filteredErrors.length > 1 ? 's' : ''} correspondante{filteredErrors.length > 1 ? 's' : ''}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-16 text-slate-400 dark:text-zinc-500 text-xs">
              <IoRefreshOutline className="h-12 w-12 mx-auto mb-3 text-cyan-500 animate-spin" />
              <p>Chargement des erreurs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-rose-500 text-xs">
              <IoAlertCircleOutline className="h-12 w-12 mx-auto mb-3" />
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={fetchErrors}
              >
                Réessayer
              </Button>
            </div>
          ) : filteredErrors.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-zinc-500 text-xs">
              <IoCheckmarkCircleOutline className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
              <p>Aucune erreur ne correspond aux critères de recherche.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filteredErrors.map((error) => (
                <div
                  key={error.id}
                  className="p-4 px-6 hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 mt-1">
                      {getTypeIcon(error.type)}
                    </div>

                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-semibold border ${getTypeBadgeStyle(error.type)}`}>
                              {error.type.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-medium border ${getStatutBadgeStyle(error.statut)}`}>
                              {error.statut}
                            </Badge>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                              {error.count} occurrence{error.count > 1 ? 's' : ''}
                            </span>
                            {error.affectedUsers && (
                              <>
                                <span className="text-[11px] text-slate-400">•</span>
                                <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                                  {error.affectedUsers} utilisateur{error.affectedUsers > 1 ? 's' : ''} impacté{error.affectedUsers > 1 ? 's' : ''}
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 font-mono mb-2 break-all">
                            {error.message}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400 flex-wrap">
                            <span className="flex items-center gap-1 font-mono bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400 px-2 py-0.5 rounded">
                              <IoCodeSlashOutline className="h-3 w-3" />
                              {error.file}:{error.line}
                            </span>
                            <span className="flex items-center gap-1">
                              <IoTimeOutline className="h-3 w-3" />
                              {format(error.timestamp, 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                            </span>
                          </div>
                          <details className="mt-3">
                            <summary className="text-xs font-medium text-cyan-600 dark:text-cyan-400 cursor-pointer hover:underline">
                              Voir stack trace
                            </summary>
                            <pre className="mt-2 p-3 bg-slate-900 dark:bg-zinc-950 text-slate-100 text-[10px] rounded-lg overflow-x-auto font-mono leading-relaxed border border-slate-700">
                              {error.stackTrace}
                            </pre>
                          </details>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {error.statut !== 'resolu' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs font-semibold rounded-xl border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                              onClick={() => handleResolve(error.id)}
                            >
                              <IoCheckmarkCircleOutline className="h-3.5 w-3.5 mr-1" />
                              Résoudre
                            </Button>
                          )}
                          {error.statut !== 'ignore' && error.statut !== 'resolu' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                              onClick={() => handleIgnore(error.id)}
                            >
                              <IoTrashOutline className="h-3.5 w-3.5 mr-1" />
                              Ignorer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
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
