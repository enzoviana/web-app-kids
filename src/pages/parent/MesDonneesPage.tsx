import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IoShieldCheckmarkOutline,
  IoDownloadOutline,
  IoTrashOutline,
  IoWarningOutline,
  IoDocumentTextOutline,
  IoArrowBackOutline,
  IoCheckmarkCircleOutline,
  IoSparkles,
} from 'react-icons/io5';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AppBackground } from '@/components/AppBackground';
import { motion } from 'framer-motion';

/**
 * Page RGPD - Gestion des données personnelles
 * Conforme RGPD : Droit d'accès, d'export et de suppression
 * CDC pages 8-9 : Conformité RGPD
 */
export const MesDonneesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /**
   * Export des données personnelles au format JSON
   * RGPD Article 20 : Droit à la portabilité
   */
  const handleExportData = async () => {
    try {
      setExporting(true);

      // Mode démo : génération JSON simulé
      // En production : endpoint backend /api/user/export-data

      const exportData = {
        export_date: new Date().toISOString(),
        user: {
          id: user?.id,
          nom: user?.nom,
          prenom: user?.prenom,
          email: user?.email,
          role: user?.role,
          date_inscription: '2026-01-15T10:00:00Z',
          date_derniere_connexion: new Date().toISOString(),
        },
        enfants: [
          // Données enfants liés (simulé)
        ],
        documents: [
          // Documents uploadés (simulé)
        ],
        notifications: [
          // Historique notifications (simulé)
        ],
        logs_connexion: [
          // Logs de connexion (simulé)
        ],
        metadata: {
          format: 'JSON',
          version: '1.0',
          conformite: 'RGPD Article 20',
        },
      };

      // Créer le fichier JSON et télécharger
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mes_donnees_kidsmed_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('✅ Données exportées avec succès', {
        description: 'Votre fichier JSON a été téléchargé',
      });
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Impossible d\'exporter les données');
    } finally {
      setExporting(false);
    }
  };

  /**
   * Suppression du compte et de toutes les données
   * RGPD Article 17 : Droit à l'effacement
   */
  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);

      // Mode démo : simulation de suppression
      // En production : endpoint backend /api/user/delete-account

      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success('Compte supprimé', {
        description: 'Toutes vos données ont été effacées',
      });

      // Déconnexion et redirection
      navigate('/login');
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Impossible de supprimer le compte');
    } finally {
      setDeleting(false);
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
        <Button variant="ghost" onClick={() => navigate('/parent/parametres')} className="mb-4">
          <IoArrowBackOutline className="mr-2" />
          Retour
        </Button>
        <div className="flex items-center gap-2.5 mb-2">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Mes Données Personnelles</h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800 shadow-xs">
            <IoSparkles className="h-3.5 w-3.5" />
            RGPD
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-zinc-400">Gestion de vos données conformément au RGPD</p>
      </div>

      {/* Informations RGPD */}
      <Card className="mb-6 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 backdrop-blur-md">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <IoCheckmarkCircleOutline className="text-2xl text-blue-600 flex-shrink-0 mt-1" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">Vos droits RGPD</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit à la portabilité (export des données)</li>
                <li>Droit à l'effacement ("droit à l'oubli")</li>
                <li>Droit de rectification (modifier vos informations)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Données collectées */}
      <Card className="mb-6 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Données que nous collectons</CardTitle>
          <CardDescription>
            Informations personnelles stockées dans notre système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Identité</p>
                <p className="text-sm text-gray-600">Nom, prénom, email, téléphone</p>
              </div>
              <Badge>Obligatoire</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Enfants</p>
                <p className="text-sm text-gray-600">Informations médicales, documents, photos</p>
              </div>
              <Badge>Obligatoire</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Connexion</p>
                <p className="text-sm text-gray-600">
                  Logs d'accès, adresse IP, type d'appareil
                </p>
              </div>
              <Badge variant="secondary">Sécurité</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Communications</p>
                <p className="text-sm text-gray-600">Messagerie, notifications, documents</p>
              </div>
              <Badge variant="secondary">Fonctionnel</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consentements */}
      <Card className="mb-6 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Mes consentements</CardTitle>
          <CardDescription>Autorisations que vous avez données</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <IoCheckmarkCircleOutline className="text-2xl text-green-500" />
                <div>
                  <p className="font-medium">Conditions générales d'utilisation</p>
                  <p className="text-xs text-gray-600">Accepté le 15 janvier 2026</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <IoCheckmarkCircleOutline className="text-2xl text-green-500" />
                <div>
                  <p className="font-medium">Politique de confidentialité</p>
                  <p className="text-xs text-gray-600">Accepté le 15 janvier 2026</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <IoCheckmarkCircleOutline className="text-2xl text-green-500" />
                <div>
                  <p className="font-medium">Stockage données médicales (HDS)</p>
                  <p className="text-xs text-gray-600">Accepté le 15 janvier 2026</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions RGPD */}
      <Card className="mb-6 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Actions disponibles</CardTitle>
          <CardDescription>
            Exercez vos droits sur vos données personnelles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Exporter les données */}
          <div className="flex items-start gap-4 p-4 border rounded-lg">
            <IoDownloadOutline className="text-3xl text-blue-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Exporter mes données</h3>
              <p className="text-sm text-gray-600 mb-3">
                Téléchargez toutes vos données au format JSON (RGPD Article 20)
              </p>
              <Button onClick={handleExportData} disabled={exporting} variant="outline">
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    Export en cours...
                  </>
                ) : (
                  <>
                    <IoDownloadOutline className="mr-2" />
                    Exporter mes données
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Supprimer le compte */}
          <div className="flex items-start gap-4 p-4 border border-red-200 bg-red-50 rounded-lg">
            <IoTrashOutline className="text-3xl text-red-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 mb-1">Supprimer mon compte</h3>
              <p className="text-sm text-red-700 mb-3">
                Supprime définitivement votre compte et toutes vos données (RGPD Article 17).
                <br />
                <strong>Cette action est irréversible.</strong>
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <IoWarningOutline className="mr-2" />
                    Supprimer mon compte
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <IoWarningOutline className="text-2xl text-red-500" />
                      Êtes-vous absolument sûr ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action supprimera définitivement :
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Votre compte utilisateur</li>
                        <li>Les dossiers médicaux de vos enfants</li>
                        <li>Tous les documents uploadés</li>
                        <li>L'historique des notifications</li>
                        <li>Les logs de connexion</li>
                      </ul>
                      <p className="mt-4 font-semibold text-red-600">
                        Cette action est irréversible. Vos données ne pourront pas être récupérées.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleting ? 'Suppression...' : 'Supprimer définitivement'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact DPO */}
      <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Besoin d'aide ?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <IoDocumentTextOutline className="text-2xl text-slate-500 dark:text-zinc-400 flex-shrink-0" />
            <div className="text-sm text-slate-700 dark:text-zinc-300">
              <p className="mb-2">
                Pour toute question concernant vos données personnelles ou l'exercice de vos
                droits, contactez notre Délégué à la Protection des Données (DPO) :
              </p>
              <p className="font-medium">dpo@kidsmed-ia.fr</p>
              <p className="text-slate-600 dark:text-zinc-400 mt-2">Réponse sous 30 jours maximum</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-slate-200/80 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-bold text-violet-600 dark:text-violet-400">Kids'Med IA</span>
            <span>•</span>
            <span>© 2026 Tous droits réservés</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400">
            <a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Aide</a>
            <a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Confidentialité</a>
          </div>
        </div>
      </footer>
      </motion.div>
    </AppBackground>
  );
};
