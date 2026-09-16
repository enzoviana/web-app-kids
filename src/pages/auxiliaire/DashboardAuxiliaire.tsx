import React from 'react';
import { IoPeople, IoMedkit, IoDocumentText, IoTime, IoCalendar, IoCheckmarkCircle } from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const DashboardAuxiliaire: React.FC = () => {
  return (
    <div className="p-8 space-y-6 bg-slate-50">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Tableau de bord - Section Moyens</h1>
        <p className="text-sm text-slate-500 mt-1">
          {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Enfants présents</p>
                <p className="text-2xl font-semibold text-primary mt-1">8 / 12</p>
              </div>
              <IoPeople className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Soins à faire</p>
                <p className="text-2xl font-semibold text-amber-600 mt-1">2</p>
              </div>
              <IoMedkit className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Transmissions</p>
                <p className="text-2xl font-semibold text-emerald-600 mt-1">5</p>
              </div>
              <IoDocumentText className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Heure actuelle</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">
                  {format(new Date(), 'HH:mm')}
                </p>
              </div>
              <IoTime className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enfants présents */}
      <Card>
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
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{enfant.prenom[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-900">
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
      <Card>
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
                  item.termine ? 'bg-emerald-50 border border-emerald-200/60' : 'bg-slate-50 border border-slate-200/60'
                }`}
              >
                <div className="w-16 text-sm font-medium text-slate-700">{item.heure}</div>
                <div className="flex-1">
                  <p className={`text-sm ${item.termine ? 'text-emerald-900' : 'text-slate-900'}`}>
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
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <IoDocumentText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-slate-900">Cahier de liaison</h3>
            <p className="text-sm text-slate-500 mt-1">Ajouter une transmission</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
              <IoMedkit className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Registre médicaments</h3>
            <p className="text-sm text-slate-500 mt-1">Enregistrer administration</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
              <IoCalendar className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Pointage</h3>
            <p className="text-sm text-slate-500 mt-1">Pointer présence</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
