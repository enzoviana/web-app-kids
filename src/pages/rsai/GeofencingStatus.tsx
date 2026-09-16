import React from 'react';
import { motion } from 'framer-motion';
import {
  IoShieldCheckmarkOutline,
  IoLocationOutline,
  IoWarningOutline,
  IoHardwareChipOutline,
  IoNavigateOutline,
  IoConstructOutline,
  IoRadioOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Creche } from '@/types';

interface GeofencingStatusProps {
  isOnSite: boolean;
  onToggle: () => void;
  creche: Creche;
}

export const GeofencingStatus: React.FC<GeofencingStatusProps> = ({
  isOnSite,
  onToggle,
  creche,
}) => {
  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-4 sm:p-6 font-sans antialiased text-slate-900 dark:text-zinc-100">
      <div className="max-w-xl w-full">
        <Card className="shadow-lg border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          
          {/* Header Sécurité */}
          <CardHeader className="text-center pb-4 pt-6 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/50">
            <div className="mx-auto mb-3 relative">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center shadow-inner"
              >
                <IoRadioOutline className="text-rose-600 dark:text-rose-400 h-8 w-8 animate-pulse" />
              </motion.div>
              <Badge 
                variant="outline" 
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-[10px] font-mono px-2 py-0"
              >
                ACCÈS RESTREINT
              </Badge>
            </div>

            <CardTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-100 mt-2">
              Périmètre de Sécurité HDS
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto mt-1 leading-relaxed">
              L'accès aux dossiers médicaux et données nominatives requiert la vérification de votre géolocalisation sur le site de l'établissement.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            
            {/* Visualisation Radar du Périmètre */}
            <div className="relative w-full h-52 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
              
              {/* Grille Tactique en arrière-plan */}
              <div 
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
                  backgroundSize: '16px 16px',
                }}
              />

              {/* Cercles Concentriques (Ondes Radar) */}
              <div className="absolute w-40 h-40 rounded-full border border-sky-500/20 animate-ping" />
              <div className="absolute w-32 h-32 rounded-full border border-emerald-500/40 bg-emerald-500/5" />

              {/* Zone Autorisée (Centre) */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                  <IoShieldCheckmarkOutline className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 mt-1 bg-slate-900/90 px-2 py-0.5 rounded border border-emerald-500/30">
                  {creche.nom || 'Zone Autorisée'}
                </span>
              </div>

              {/* Position Hors Périmètre (User) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute top-6 right-8 z-10 flex items-center gap-2 bg-slate-900/90 border border-rose-500/40 px-2.5 py-1.5 rounded-lg shadow-lg"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <div>
                  <p className="text-[10px] font-mono font-bold text-rose-400">Position détectée</p>
                  <p className="text-[9px] text-slate-400 font-mono">Écart : ~5.2 km</p>
                </div>
              </motion.div>

              {/* Filigrane d'information technique */}
              <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                <IoHardwareChipOutline className="h-3 w-3 text-sky-400" />
                <span>Geofence GPS · Rayon max : 50m</span>
              </div>
            </div>

            {/* Carte des détails du lieu */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800 flex items-start gap-3">
              <div className="p-2 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/50 shrink-0 mt-0.5">
                <IoLocationOutline className="h-4 w-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-zinc-100">
                  Adresse de l'établissement :
                </span>
                <p className="text-slate-500 dark:text-zinc-400">
                  {creche.nom} — {creche.adresse}
                </p>
              </div>
            </div>

            {/* Note sur les autorisations */}
            <div className="flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
              <IoWarningOutline className="h-4 w-4 shrink-0" />
              <span>Veuillez activer les services de géolocalisation sur votre navigateur.</span>
            </div>

            {/* Mode Sandbox / DEV */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80">
              <Button
                onClick={onToggle}
                variant="outline"
                className="w-full h-10 text-xs font-semibold border-dashed border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                <IoConstructOutline className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <span>Simuler présence physique (Sandbox / DEV)</span>
              </Button>
              <p className="text-[10px] text-slate-400 text-center mt-2 font-mono">
                Conformité Code de la santé publique · Protection des données de santé HDS
              </p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};