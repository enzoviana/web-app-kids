import React, { useState } from 'react';
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoRocketOutline,
  IoShieldCheckmarkOutline,
  IoTrendingUpOutline,
  IoSparklesOutline,
  IoStarOutline,
  IoFlashOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AppBackground } from '@/components/AppBackground';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  features: PlanFeature[];
  color: {
    bg: string;
    border: string;
    iconBg: string;
    iconColor: string;
    buttonBg: string;
    buttonHover: string;
  };
}

export const AbonnementRSAIPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: billingPeriod === 'monthly' ? 49 : 490,
      period: billingPeriod === 'monthly' ? 'mois' : 'an',
      description: 'Pour débuter avec les fonctionnalités essentielles',
      icon: <IoShieldCheckmarkOutline className="h-8 w-8" />,
      color: {
        bg: 'bg-slate-50 dark:bg-slate-900/50',
        border: 'border-slate-200 dark:border-slate-800',
        iconBg: 'bg-slate-100 dark:bg-slate-800',
        iconColor: 'text-slate-600 dark:text-slate-400',
        buttonBg: 'bg-slate-600 hover:bg-slate-700',
        buttonHover: 'hover:bg-slate-700',
      },
      features: [
        { name: 'Accès au registre sanitaire', included: true },
        { name: 'Journal d\'audit HDS', included: true },
        { name: 'Gestion de 2 établissements max', included: true },
        { name: 'Export PDF des rapports', included: true },
        { name: 'Support par email', included: true },
        { name: 'Notifications en temps réel', included: false },
        { name: 'Analyses avancées', included: false },
        { name: 'API et intégrations', included: false },
        { name: 'Support prioritaire 24/7', included: false },
        { name: 'Formation personnalisée', included: false },
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: billingPeriod === 'monthly' ? 99 : 990,
      period: billingPeriod === 'monthly' ? 'mois' : 'an',
      description: 'L\'offre la plus populaire pour les professionnels',
      icon: <IoRocketOutline className="h-8 w-8" />,
      badge: 'Populaire',
      badgeColor: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-400',
      color: {
        bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
        border: 'border-fuchsia-200 dark:border-fuchsia-800',
        iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-900/60',
        iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
        buttonBg: 'bg-fuchsia-600 hover:bg-fuchsia-700',
        buttonHover: 'hover:bg-fuchsia-700',
      },
      features: [
        { name: 'Accès au registre sanitaire', included: true },
        { name: 'Journal d\'audit HDS', included: true },
        { name: 'Gestion de 10 établissements max', included: true },
        { name: 'Export PDF des rapports', included: true },
        { name: 'Support par email', included: true },
        { name: 'Notifications en temps réel', included: true },
        { name: 'Analyses avancées', included: true },
        { name: 'API et intégrations', included: true },
        { name: 'Support prioritaire 24/7', included: false },
        { name: 'Formation personnalisée', included: false },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingPeriod === 'monthly' ? 199 : 1990,
      period: billingPeriod === 'monthly' ? 'mois' : 'an',
      description: 'Pour les grandes structures avec besoins avancés',
      icon: <IoSparklesOutline className="h-8 w-8" />,
      badge: 'Entreprise',
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
      color: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800',
        iconBg: 'bg-amber-100 dark:bg-amber-900/60',
        iconColor: 'text-amber-600 dark:text-amber-400',
        buttonBg: 'bg-amber-600 hover:bg-amber-700',
        buttonHover: 'hover:bg-amber-700',
      },
      features: [
        { name: 'Accès au registre sanitaire', included: true },
        { name: 'Journal d\'audit HDS', included: true },
        { name: 'Établissements illimités', included: true },
        { name: 'Export PDF des rapports', included: true },
        { name: 'Support par email', included: true },
        { name: 'Notifications en temps réel', included: true },
        { name: 'Analyses avancées', included: true },
        { name: 'API et intégrations', included: true },
        { name: 'Support prioritaire 24/7', included: true },
        { name: 'Formation personnalisée', included: true },
      ],
    },
  ];

  const currentPlan = plans.find((p) => p.id === 'premium');

  return (
    <AppBackground>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 text-slate-900 dark:text-zinc-100"
      >
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto border-b border-slate-200/80 dark:border-zinc-800 pb-6">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Abonnement RSAI</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-fuchsia-50 dark:bg-fuchsia-950/50 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-800 shadow-xs">
              <IoRocketOutline className="h-3.5 w-3.5" />
              Gestion Abonnement
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            Choisissez l'offre qui correspond le mieux à vos besoins
          </p>
        </div>

        {/* Abonnement actuel */}
        {currentPlan && (
          <Card className="relative rounded-xl border border-fuchsia-200 dark:border-fuchsia-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-lg border-l-4 border-l-fuchsia-500">
            <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-900/60 flex items-center justify-center border-2 border-fuchsia-200 dark:border-fuchsia-800">
                  <IoStarOutline className="h-7 w-7 text-fuchsia-600 dark:text-fuchsia-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black">Abonnement Actuel</h3>
                    <Badge className="bg-fuchsia-200 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200 border-fuchsia-300 dark:border-fuchsia-700 text-xs px-2 py-0.5">
                      {currentPlan.name}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
                    Facturé {billingPeriod === 'monthly' ? 'mensuellement' : 'annuellement'}
                  </p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-3xl font-black text-fuchsia-600 dark:text-fuchsia-400">
                  {currentPlan.price}€
                  <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                    /{currentPlan.period}
                  </span>
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Prochain renouvellement : 16 oct. 2026
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toggle Mensuel/Annuel */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-3 p-1.5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-fuchsia-600 text-white shadow-md'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all relative ${
              billingPeriod === 'yearly'
                ? 'bg-fuchsia-600 text-white shadow-md'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            Annuel
            <Badge className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] px-1.5 py-0 border-0">
              -17%
            </Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`relative ${plan.id === 'premium' ? 'md:-mt-4 md:mb-4' : ''}`}
          >
            <Card
              className={`rounded-3xl border-2 ${plan.color.border} ${plan.color.bg} backdrop-blur-xl shadow-lg hover:shadow-xl transition-all overflow-hidden ${
                selectedPlan === plan.id ? 'ring-4 ring-fuchsia-300 dark:ring-fuchsia-700' : ''
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute top-4 right-4">
                  <Badge className={`${plan.badgeColor} border-0 text-xs px-3 py-1 font-bold`}>
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="p-6 border-b border-slate-200 dark:border-zinc-800">
                {/* Icon */}
                <div className={`h-16 w-16 rounded-2xl ${plan.color.iconBg} flex items-center justify-center ${plan.color.iconColor} mb-4`}>
                  {plan.icon}
                </div>

                {/* Plan Name */}
                <CardTitle className="text-2xl font-black">{plan.name}</CardTitle>
                <CardDescription className="text-xs text-slate-600 dark:text-zinc-400 mt-2">
                  {plan.description}
                </CardDescription>

                {/* Price */}
                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{plan.price}€</span>
                    <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">/{plan.period}</span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                      Économisez {Math.round(((plan.price * 12) / 10 - plan.price) / ((plan.price * 12) / 10) * 100)}% par rapport au mensuel
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full h-11 mt-6 text-sm font-bold rounded-2xl ${
                    selectedPlan === plan.id
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : `${plan.color.buttonBg} text-white`
                  } transition-all cursor-pointer`}
                >
                  {selectedPlan === plan.id ? (
                    <>
                      <IoCheckmarkCircleOutline className="h-5 w-5 mr-2" />
                      Abonnement actuel
                    </>
                  ) : (
                    <>
                      <IoFlashOutline className="h-5 w-5 mr-2" />
                      Choisir {plan.name}
                    </>
                  )}
                </Button>
              </CardHeader>

              {/* Features List */}
              <CardContent className="p-6">
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-4">
                  Fonctionnalités incluses
                </p>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <IoCheckmarkCircleOutline className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <IoCloseCircleOutline className="h-5 w-5 text-slate-300 dark:text-zinc-600 shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-xs ${
                          feature.included
                            ? 'text-slate-700 dark:text-zinc-300 font-medium'
                            : 'text-slate-400 dark:text-zinc-600'
                        }`}
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Avantages supplémentaires */}
      <Card className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md max-w-5xl mx-auto">
        <CardHeader className="p-6 border-b border-slate-200 dark:border-zinc-800">
          <CardTitle className="text-base font-black">Tous les abonnements incluent</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                <IoShieldCheckmarkOutline className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold mb-1">Conformité HDS</h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Certification Hébergeur de Données de Santé pour la sécurité maximale
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                <IoTrendingUpOutline className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold mb-1">Mises à jour gratuites</h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Accès illimité aux nouvelles fonctionnalités et améliorations
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                <IoRocketOutline className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold mb-1">Sans engagement</h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Résiliez à tout moment sans frais supplémentaires
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* FAQ / Contact */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Des questions sur nos offres ?{' '}
            <button className="font-bold text-fuchsia-600 dark:text-fuchsia-400 hover:underline cursor-pointer">
              Contactez notre équipe commerciale
            </button>
          </p>
        </div>

        {/* Professional Footer */}
        <footer className="mt-8 pt-6 border-t border-slate-200 dark:border-zinc-800 text-center">
          <p className="text-xs text-slate-500 dark:text-zinc-500 font-medium">
            Kids'Med IA © 2026 - Gestion des Abonnements RSAI
          </p>
        </footer>
      </motion.div>
    </AppBackground>
  );
};
