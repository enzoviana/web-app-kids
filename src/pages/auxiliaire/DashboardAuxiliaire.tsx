import React from 'react';
import { IoPeople, IoMedkit, IoDocumentText, IoTime, IoCalendar, IoCheckmarkCircle, IoSparkles } from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AppBackground } from '@/components/AppBackground';
import { motion } from 'framer-motion';

export const DashboardAuxiliaire: React.FC = () => {
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
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Tableau de bord - Section Moyens</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 shadow-xs">
              <IoSparkles className="h-3.5 w-3.5" />
              Auxiliaire
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">
            {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-l-4 border-l-teal-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Enfants présents</p>
                  <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">8 / 12</p>
                </div>
                <IoPeople className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-l-4 border-l-amber-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Soins à faire</p>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">2</p>
                </div>
                <IoMedkit className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-l-4 border-l-emerald-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Transmissions</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">5</p>
                </div>
                <IoDocumentText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-l-4 border-l-slate-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Heure actuelle</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">
                    {format(new Date(), 'HH:mm')}
                  </p>
                </div>
                <IoTime className="h-6 w-6 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Enfants présents */}
      <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Enfants présents - Section Moyens</CardTitle>
              <CardDescription>Liste des enfants à charge aujourd'hui</CardDescription>
            </div>
            <Badge variant="primary">8 enfants</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { nom: 'Martin', prenom: 'Lucas', statut: 'ok', allergie: false },
              { nom: 'Petit', prenom: 'Emma', statut: 'medicament', allergie: true },
              { nom: 'Durand', prenom: 'Noah', statut: 'ok', allergie: false },
              { nom: 'Rousseau', prenom: 'Léa', statut: 'surveillance', allergie: false },
              { nom: 'Bernard', prenom: 'Hugo', statut: 'ok', allergie: false },
              { nom: 'Leroy', prenom: 'Chloé', statut: 'ok', allergie: true },
              { nom: 'Moreau', prenom: 'Tom', statut: 'ok', allergie: false },
              { nom: 'Simon', prenom: 'Zoé', statut: 'ok', allergie: false },
            ].map((enfant, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200/60 dark:border-zinc-700/60 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{enfant.prenom[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-zinc-100">
                      {enfant.prenom} {enfant.nom}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {enfant.allergie && <Badge variant="error" className="text-xs">Allergie</Badge>}
                      {enfant.statut === 'medicament' && (
                        <Badge variant="warning" className="text-xs">Médicament 16h</Badge>
                      )}
                      {enfant.statut === 'surveillance' && (
                        <Badge variant="warning" className="text-xs">Surveillance</Badge>
                      )}
                    </div>
                  </div>
                </div>
                {enfant.statut === 'ok' && (
                  <IoCheckmarkCircle className="h-5 w-5 text-emerald-500" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Planning du jour */}
      <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Planning du jour</CardTitle>
          <CardDescription>Activités et horaires</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { heure: '9h30', activite: 'Accueil et jeux libres', termine: true },
              { heure: '10h00', activite: 'Atelier créatif : peinture', termine: true },
              { heure: '11h30', activite: 'Repas du midi', termine: false },
              { heure: '13h00', activite: 'Sieste', termine: false },
              { heure: '15h30', activite: 'Goûter', termine: false },
              { heure: '16h00', activite: 'Jeux extérieurs (si météo)', termine: false },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  item.termine ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60' : 'bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60'
                }`}
              >
                <div className="w-16 text-sm font-medium text-slate-700 dark:text-zinc-300">{item.heure}</div>
                <div className="flex-1">
                  <p className={`text-sm ${item.termine ? 'text-emerald-900 dark:text-emerald-400' : 'text-slate-900 dark:text-zinc-100'}`}>
                    {item.activite}
                  </p>
                </div>
                {item.termine && <IoCheckmarkCircle className="h-5 w-5 text-emerald-500" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md hover:shadow-md dark:hover:shadow-none transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center mx-auto mb-3">
              <IoDocumentText className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-zinc-100">Cahier de liaison</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Ajouter une transmission</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md hover:shadow-md dark:hover:shadow-none transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-3">
              <IoMedkit className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-zinc-100">Registre médicaments</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Enregistrer administration</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md hover:shadow-md dark:hover:shadow-none transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-3">
              <IoCalendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-zinc-100">Pointage</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Pointer présence</p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-slate-200/80 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-bold text-teal-600 dark:text-teal-400">Kids'Med IA</span>
            <span>•</span>
            <span>© 2026 Tous droits réservés</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400">
            <a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Aide</a>
            <a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">CGU</a>
          </div>
        </div>
      </footer>
      </motion.div>
    </AppBackground>
  );
};
