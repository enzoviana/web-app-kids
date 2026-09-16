import React, { useState, useMemo, useEffect } from 'react';
import {
  IoHome,
  IoDocument,
  IoCalendar,
  IoChatbubbles,
  IoNotifications,
  IoMedkit,
  IoLinkOutline,
  IoAddOutline,
  IoCloudUploadOutline,
  IoAlertCircleOutline,
  IoDocumentTextOutline,
  IoReloadOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { enfantApi, documentApi } from '@/services/api';
import { LierEnfantModal } from '@/components/modals/LierEnfantModal';
import { UploadDocumentModal } from '@/components/modals/UploadDocumentModal';
import type { Document } from '@/types';
import { getDocumentTypeLabel } from '@/utils/documentHelpers';

const DEFAULT_ETABLISSEMENT_ID = 'test-creche-001';

export const PortailParentPage: React.FC = () => {
  const { user } = useAuth();
  const [isLierModalOpen, setIsLierModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [enfants, setEnfants] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les enfants du parent
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        // Charger les enfants de l'établissement (filtré côté serveur pour les parents)
        const enfantsResponse = await enfantApi.getEnfantsByEtablissement(DEFAULT_ETABLISSEMENT_ID);
        setEnfants(enfantsResponse.data || []);

        // Charger les documents pour tous les enfants du parent
        // Note: À améliorer avec une vraie API qui retourne les documents par parent
        const allDocs: any[] = [];
        for (const enfant of enfantsResponse.data || []) {
          try {
            const docsResponse = await documentApi.getDocumentsByEnfant(enfant.id);
            allDocs.push(...(docsResponse.data || []));
          } catch (err) {
            console.error('Erreur chargement documents enfant:', err);
          }
        }
        setDocuments(allDocs);
      } catch (err) {
        console.error('Erreur chargement données parent:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const parentEnfants = enfants;

  const documentsAFournir = useMemo(() => {
    return documents.filter(d =>
      ['en_attente', 'rejete', 'expire_bientot'].includes(d.statut)
    );
  }, [documents]);

  const handleUploadDoc = (doc: Document) => {
    setSelectedDocument(doc);
    setIsUploadModalOpen(true);
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 dark:bg-zinc-950 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-zinc-100">Portail Parent</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Bienvenue sur l'espace parent de Kids'Med</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-8 text-center">
          <IoReloadOutline className="h-12 w-12 text-slate-400 animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-600 dark:text-zinc-400">
            Chargement...
          </p>
        </Card>
      )}

      {/* No child linked */}
      {!isLoading && parentEnfants.length === 0 && (
        <Card className="border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardContent className="p-8 text-center">
            <IoLinkOutline className="mx-auto h-12 w-12 text-slate-400 dark:text-zinc-500 mb-4" />
            <h3 className="font-semibold text-lg text-slate-900 dark:text-zinc-100 mb-2">Aucun enfant lié</h3>
            <p className="text-slate-600 dark:text-zinc-400 mb-4">
              Demandez le code confidentiel à la crèche pour lier votre enfant
            </p>
            <Button onClick={() => setIsLierModalOpen(true)} className="gap-2">
              <IoAddOutline className="h-4 w-4" />
              Lier mon enfant
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Documents à fournir */}
      {documentsAFournir.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
              <IoDocumentTextOutline className="text-amber-500 h-5 w-5" />
              Documents à fournir
              <Badge variant="warning" className="ml-2">{documentsAFournir.length}</Badge>
            </CardTitle>
            <CardDescription className="text-amber-800 dark:text-amber-400">
              Merci de fournir les documents suivants dans les meilleurs délais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documentsAFournir.map(doc => {
                const enfant = mockData.enfants.find(e => e._id === doc.enfant_id);
                return (
                  <div
                    key={doc._id}
                    className="flex items-start justify-between p-4 border border-amber-200 dark:border-amber-900/40 rounded-lg bg-white dark:bg-zinc-900"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-zinc-100">
                        {getDocumentTypeLabel(doc.type)}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-zinc-400">
                        Pour : {enfant?.prenom} {enfant?.nom}
                      </p>
                      {doc.statut === 'rejete' && doc.commentaire && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-start gap-1">
                          <IoAlertCircleOutline className="inline h-4 w-4 shrink-0 mt-0.5" />
                          {doc.commentaire}
                        </p>
                      )}
                      {doc.statut === 'expire_bientot' && doc.dateExpiration && (
                        <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                          Expire le {format(new Date(doc.dateExpiration), 'dd/MM/yyyy', { locale: fr })}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleUploadDoc(doc)}
                      className="gap-1 shrink-0"
                    >
                      <IoCloudUploadOutline className="h-4 w-4" />
                      Téléverser
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enfant Cards */}
      {parentEnfants.map(enfant => (
        <Card key={enfant._id}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-4 ring-slate-100 dark:ring-zinc-800">
                <AvatarImage src={enfant.photo} />
                <AvatarFallback className="text-xl">{enfant.prenom[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-zinc-100">
                  {enfant.prenom} {enfant.nom}
                </h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400">{enfant.age} ans</p>
                <Badge variant="success" className="mt-2">Présent aujourd'hui</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Actualités du jour */}
      <Card>
        <CardHeader>
          <CardTitle>Actualités du jour</CardTitle>
          <CardDescription>{format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200/60">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <IoMedkit className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-emerald-900">Repas du midi</p>
              <p className="text-sm text-emerald-700 mt-1">
                Lucas a très bien mangé : purée de carottes + compote de pommes. A bu 150ml d'eau.
              </p>
              <p className="text-xs text-emerald-600 mt-2">12:30 • par Marie Leclerc</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 border border-blue-200/60">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <IoCalendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-900">Sieste</p>
              <p className="text-sm text-blue-700 mt-1">
                Sieste de 2h15 (13h30-15h45). S'est endormi facilement, réveil calme.
              </p>
              <p className="text-xs text-blue-600 mt-2">15:45 • par Claire Rousseau</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-50 border border-purple-200/60">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🎨</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-purple-900">Activité</p>
              <p className="text-sm text-purple-700 mt-1">
                Atelier peinture ce matin. Lucas très concentré et créatif !
              </p>
              <p className="text-xs text-purple-600 mt-2">10:00 • par Sophie Bernard</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <IoDocument className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-slate-900">Mes documents</h3>
            <p className="text-sm text-slate-500 mt-1">Certificats, autorisations</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
              <IoMedkit className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Dossier médical</h3>
            <p className="text-sm text-slate-500 mt-1">Vaccins, allergies, PAI</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
              <IoChatbubbles className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Messagerie</h3>
            <p className="text-sm text-slate-500 mt-1">Contacter la crèche</p>
            <Badge variant="error" className="mt-2">2 nouveaux</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Planning de la semaine */}
      <Card>
        <CardHeader>
          <CardTitle>Planning de présence</CardTitle>
          <CardDescription>Semaine du 9 au 13 septembre 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((jour, idx) => (
              <div key={jour} className="text-center">
                <p className="text-sm font-medium text-slate-700 mb-2">{jour}</p>
                <div
                  className={`p-3 rounded-lg ${
                    idx <= 2
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <p className="text-xs text-slate-600">
                    {idx <= 2 ? '8h00 - 17h30' : 'Absent'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5 dark:bg-primary/10 dark:border-primary/30">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <IoNotifications className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-zinc-100 mb-1">Restez informé</p>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                Recevez des notifications en temps réel sur l'activité de votre enfant (repas, sieste, incidents).
                Activez les notifications push pour ne rien manquer !
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Activer les notifications
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {user && (
        <>
          <LierEnfantModal
            isOpen={isLierModalOpen}
            onClose={() => setIsLierModalOpen(false)}
            parentId={user.id}
          />

          {selectedDocument && (
            <UploadDocumentModal
              isOpen={isUploadModalOpen}
              onClose={() => {
                setIsUploadModalOpen(false);
                setSelectedDocument(null);
              }}
              document={selectedDocument}
              userId={user.id}
            />
          )}
        </>
      )}
    </div>
  );
};
