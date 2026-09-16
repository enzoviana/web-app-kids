import React, { useState, useEffect } from 'react';
import {
  IoCardOutline,
  IoTrendingUpOutline,
  IoShieldCheckmarkOutline,
  IoDownloadOutline,
  IoReceiptOutline,
  IoSparklesOutline,
  IoCheckmark,
  IoAlertCircleOutline,
  IoReloadOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { abonnementApi, tarifApi } from '@/services/api';
import { motion } from 'framer-motion';

const DEFAULT_ETABLISSEMENT_ID = 'test-creche-001';

export const AbonnementPage: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState('premium');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [abonnement, setAbonnement] = useState<any>(null);
  const [tarifs, setTarifs] = useState<any[]>([]);
  const [subscribing, setSubscribing] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les tarifs actifs
        const tarifsResponse = await tarifApi.getTarifsActifs();
        setTarifs(tarifsResponse.data || []);

        // Récupérer l'abonnement actuel de l'établissement
        try {
          const abonnementResponse = await abonnementApi.getAbonnementByEtablissement(DEFAULT_ETABLISSEMENT_ID);
          if (abonnementResponse.data) {
            setAbonnement(abonnementResponse.data);
            setCurrentPlan(abonnementResponse.data.plan || 'premium');
          }
        } catch (err: any) {
          // Si pas d'abonnement trouvé, ce n'est pas une erreur critique
          if (err.response?.status !== 404) {
            throw err;
          }
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement des données:', err);
        setError(err.response?.data?.error || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Mapper les tarifs backend vers le format UI
  const plans = tarifs.map((tarif) => {
    const planConfig: Record<string, { name: string; description: string; popular?: boolean }> = {
      basic: {
        name: 'Starter',
        description: 'Pour les petites structures ou micro-crèches.',
      },
      premium: {
        name: 'Pro / PAI+',
        description: 'Recommandé pour les crèches jusqu\'à 30 enfants.',
        popular: true,
      },
      enterprise: {
        name: 'Multi-Établissements',
        description: 'Pour les réseaux de crèches & grandes structures.',
      },
    };

    const config = planConfig[tarif.plan] || { name: tarif.nom, description: '' };

    return {
      id: tarif.plan,
      name: config.name,
      price: tarif.prixMensuel.toString(),
      description: config.description,
      popular: config.popular,
      features: tarif.fonctionnalites || [],
      limites: tarif.limites,
    };
  });

  // Historique de facturation (données mock pour l'instant)
  const history = [
    { id: 'INV-2026-009', date: '15 Fév. 2026', montant: '99,00 €', statut: 'Payé', carte: '•••• 4242' },
    { id: 'INV-2026-008', date: '15 Jan. 2026', montant: '99,00 €', statut: 'Payé', carte: '•••• 4242' },
    { id: 'INV-2025-012', date: '15 Déc. 2025', montant: '99,00 €', statut: 'Payé', carte: '•••• 4242' },
  ];

  // Handler pour changer de plan
  const handleChangePlan = async (planId: string) => {
    try {
      setSubscribing(true);
      setError(null);

      // Créer un nouvel abonnement
      const response = await abonnementApi.createAbonnement({
        etablissementId: DEFAULT_ETABLISSEMENT_ID,
        plan: planId,
        moyenPaiement: {
          type: 'carte',
          derniers4Chiffres: '4242',
          dateExpiration: '2028-08',
        },
      });

      setAbonnement(response.data);
      setCurrentPlan(planId);

      console.log('✅ Abonnement créé avec succès:', response.data);
    } catch (err: any) {
      console.error('❌ Erreur lors du changement de plan:', err);
      setError(err.response?.data?.error || 'Erreur lors du changement de plan');
    } finally {
      setSubscribing(false);
    }
  };

  // État de chargement
  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-indigo-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <IoReloadOutline className="h-12 w-12 text-teal-500 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-slate-600 dark:text-zinc-400">Chargement des abonnements...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-8 space-y-8 bg-gradient-to-br from-slate-50 via-teal-50/20 to-indigo-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 font-sans antialiased"
    >

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Facturation & Offres</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Gérez votre formule, votre moyen de paiement et vos factures
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => alert('Module de modification du moyen de paiement à venir')}
          className="h-11 px-5 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-800 cursor-pointer shadow-xs"
        >
          <IoReceiptOutline className="h-4 w-4 mr-2 text-slate-500" />
          Modifier RIB / Carte
        </Button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <Card className="rounded-3xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <IoAlertCircleOutline className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-900 dark:text-red-100">Erreur</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vue Synthétique Plan Actuel */}
      {abonnement && (
        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center border border-slate-200/80 dark:border-zinc-700">
                  <IoShieldCheckmarkOutline className="h-6 w-6 text-slate-700 dark:text-zinc-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      {plans.find(p => p.id === abonnement.plan)?.name || 'Plan Actuel'}
                    </h2>
                    <Badge variant="outline" className={`text-[10px] ${
                      abonnement.statut === 'actif'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                    }`}>
                      {abonnement.statut === 'actif' ? 'Actif' : abonnement.statut}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Prochain renouvellement automatique le <span className="font-mono text-slate-700 dark:text-zinc-300">
                      {new Date(abonnement.dateFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </p>
                </div>
              </div>

              <div className="md:text-right">
                <span className="text-2xl font-bold tracking-tight">{abonnement.montantMensuel?.toFixed(2) || '0.00'} €</span>
                <span className="text-xs text-slate-400 font-mono"> / mois HT</span>
              </div>
            </div>

            {/* Statut Métriques de consommation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 mb-1">
                  <IoSparklesOutline className="h-4 w-4" />
                  <span className="text-xs font-medium">Analyses IA de santé</span>
                </div>
                <p className="text-xl font-bold tracking-tight">
                  {abonnement.consommation?.analysesIA || 0} <span className="text-xs font-normal text-slate-400">requêtes</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {abonnement.limites?.analysesIA === -1 ? 'Utilisation illimitée garantie' : `/ ${abonnement.limites?.analysesIA || 'N/A'}`}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 mb-1">
                  <IoCardOutline className="h-4 w-4" />
                  <span className="text-xs font-medium">Moyen de paiement</span>
                </div>
                <p className="text-sm font-semibold mt-1">
                  {abonnement.moyenPaiement?.type === 'carte' ? 'Visa' : 'Prélèvement'} •••• {abonnement.moyenPaiement?.derniers4Chiffres || '****'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Expire en {abonnement.moyenPaiement?.dateExpiration || 'N/A'}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 mb-1">
                  <IoTrendingUpOutline className="h-4 w-4" />
                  <span className="text-xs font-medium">Capacité enfants</span>
                </div>
                <p className="text-xl font-bold tracking-tight">
                  {abonnement.consommation?.enfantsActifs || 0} <span className="text-xs font-normal text-slate-400">
                    / {abonnement.limites?.nbEnfants === -1 ? '∞' : abonnement.limites?.nbEnfants || 'N/A'} enfants
                  </span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {abonnement.limites?.nbEnfants > 0
                    ? `${Math.round((abonnement.consommation?.enfantsActifs / abonnement.limites?.nbEnfants) * 100)}% du quota utilisé`
                    : 'Illimité'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grille des offres */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Changer de formule</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Ajustez votre abonnement selon la croissance de votre établissement.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan;

            return (
              <Card
                key={plan.id}
                className={`rounded-3xl relative flex flex-col justify-between transition-all bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md hover:shadow-lg ${
                  isCurrent
                    ? 'border-slate-900 dark:border-zinc-100 border-2'
                    : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                {plan.popular && !isCurrent && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                    Populaire
                  </span>
                )}

                <CardContent className="p-6 space-y-5">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{plan.name}</h3>
                      {isCurrent && (
                        <Badge className="text-[9px] bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-zinc-100 border-none font-semibold">
                          Actuel
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 min-h-[32px]">{plan.description}</p>
                    
                    <div className="mt-4 flex items-baseline">
                      <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">{plan.price} €</span>
                      <span className="text-xs text-slate-400 font-mono ml-1">/ mois HT</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-zinc-800 pt-4">
                    <ul className="space-y-2.5">
                      {(plan.features && Array.isArray(plan.features) ? plan.features : []).map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-300">
                          <IoCheckmark className="h-4 w-4 text-slate-900 dark:text-zinc-100 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <div className="p-6 pt-0">
                  {isCurrent ? (
                    <Button disabled className="w-full h-9 text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500">
                      Formule souscrite
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleChangePlan(plan.id)}
                      disabled={subscribing}
                      variant={plan.id === 'enterprise' ? 'default' : 'outline'}
                      className={`w-full h-9 text-xs font-medium ${
                        plan.id === 'enterprise'
                          ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-slate-800'
                          : 'border-slate-200 dark:border-zinc-800'
                      }`}
                    >
                      {subscribing ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                          Chargement...
                        </span>
                      ) : (
                        Number(plan.price) > 99 ? 'Passer à l\'offre supérieure' : 'Choisir ce plan'
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Historique de facturation */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
        <CardHeader className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
          <CardTitle className="text-sm font-bold">Historique des reçus</CardTitle>
          <CardDescription className="text-xs mt-0.5">Téléchargez vos factures d'abonnement au format PDF</CardDescription>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100 dark:divide-zinc-800/60">
          {history.map((item) => (
            <div key={item.id} className="p-4 px-6 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <IoReceiptOutline className="h-4 w-4 text-slate-400" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 block">{item.id}</span>
                  <span className="text-[10px] text-slate-400">{item.date} · Payé via {item.carte}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono font-medium text-slate-700 dark:text-zinc-300">{item.montant}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => alert(`Téléchargement de la facture ${item.id}`)}
                  className="h-8 w-8 p-0 text-slate-500 hover:text-teal-600 cursor-pointer"
                >
                  <IoDownloadOutline className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    </motion.div>
  );
};