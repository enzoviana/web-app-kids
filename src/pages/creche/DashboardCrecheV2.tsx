import React, { useMemo, useState, useEffect } from 'react';
import {
  IoTrendingUp,
  IoShieldCheckmarkOutline,
  IoPersonAddOutline,
  IoPeopleOutline,
  IoDocumentTextOutline,
  IoMedkitOutline,
  IoChevronForward,
  IoAddCircleOutline,
  IoThermometerOutline,
  IoFlashOutline,
  IoHeart,
  IoCalendarOutline,
  IoTimeOutline,
  IoSparkles,
  IoReloadOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { GradientButton, GlowBadge, StatusBadge, GlassCard, StatCard } from '@/components/ui';
import { enfantApi, documentApi, notificationApi } from '@/services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { AppBackground } from '@/components/AppBackground';

const DEFAULT_ETABLISSEMENT_ID = 'test-creche-001';

export const DashboardCrecheV2: React.FC = () => {
  const [enfants, setEnfants] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger toutes les données du dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Charger les enfants
        const enfantsResponse = await enfantApi.getEnfantsByEtablissement(DEFAULT_ETABLISSEMENT_ID);
        setEnfants(enfantsResponse.data || []);

        // Charger les notifications récentes
        try {
          const notifsResponse = await notificationApi.getNotifications();
          setNotifications((notifsResponse.data || []).slice(0, 3)); // 3 dernières
        } catch (err) {
          console.error('Erreur notifications:', err);
        }

      } catch (err: any) {
        console.error('Erreur chargement dashboard:', err);
        setError(err.response?.data?.error || 'Erreur de chargement');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Infos établissement (à améliorer avec vraie API établissement)
  const creche = {
    nom: 'Crèche Les Petits Loups',
    capacite: 60,
  };

  // Calculs KPIs basés sur les vraies données
  const presenceEnfants = enfants.length;
  const capacite = creche.capacite;
  const tauxOccupation = capacite > 0 ? Math.round((presenceEnfants / capacite) * 100) : 0;
  const alertesMedicales = useMemo(() => {
    return enfants.filter(e => e.pai?.actif || (e.allergies && e.allergies.length > 0)).length;
  }, [enfants]);
  const documentsManquants = useMemo(() => {
    // Pour l'instant on met 0, à calculer vraiment avec les documents
    return 0;
  }, [documents]);

  // Transmissions récentes depuis les notifications
  const transmissions = useMemo(() => {
    return notifications.map(n => ({
      id: n.id,
      type: n.type.includes('document') ? 'admin' : 'info',
      message: n.message || n.titre,
      timestamp: new Date(n.createdAt),
    }));
  }, [notifications]);

  // Planning de la journée
  const planningToday = [
    { time: '09:30', activity: 'Collation du matin', category: 'Alimentation', status: 'done' },
    { time: '10:15', activity: 'Atelier éveil musical & motricité', category: 'Activité', status: 'ongoing' },
    { time: '11:30', activity: 'Repas des sections', category: 'Alimentation', status: 'upcoming' },
    { time: '12:45', activity: 'Sieste accompagnement PAI', category: 'Repos', status: 'upcoming' },
    { time: '15:30', activity: 'Goûter & Départ échelonné', category: 'Alimentation', status: 'upcoming' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <AppBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <IoReloadOutline className="h-12 w-12 text-lime-600 mx-auto animate-spin" />
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4 max-w-md">
            <IoAlertCircleOutline className="h-12 w-12 text-red-500 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">{error}</p>
            <Button size="sm" onClick={() => window.location.reload()} className="bg-lime-700 hover:bg-lime-600">
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
        {/* Top Header - Thème Lime Crèche */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/80 dark:border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Dashboard Crèche</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-lime-50 dark:bg-lime-950/50 text-lime-700 dark:text-lime-400 border border-lime-200 dark:border-lime-800 shadow-xs">
                <IoSparkles className="h-3.5 w-3.5" />
                {creche.nom}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">
              Vue d'ensemble de l'établissement et gestion quotidienne
            </p>
          </div>
        </div>

        {/* Grid KPIs Dynamiques avec effets au survol */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Présence Enfants - Thème Lime */}
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden relative border-l-4 border-l-lime-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Présence du jour</span>
                <div className="p-2.5 rounded-2xl bg-lime-50 dark:bg-lime-950/50 text-lime-600 dark:text-lime-400">
                  <IoPeopleOutline className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                  {presenceEnfants} <span className="text-xs font-normal text-slate-400">/ {capacite}</span>
                </span>
                <GlowBadge variant="lime" pulse>
                  +2 vs hier
                </GlowBadge>
              </div>
              <div className="mt-4 h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-700"
                  style={{
                    width: `${tauxOccupation}%`,
                    background: 'linear-gradient(to right, #8BC34A 0%, #10B981 100%)'
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Taux d'Occupation - Thème Lime */}
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden relative border-l-4 border-l-lime-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Taux d'occupation</span>
                <div className="p-2.5 rounded-2xl bg-lime-50 dark:bg-lime-950/50 text-lime-600 dark:text-lime-400">
                  <IoTrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                  {tauxOccupation}%
                </span>
                <span className="text-[11px] text-slate-400 font-mono font-medium">Capacité max</span>
              </div>
              <div className="mt-4 h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-700"
                  style={{
                    width: `${tauxOccupation}%`,
                    background: 'linear-gradient(to right, #8BC34A 0%, #10B981 100%)'
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Documents */}
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden relative border-l-4 border-l-amber-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Conformité Dossiers</span>
                <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <IoDocumentTextOutline className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                  {presenceEnfants - documentsManquants} <span className="text-xs font-normal text-slate-400">/ {presenceEnfants}</span>
                </span>
                {documentsManquants > 0 ? (
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800 animate-pulse">
                    {documentsManquants} relances
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
                    100% à jour
                  </span>
                )}
              </div>
              <div className="mt-4 h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-700"
                  style={{
                    width: `${((presenceEnfants - documentsManquants) / presenceEnfants) * 100}%`,
                    background: 'linear-gradient(to right, #F59E0B 0%, #FB923C 100%)'
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alertes Médicales */}
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden relative border-l-4 border-l-rose-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Alertes Santé Active</span>
                <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                  <IoMedkitOutline className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black tracking-tight text-rose-600 dark:text-rose-400 font-mono">
                  {alertesMedicales}
                </span>
                <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800 animate-pulse">
                  Protocole PAI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-4 truncate font-medium">
                Allergies et traitements à surveiller de près
              </p>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* Main Grid: Monitoring & Transmissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Enfants sous surveillance médicale (8 Cols) */}
        <Card className="lg:col-span-8 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800 px-7 pt-7">
            <div>
              <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <IoSparkles className="h-5 w-5 text-teal-600" />
                Suivi Sanitaire Prioritaire
              </CardTitle>
              <CardDescription className="text-xs mt-1 font-medium">Enfants nécessitant une attention particulière (PAI, allergies, symptômes)</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl cursor-pointer"
            >
              <span>Voir tout</span>
              <IoChevronForward className="ml-1 h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100 dark:divide-zinc-800/80">
            {enfants
              .filter(e => e.pai?.actif || e.allergies.length > 0 || e.statut !== 'sain')
              .slice(0, 4)
              .map((enfant) => (
                <motion.div
                  key={enfant._id}
                  whileHover={{ backgroundColor: "rgba(20, 184, 166, 0.03)" }}
                  className="p-4 px-7 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar className="h-11 w-11 border-2 border-teal-500/30 shadow-md">
                      <AvatarImage src={enfant.photo} alt={enfant.prenom} />
                      <AvatarFallback className="text-xs font-bold bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                        {enfant.prenom[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {enfant.prenom} {enfant.nom}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">({enfant.age} ans)</span>
                      </div>
                      
                      {/* PAI & Allergies Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {enfant.pai?.actif && (
                          <Badge variant="outline" className="text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-lg">
                            PAI : {enfant.pai.pathologie || 'Actif'}
                          </Badge>
                        )}
                        {enfant.allergies.length > 0 && (
                          <Badge variant="outline" className="text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-lg">
                            {enfant.allergies.length} allergie(s)
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`text-[11px] font-bold px-3 py-1 border rounded-xl ${
                      enfant.statut === 'symptome'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                        : 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border-teal-200 dark:border-teal-800'
                    }`}>
                      {enfant.statut === 'symptome' ? 'Symptôme' : 'Stable'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-xs font-bold rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 shadow-xs"
                    >
                      Fiche
                    </Button>
                  </div>
                </motion.div>
              ))}
          </CardContent>
        </Card>

        {/* Transmissions récentes (4 Cols) */}
        <Card className="lg:col-span-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
          <CardHeader className="px-7 pt-7 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <IoFlashOutline className="h-5 w-5 text-amber-500" />
              Dernières Transmissions
            </CardTitle>
            <CardDescription className="text-xs mt-1 font-medium">Fil des événements de la journée</CardDescription>
          </CardHeader>
          <CardContent className="p-7 space-y-5">
            {transmissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500 dark:text-zinc-400">
                  Aucune notification récente
                </p>
              </div>
            ) : (
              transmissions.map((t) => (
                <div key={t.id} className="flex gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800/80 last:border-0 last:pb-0">
                  <div className="flex-shrink-0">
                    <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center border border-slate-200 dark:border-zinc-700">
                      <IoDocumentTextOutline className="h-4 w-4 text-slate-600 dark:text-zinc-400" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Notification</span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono font-bold bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                        {format(t.timestamp, 'HH:mm', { locale: fr })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
                      {t.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>

      {/* Bottom Section: Planning & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Timeline Planning (7 Cols) */}
        <Card className="lg:col-span-7 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
          <CardHeader className="px-7 pt-7 pb-4 border-b border-slate-100 dark:border-zinc-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <IoCalendarOutline className="h-5 w-5 text-indigo-500" />
                Programme de la journée
              </CardTitle>
              <CardDescription className="text-xs mt-1 font-medium">Séquences clés et protocoles d'activités</CardDescription>
            </div>
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <IoTimeOutline className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-7 space-y-3.5">
            {planningToday.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/60 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 hover:bg-slate-100/60 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-950/60 px-2.5 py-1 rounded-xl">
                    {item.time}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">{item.activity}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px] font-bold border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-2.5 py-0.5 rounded-lg">
                    {item.category}
                  </Badge>
                  {item.status === 'done' && (
                    <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-zinc-600" />
                  )}
                  {item.status === 'ongoing' && (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                    </span>
                  )}
                  {item.status === 'upcoming' && (
                    <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-zinc-700" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Operations (5 Cols) */}
        <Card className="lg:col-span-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
          <CardHeader className="px-7 pt-7 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-white">
              Raccourcis Opérationnels
            </CardTitle>
            <CardDescription className="text-xs mt-1 font-medium">Saisie rapide d'événements et fiches de présence</CardDescription>
          </CardHeader>
          <CardContent className="p-7 grid grid-cols-2 gap-4">
            
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-start gap-3 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 bg-slate-50/70 dark:bg-zinc-800/40 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 hover:border-teal-300 dark:hover:border-teal-800 transition-all group text-left cursor-pointer shadow-xs"
            >
              <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                <IoPersonAddOutline className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold block text-slate-900 dark:text-zinc-100">Pointage Entrée</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-400 mt-0.5 block font-medium">Valider l'arrivée</span>
              </div>
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-start gap-3 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 bg-slate-50/70 dark:bg-zinc-800/40 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 hover:border-cyan-300 dark:hover:border-cyan-800 transition-all group text-left cursor-pointer shadow-xs"
            >
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                <IoThermometerOutline className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold block text-slate-900 dark:text-zinc-100">Température</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-400 mt-0.5 block font-medium">Saisie symptômes</span>
              </div>
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-start gap-3 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 bg-slate-50/70 dark:bg-zinc-800/40 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 hover:border-amber-300 dark:hover:border-amber-800 transition-all group text-left cursor-pointer shadow-xs"
            >
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <IoFlashOutline className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold block text-slate-900 dark:text-zinc-100">Trans. Flash</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-400 mt-0.5 block font-medium">Envoi aux parents</span>
              </div>
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-start gap-3 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 bg-slate-50/70 dark:bg-zinc-800/40 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 hover:border-purple-300 dark:hover:border-purple-800 transition-all group text-left cursor-pointer shadow-xs"
            >
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <IoShieldCheckmarkOutline className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold block text-slate-900 dark:text-zinc-100">Sécurité</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-400 mt-0.5 block font-medium">Contrôle accès</span>
              </div>
            </motion.button>

          </CardContent>
        </Card>

      </div>

      {/* Professional Footer */}
      <footer className="mt-16 pt-8 border-t border-slate-200/80 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-bold text-lime-600 dark:text-lime-400">Kids'Med IA</span>
            <span>•</span>
            <span>© 2026 Tous droits réservés</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400">
            <a href="#" className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors font-medium">
              Centre d'aide
            </a>
            <span>•</span>
            <a href="#" className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors font-medium">
              Documentation
            </a>
          </div>
        </div>
      </footer>

    </motion.div>
    </AppBackground>
  );
};