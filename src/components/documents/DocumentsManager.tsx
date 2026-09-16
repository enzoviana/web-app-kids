import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoRemoveCircleOutline,
  IoHourglassOutline,
  IoDocumentOutline,
  IoCloseCircleOutline,
  IoDownloadOutline,
  IoAddOutline,
  IoCloudUploadOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoRefreshOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
} from 'react-icons/io5';
import type { UserRole, Document, StatutDocument } from '@/types';
import { documentApi } from '@/services/api';
import { calculateDocumentStatus, canValidateDocument, canUploadDocument, getDocumentTypeLabel } from '@/utils/documentHelpers';
import { DemanderDocumentModal } from '@/components/modals/DemanderDocumentModal';
import { UploadDocumentModal } from '@/components/modals/UploadDocumentModal';
import { RejeterDocumentModal } from '@/components/modals/RejeterDocumentModal';
import { ValiderDocumentModal } from '@/components/modals/ValiderDocumentModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DocumentsManagerProps {
  enfantId: string;
  userRole: UserRole;
  userId: string;
}

const statusBadges: Record<StatutDocument, { color: string; icon: React.ComponentType<any>; label: string }> = {
  valide: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40', icon: IoCheckmarkCircleOutline, label: 'Validé' },
  expire_bientot: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/40', icon: IoTimeOutline, label: 'Expire bientôt' },
  expire: { color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/40', icon: IoAlertCircleOutline, label: 'Expiré' },
  manquant: { color: 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200 dark:border-zinc-700', icon: IoRemoveCircleOutline, label: 'Manquant' },
  en_attente: { color: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-400 border-sky-200 dark:border-sky-900/40', icon: IoHourglassOutline, label: 'En attente' },
  soumis: { color: 'bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-400 border-violet-200 dark:border-violet-900/40', icon: IoDocumentOutline, label: 'À valider' },
  rejete: { color: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-900/40', icon: IoCloseCircleOutline, label: 'Refusé' },
};

export const DocumentsManager: React.FC<DocumentsManagerProps> = ({
  enfantId,
  userRole,
  userId,
}) => {
  const [isDemanderModalOpen, setIsDemanderModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isRejeterModalOpen, setIsRejeterModalOpen] = useState(false);
  const [isValiderModalOpen, setIsValiderModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [expandedDocuments, setExpandedDocuments] = useState<Set<string>>(new Set());
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await documentApi.getDocumentsByEnfant(enfantId);
      const docs = (response.data || []).map((doc: any) => ({
        ...doc,
        currentStatus: calculateDocumentStatus(doc),
      }));
      setDocuments(docs);
    } catch (error) {
      console.error('Erreur chargement documents:', error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [enfantId]);

  const toggleExpanded = (documentId: string) => {
    const newExpanded = new Set(expandedDocuments);
    if (newExpanded.has(documentId)) {
      newExpanded.delete(documentId);
    } else {
      newExpanded.add(documentId);
    }
    setExpandedDocuments(newExpanded);
  };

  const handleDemander = () => {
    setIsDemanderModalOpen(true);
  };

  const handleUpload = (doc: Document) => {
    setSelectedDocument(doc);
    setIsUploadModalOpen(true);
  };

  const handleValider = (doc: Document) => {
    setSelectedDocument(doc);
    setIsValiderModalOpen(true);
  };

  const handleRejeter = (doc: Document) => {
    setSelectedDocument(doc);
    setIsRejeterModalOpen(true);
  };

  const handleDownload = (url: string) => {
    console.log('📥 Téléchargement simulé:', url);
    // Dans une vraie application, cela déclencherait le téléchargement
  };

  const canManage = canValidateDocument(userRole);
  const isParent = canUploadDocument(userRole);

  return (
    <div className="space-y-6">
      {/* Header avec bouton "Demander un document" */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
            Documents
          </h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            {documents.length} document{documents.length > 1 ? 's' : ''} au dossier
          </p>
        </div>
        <div className="flex gap-2">
          {canManage && (
            <Button
              size="sm"
              onClick={handleDemander}
              variant="outline"
              className="gap-1"
            >
              <IoAddOutline className="h-4 w-4" />
              Demander
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => loadDocuments()}
            className="gap-1 bg-teal-600 hover:bg-teal-700"
          >
            <IoRefreshOutline className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Liste des documents */}
      <Card className="border-slate-200 dark:border-zinc-800">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <IoRefreshOutline className="h-8 w-8 text-teal-500 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                Chargement des documents...
              </p>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-8 text-center">
              <IoDocumentOutline className="h-12 w-12 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                Aucun document au dossier
              </p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2">
                Les documents téléversés apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-zinc-800">
              {documents.map((doc) => {
                const StatusIcon = statusBadges[doc.currentStatus].icon;
                const isExpanded = expandedDocuments.has(doc.id);

                return (
                  <div key={doc.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      {/* Info document */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                            {getDocumentTypeLabel(doc.type)}
                          </h4>
                          {doc.obligatoire && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              Obligatoire
                            </Badge>
                          )}
                        </div>

                        {doc.nom && (
                          <p className="text-xs text-slate-600 dark:text-zinc-400 mb-1 truncate">
                            {doc.nom}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
                          {doc.dateUpload && (
                            <span>Uploadé le {format(new Date(doc.dateUpload), 'dd/MM/yyyy', { locale: fr })}</span>
                          )}
                          {doc.dateExpiration && (
                            <span>Expire le {format(new Date(doc.dateExpiration), 'dd/MM/yyyy', { locale: fr })}</span>
                          )}
                          {doc.dateValidation && (
                            <span>Validé le {format(new Date(doc.dateValidation), 'dd/MM/yyyy', { locale: fr })}</span>
                          )}
                        </div>

                        {doc.commentaire && (
                          <div className="mt-2 p-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded text-xs text-slate-700 dark:text-zinc-300">
                            <span className="font-medium">Commentaire : </span>
                            {doc.commentaire}
                          </div>
                        )}
                      </div>

                      {/* Statut et actions */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge className={`${statusBadges[doc.currentStatus].color} border flex items-center gap-1 text-[11px] font-medium px-2 py-0.5`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusBadges[doc.currentStatus].label}
                        </Badge>

                        {/* Actions selon le rôle et le statut */}
                        <div className="flex gap-1">
                          {/* Actions Crèche/RSAI/SuperAdmin */}
                          {canManage && (
                            <>
                              {doc.currentStatus === 'soumis' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleValider(doc)}
                                    className="h-7 text-xs px-2"
                                  >
                                    <IoCheckmarkOutline className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="error"
                                    onClick={() => handleRejeter(doc)}
                                    className="h-7 text-xs px-2"
                                  >
                                    <IoCloseOutline className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                              {(doc.currentStatus === 'expire_bientot' || doc.currentStatus === 'expire') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => console.log('Relance')}
                                  className="h-7 text-xs px-2"
                                >
                                  <IoRefreshOutline className="h-3 w-3" />
                                  Relancer
                                </Button>
                              )}
                            </>
                          )}

                          {/* Actions Parent */}
                          {isParent && (doc.currentStatus === 'en_attente' || doc.currentStatus === 'rejete') && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleUpload(doc)}
                              className="h-7 text-xs px-2 gap-1"
                            >
                              <IoCloudUploadOutline className="h-3 w-3" />
                              Upload
                            </Button>
                          )}

                          {/* Télécharger (tous) */}
                          {doc.fichierUrl && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownload(doc.fichierUrl!)}
                              className="h-7 text-xs px-2"
                            >
                              <IoDownloadOutline className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {canManage && (
        <DemanderDocumentModal
          isOpen={isDemanderModalOpen}
          onClose={() => setIsDemanderModalOpen(false)}
          enfantId={enfantId}
          userId={userId}
          userRole={userRole as 'creche' | 'rsai' | 'superadmin'}
        />
      )}

      {isParent && selectedDocument && (
        <UploadDocumentModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
          userId={userId}
        />
      )}

      {canManage && selectedDocument && (
        <>
          <ValiderDocumentModal
            isOpen={isValiderModalOpen}
            onClose={() => {
              setIsValiderModalOpen(false);
              setSelectedDocument(null);
            }}
            document={selectedDocument}
            userId={userId}
            userRole={userRole as 'creche' | 'rsai' | 'superadmin'}
          />

          <RejeterDocumentModal
            isOpen={isRejeterModalOpen}
            onClose={() => {
              setIsRejeterModalOpen(false);
              setSelectedDocument(null);
            }}
            document={selectedDocument}
            userId={userId}
            userRole={userRole as 'creche' | 'rsai' | 'superadmin'}
          />
        </>
      )}
    </div>
  );
};
