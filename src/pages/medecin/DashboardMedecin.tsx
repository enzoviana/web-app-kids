import React, { useState } from 'react';
import {
  IoMedkitOutline,
  IoDocumentTextOutline,
  IoSparklesOutline,
  IoArrowForward,
  IoCalendarOutline,
  IoWarningOutline,
  IoSearchOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoBandageOutline,
  IoFilterOutline,
  IoSparkles,
} from 'react-icons/io5';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GradientButton, GlowBadge, StatusBadge, GlassCard, StatCard } from '@/components/ui';
import { mockData } from '@/data/mockData';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AppBackground } from '@/components/AppBackground';
import { motion } from 'framer-motion';

export const DashboardMedecin: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPai, setFilterPai] = useState(false);

  const enfants = mockData.enfants;
  const diagnostics = mockData.diagnosticsIA;
  const ordonnances = mockData.ordonnances;

  // Filtrage des enfants
  const filteredEnfants = enfants.filter((enfant) => {
    const matchesSearch = `${enfant.prenom} ${enfant.nom}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPai = filterPai ? enfant.pai?.actif : true;
    return matchesSearch && matchesPai;
  });

  const statsCards = [
    {
      icon: <IoMedkitOutline className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />,
      label: 'Patients pédiatriques',
      value: enfants.length,
      subtext: 'Suivis réguliers',
      color: '#0099FF',
    },
    {
      icon: <IoDocumentTextOutline className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      label: 'Ordonnances actives',
      value: ordonnances.length,
      subtext: 'En cours de traitement',
      color: '#3B82F6',
    },
    {
      icon: <IoSparklesOutline className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
      label: 'Analyses IA (7j)',
      value: diagnostics.length,
      subtext: 'Avis pré-diagnostic',
      color: '#6366F1',
    },
    {
      icon: <IoWarningOutline className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
      label: 'Dossiers PAI actifs',
      value: enfants.filter((e) => e.pai?.actif).length,
      subtext: 'Protocole individualisé',
      color: '#F59E0B',
    },
  ];

  return (
    <AppBackground>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 text-slate-900 dark:text-zinc-100"
      >

      {/* En-tête Espace Médical */}
      <div className="border-b border-slate-200/80 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-2.5 mb-4">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Espace Pédiatrique & Diagnostics</h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 shadow-xs">
            <IoSparkles className="h-3.5 w-3.5" />
            Session HDS
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
          Revue des signaux sanitaires transmis par les crèches et validation des diagnostics IA.
        </p>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 text-xs border-slate-200 dark:border-zinc-800">
            <IoCalendarOutline className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
            Agenda consultations
          </Button>
          <Button size="sm" className="h-9 text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-medium">
            <IoDocumentTextOutline className="mr-1.5 h-3.5 w-3.5" />
            Nouvelle Ordonnance
          </Button>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, idx) => (
          <Card key={idx} className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-l-4"
            style={{ borderLeftColor: stat.color }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-black mt-1">{stat.value}</p>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">{stat.subtext}</p>
                </div>
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colonne Gauche : Chronologie des Analyses IA (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
            <CardHeader className="p-4 border-b border-slate-100 dark:border-zinc-800/80 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <IoSparklesOutline className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">Signaux de Santé & Analyses IA Récentes</CardTitle>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">Pré-diagnostics automatisés à valider en consultation</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700">
                Voir l'historique
              </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {diagnostics.slice(0, 3).map((diag) => {
                const enfant = enfants.find((e) => e._id === diag.enfant_id);
                const isHighConfidence = diag.confiance >= 85;

                return (
                  <div
                    key={diag._id}
                    className="p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:border-cyan-300 dark:hover:border-cyan-800 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={enfant?.photo} />
                          <AvatarFallback className="bg-cyan-100 text-cyan-700 text-xs font-bold">
                            {enfant?.prenom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                            {enfant?.prenom} {enfant?.nom}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Transmis le {format(new Date(diag.date), 'dd MMM yyyy · HH:mm', { locale: fr })}
                          </p>
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono px-2 py-0.5 border ${
                          isHighConfidence
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                        }`}
                      >
                        {isHighConfidence ? (
                          <IoCheckmarkCircleOutline className="mr-1 h-3 w-3 inline text-emerald-600" />
                        ) : (
                          <IoAlertCircleOutline className="mr-1 h-3 w-3 inline text-amber-600" />
                        )}
                        Confiance : {diag.confiance}%
                      </Badge>
                    </div>

                    {/* Diagnostic Proposé */}
                    <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 my-2">
                      <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <span className="text-cyan-600 font-bold">Suspicion :</span> {diag.diagnostic}
                      </div>
                    </div>

                    {/* Badge de Symptômes */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {diag.symptomes.map((symptome, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-zinc-800 text-[10px] font-medium text-slate-600 dark:text-zinc-400"
                        >
                          {symptome}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-zinc-800/50 text-[11px] text-slate-500 dark:text-zinc-400">
                      <span className="truncate max-w-[80%] font-medium">
                        💡 Recommandation IA : {diag.recommandation}
                      </span>
                      <IoArrowForward className="h-4 w-4 text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Colonne Droite : Liste des Patients Suivis (1 col) */}
        <div className="space-y-6">
          <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
            <CardHeader className="p-4 border-b border-slate-100 dark:border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">Patientèle suivis</CardTitle>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {filteredEnfants.length} enfants
                </Badge>
              </div>

              {/* Barre de Recherche et Filtres */}
              <div className="space-y-2">
                <div className="relative">
                  <IoSearchOutline className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un enfant..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <Button
                  variant={filterPai ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterPai(!filterPai)}
                  className={`w-full h-7 text-[10px] justify-between ${
                    filterPai ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <IoFilterOutline className="h-3 w-3" />
                    Afficher uniquement les PAI
                  </span>
                  {filterPai && <span>Actif</span>}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-3 space-y-2 max-h-[520px] overflow-y-auto">
              {filteredEnfants.map((enfant) => (
                <div
                  key={enfant._id}
                  className="p-3 rounded-lg border border-slate-100 dark:border-zinc-800 hover:border-cyan-200 dark:hover:border-cyan-900 hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-all cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={enfant.photo} />
                        <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-bold">
                          {enfant.prenom[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                            {enfant.prenom} {enfant.nom}
                          </h4>
                          {enfant.pai?.actif && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                              PAI
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {enfant.age} ans · Sang : {enfant.groupeSanguin}
                        </p>
                      </div>
                    </div>

                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 group-hover:text-cyan-600">
                      <IoArrowForward className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Alerte Allergies */}
                  {enfant.allergies.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 px-2 py-1 rounded border border-rose-100 dark:border-rose-900/40">
                      <IoWarningOutline className="h-3 w-3 shrink-0" />
                      <span className="truncate">Allergies : {enfant.allergies.join(', ')}</span>
                    </div>
                  )}

                  {/* PAI Info */}
                  {enfant.pai?.actif && (
                    <div className="p-2 rounded bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-[10px]">
                      <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                        <IoBandageOutline className="h-3 w-3" />
                        {enfant.pai.pathologie}
                      </div>
                      <p className="text-amber-700 dark:text-amber-400/80 truncate mt-0.5">
                        {enfant.pai.traitement}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-slate-200/80 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-bold text-cyan-600 dark:text-cyan-400">Kids'Med IA</span>
            <span>•</span>
            <span>© 2026 Tous droits réservés</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400">
            <a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Aide</a>
            <a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">CGU</a>
          </div>
        </div>
      </footer>
      </motion.div>
    </AppBackground>
  );
};