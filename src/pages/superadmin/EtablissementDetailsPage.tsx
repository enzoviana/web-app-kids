import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IoBusinessOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoCallOutline,
  IoMailOutline,
  IoCalendarOutline,
  IoStatsChartOutline,
  IoArrowBackOutline,
  IoReloadOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoDocumentTextOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { etablissementApi, enfantApi, abonnementApi } from '@/services/api';
import { cn } from '@/lib/utils';

export const EtablissementDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [etablissement, setEtablissement] = useState<any>(null);
  const [enfants, setEnfants] = useState<any[]>([]);
  const [abonnement, setAbonnement] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [etablissementResponse, enfantsResponse, statsResponse] = await Promise.all([
        etablissementApi.getEtablissementById(id!),
        enfantApi.getEnfantsByEtablissement(id!),
        etablissementApi.getEtablissementStats(id!).catch(() => ({ data: null })),
      ]);

      setEtablissement(etablissementResponse.data);
      setEnfants(enfantsResponse.data || []);
      setStats(statsResponse.data);

      // Charger l'abonnement si disponible
      try {
        const abonnementsResponse = await abonnementApi.getAllAbonnements();
        const abo = abonnementsResponse.data?.find((a: any) => a.etablissement === id);
        setAbonnement(abo);
      } catch (err) {
        console.error('Erreur chargement abonnement:', err);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Erreur chargement établissement:', err);
      setError(err.response?.data?.error || 'Erreur de chargement');
      setLoading(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Basic':
      case 'starter':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
      case 'Premium':
      case 'premium':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400';
      case 'Pro':
      case 'essentiel':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <IoReloadOutline className="h-12 w-12 text-purple-500 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-slate-600 dark:text-zinc-400">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (error || !etablissement) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950">
        <div className="max-w-2xl mx-auto">
          <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
            <CardContent className="p-16 text-center">
              <IoAlertCircleOutline className="h-16 w-16 text-rose-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-2">Erreur</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
                {error || "Impossible de charger les détails de l'établissement"}
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/superadmin/creches')}
                className="rounded-2xl"
              >
                <IoArrowBackOutline className="mr-2 h-4 w-4" />
                Retour à la liste
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const conformite = stats?.conformite || 100;
  const tauxOccupation = etablissement.capaciteAccueil > 0
    ? Math.round((enfants.length / etablissement.capaciteAccueil) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 font-sans antialiased"
    >
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/superadmin/creches')}
          className="h-10 px-4 rounded-2xl"
        >
          <IoArrowBackOutline className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>

      {/* En-tête établissement */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
        <CardContent className="p-8">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-2xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                  <IoBusinessOutline className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">{etablissement.nom}</h1>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                    Établissement {etablissement.type || 'Crèche'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3 text-sm">
                  <IoLocationOutline className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-zinc-100">
                      {etablissement.adresse}
                    </p>
                    <p className="text-slate-500 dark:text-zinc-400">
                      {etablissement.codePostal} {etablissement.ville}
                    </p>
                  </div>
                </div>

                {etablissement.telephone && (
                  <div className="flex items-center gap-3 text-sm">
                    <IoCallOutline className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-700 dark:text-zinc-300">{etablissement.telephone}</p>
                  </div>
                )}

                {etablissement.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <IoMailOutline className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-700 dark:text-zinc-300">{etablissement.email}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <IoCalendarOutline className="h-5 w-5 text-slate-400" />
                  <p className="text-slate-700 dark:text-zinc-300">
                    Créé le {format(new Date(etablissement.createdAt), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
            </div>

            {abonnement && (
              <div className="text-right">
                <Badge className={cn('text-xs px-3 py-1 font-bold', getPlanColor(abonnement.plan))}>
                  {abonnement.plan.toUpperCase()}
                </Badge>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2">
                  Statut: <span className={cn(
                    'font-medium',
                    abonnement.statut === 'actif' || abonnement.statut === 'active'
                      ? 'text-emerald-600'
                      : 'text-slate-500'
                  )}>
                    {abonnement.statut === 'actif' || abonnement.statut === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Enfants</p>
                <p className="text-2xl font-black mt-1">{enfants.length}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  / {etablissement.capaciteAccueil} places
                </p>
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
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Taux d'occupation</p>
                <p className="text-2xl font-black mt-1 text-purple-600">{tauxOccupation}%</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                <IoStatsChartOutline className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Conformité</p>
                <p className="text-2xl font-black mt-1 text-emerald-600">{conformite}%</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                <IoCheckmarkCircleOutline className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Agrément</p>
                <p className="text-sm font-bold mt-1 text-slate-700 dark:text-zinc-300">
                  {etablissement.numeroAgrement || 'Non renseigné'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <IoDocumentTextOutline className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des enfants */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Enfants inscrits ({enfants.length})</CardTitle>
          <CardDescription>Liste des enfants de l'établissement</CardDescription>
        </CardHeader>
        <CardContent>
          {enfants.length === 0 ? (
            <div className="text-center py-12">
              <IoPeopleOutline className="h-16 w-16 text-slate-300 dark:text-zinc-600 mx-auto mb-4" />
              <p className="text-sm text-slate-500 dark:text-zinc-400">Aucun enfant inscrit</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enfants.map((enfant: any) => (
                <div
                  key={enfant._id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  onClick={() => navigate(`/superadmin/enfants/${enfant._id || enfant.id}`)}
                >
                  <p className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                    {enfant.prenom} {enfant.nom}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    Né(e) le {format(new Date(enfant.dateNaissance), 'dd/MM/yyyy')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
