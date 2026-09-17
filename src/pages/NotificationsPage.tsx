import React, { useState, useMemo, useEffect } from 'react';
import { IoNotifications, IoCheckmarkCircle, IoWarning, IoInformationCircle, IoTrash, IoReloadOutline, IoAlertCircleOutline, IoDocumentTextOutline, IoSparkles } from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { notificationApi } from '@/services/api';
import { mockData } from '@/data/mockData';
import { AppBackground } from '@/components/AppBackground';
import { motion } from 'framer-motion';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  titre: string;
  message: string;
  date: Date;
  lu: boolean;
  priorite: 'basse' | 'normale' | 'haute';
  source?: 'standard' | 'documents';
}

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();

  // Role detection for dynamic theming
  const isRSAI = user?.role === 'rsai' || user?.role === 'referent_sante';
  const isCreche = user?.role === 'creche' || user?.role === 'professionnel';
  const isMedecin = user?.role === 'medecin';
  const isAuxiliaire = user?.role === 'auxiliaire' || user?.role === 'professionnel_puericulture';
  const isParent = user?.role === 'parent';

  // Dynamic theme based on role
  const roleTheme = isRSAI
    ? { hex: '#FF007A', name: 'RSAI' }
    : isCreche
    ? { hex: '#8BC34A', name: 'Crèche' }
    : isMedecin
    ? { hex: '#0099FF', name: 'Médecin' }
    : isAuxiliaire
    ? { hex: '#14B8A6', name: 'Auxiliaire' }
    : isParent
    ? { hex: '#8B5CF6', name: 'Parent' }
    : { hex: '#64748B', name: 'Utilisateur' };

  const [filter, setFilter] = useState<string>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les notifications depuis l'API et mock data
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await notificationApi.getNotifications();

        // Mapper les notifications du backend vers le format frontend
        const standardNotifs: Notification[] = (response.data || []).map((n: any) => ({
          id: n.id,
          type: mapNotificationType(n.type),
          titre: n.titre,
          message: n.message,
          date: new Date(n.createdAt),
          lu: n.lu,
          priorite: n.priorite || 'normale',
          source: 'standard' as const,
        }));

        // Ajouter les notifications documents depuis mockData
        const docNotifs: Notification[] = mockData.notificationsDocuments
          .filter(n => n.destinataire_id === user?.id)
          .map(n => ({
            id: n._id,
            type: mapNotificationType(n.type),
            titre: n.titre,
            message: n.message,
            date: new Date(n.date),
            lu: n.lu,
            priorite: n.priorite,
            source: 'documents' as const,
          }));

        // Fusionner et trier par date
        const allNotifs = [...standardNotifs, ...docNotifs].sort((a, b) =>
          b.date.getTime() - a.date.getTime()
        );

        setNotifications(allNotifs);
      } catch (err: any) {
        console.error('Erreur chargement notifications:', err);
        setError(err.response?.data?.error || 'Erreur de chargement des notifications');

        // En cas d'erreur, charger au moins les notifications documents
        const docNotifs: Notification[] = mockData.notificationsDocuments
          .filter(n => n.destinataire_id === user?.id)
          .map(n => ({
            id: n._id,
            type: mapNotificationType(n.type),
            titre: n.titre,
            message: n.message,
            date: new Date(n.date),
            lu: n.lu,
            priorite: n.priorite,
            source: 'documents' as const,
          }));

        setNotifications(docNotifs);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadNotifications();
    }
  }, [user]);

  // Mapper le type de notification backend vers frontend
  const mapNotificationType = (backendType: string): 'info' | 'success' | 'warning' | 'error' => {
    if (backendType.includes('valide') || backendType.includes('success')) return 'success';
    if (backendType.includes('rejete') || backendType.includes('error')) return 'error';
    if (backendType.includes('expire') || backendType.includes('demande') || backendType.includes('relance')) return 'warning';
    return 'info';
  };

  const allNotifications = useMemo(() => {
    return notifications.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [notifications]);

  const filteredNotifications = allNotifications.filter((notif) => {
    if (filter === 'all') return true;
    if (filter === 'non_lu') return !notif.lu;
    if (filter === 'importantes') return notif.priorite === 'haute';
    if (filter === 'documents') return notif.source === 'documents';
    return notif.type === filter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <IoCheckmarkCircle className="h-6 w-6 text-emerald-500" />;
      case 'warning':
        return <IoWarning className="h-6 w-6 text-amber-500" />;
      case 'error':
        return <IoWarning className="h-6 w-6 text-red-500" />;
      case 'info':
      default:
        return <IoInformationCircle className="h-6 w-6 text-blue-500" />;
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200/60';
      case 'warning':
        return 'bg-amber-50 border-amber-200/60';
      case 'error':
        return 'bg-red-50 border-red-200/60';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200/60';
    }
  };

  const nonLues = allNotifications.filter((n) => !n.lu).length;

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
    } catch (err) {
      console.error('Erreur marquage toutes lues:', err);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, lu: true } : n));
    } catch (err) {
      console.error('Erreur marquage lue:', err);
    }
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
      <div className="border-b border-slate-200/80 dark:border-zinc-800 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Centre de Notifications</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold shadow-xs"
                style={{
                  backgroundColor: `color-mix(in srgb, ${roleTheme.hex} 10%, transparent)`,
                  borderColor: `color-mix(in srgb, ${roleTheme.hex} 30%, transparent)`,
                  color: roleTheme.hex,
                  border: '1px solid'
                }}
              >
                <IoSparkles className="h-3.5 w-3.5" />
                {roleTheme.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {nonLues} notification{nonLues > 1 ? 's' : ''} non lue{nonLues > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            {isLoading ? (
              <IoReloadOutline className="h-5 w-5 animate-spin text-slate-400 dark:text-zinc-500" />
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={nonLues === 0} className="border-slate-200 dark:border-zinc-800">
                  Tout marquer comme lu
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="border-slate-200 dark:border-zinc-800">
                  <IoReloadOutline className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-8 text-center">
          <IoReloadOutline className="h-12 w-12 text-slate-400 animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-600 dark:text-zinc-400">
            Chargement des notifications...
          </p>
        </Card>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="p-8 text-center border-red-200 dark:border-red-900">
          <IoAlertCircleOutline className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
            Erreur de chargement
          </p>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mb-4">{error}</p>
          <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
            <IoReloadOutline className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </Card>
      )}

      {!isLoading && !error && (
        <>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-zinc-400">Total aujourd'hui</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-zinc-100 mt-1">{allNotifications.length}</p>
              </div>
              <IoNotifications className="h-8 w-8 text-slate-400 dark:text-zinc-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-zinc-400">Non lues</p>
                <p className="text-2xl font-semibold text-primary mt-1">{nonLues}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">{nonLues}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-zinc-400">Priorité haute</p>
                <p className="text-2xl font-semibold text-red-600 dark:text-red-400 mt-1">
                  {allNotifications.filter((n) => n.priorite === 'haute').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
                <IoWarning className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-zinc-400">Documents</p>
                <p className="text-2xl font-semibold text-violet-600 dark:text-violet-400 mt-1">
                  {allNotifications.filter((n) => n.source === 'documents').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Toutes les notifications</CardTitle>
              <CardDescription>Filtrées par type et statut</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Toutes
              </Button>
              <Button
                variant={filter === 'non_lu' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('non_lu')}
              >
                Non lues
              </Button>
              <Button
                variant={filter === 'importantes' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('importantes')}
              >
                Importantes
              </Button>
              <Button
                variant={filter === 'documents' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('documents')}
              >
                <IoDocumentTextOutline className="h-4 w-4 mr-1" />
                Documents
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                notif.lu ? 'bg-white border-slate-200/60' : `${getTypeBg(notif.type)} border`
              } hover:shadow-md cursor-pointer`}
              onClick={() => !notif.lu && handleMarkAsRead(notif.id)}
            >
              <div className="flex-shrink-0 mt-1">{getTypeIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${notif.lu ? 'text-slate-700' : 'text-slate-900'}`}>
                      {notif.titre}
                    </p>
                    {!notif.lu && <div className="w-2 h-2 bg-primary rounded-full" />}
                  </div>
                  {notif.priorite === 'haute' && <Badge variant="error">Haute priorité</Badge>}
                </div>
                <p className={`text-sm ${notif.lu ? 'text-slate-600' : 'text-slate-700'} mb-2`}>
                  {notif.message}
                </p>
                <p className="text-xs text-slate-500">
                  {format(notif.date, 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <IoTrash className="h-4 w-4 text-slate-400 hover:text-red-500" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Paramètres */}
      <Card className="rounded-xl border backdrop-blur-md" style={{
        borderColor: `color-mix(in srgb, ${roleTheme.hex} 20%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${roleTheme.hex} 5%, transparent)`
      }}>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <IoNotifications className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: roleTheme.hex }} />
            <div>
              <p className="font-semibold text-slate-900 dark:text-zinc-100 mb-1">Paramètres de notification</p>
              <p className="text-sm text-slate-600 dark:text-zinc-400 mb-3">
                Personnalisez vos préférences de notification : choisissez les types d'alertes que vous souhaitez recevoir
                et configurez les canaux de communication (email, SMS, push).
              </p>
              <Button variant="outline" size="sm" className="border-slate-200 dark:border-zinc-800">
                Configurer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </>
      )}

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-slate-200/80 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-bold" style={{ color: roleTheme.hex }}>Kids'Med IA</span>
            <span>•</span>
            <span>© 2026 Tous droits réservés</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400">
            <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: roleTheme.hex }}>Aide</a>
            <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: roleTheme.hex }}>Confidentialité</a>
          </div>
        </div>
      </footer>
      </motion.div>
    </AppBackground>
  );
};
