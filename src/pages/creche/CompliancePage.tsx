import React, { useState, useMemo, useEffect } from 'react';
import {
  IoCheckmarkCircle,
  IoAlertCircle,
  IoWarningOutline,
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoMailOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoTimeOutline,
  IoEllipsisVertical,
  IoChevronForward,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoRefreshOutline,
  IoShieldCheckmarkOutline,
  IoReloadOutline,
  IoCloudUploadOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import type { TypeDocument, Document, StatutDocument } from '@/types';
import { calculateDocumentStatus } from '@/utils/documentHelpers';
import { DemanderDocumentModal } from '@/components/modals/DemanderDocumentModal';
import { ValiderDocumentModal } from '@/components/modals/ValiderDocumentModal';
import { RejeterDocumentModal } from '@/components/modals/RejeterDocumentModal';
import { motion } from 'framer-motion';
import { enfantApi, documentApi, documentObligatoireApi } from '@/services/api';

const DEFAULT_ETABLISSEMENT_ID = 'test-creche-001';

const DOCUMENTS_OBLIGATOIRES: { id: TypeDocument; label: string; short: string }[] = [
  { id: 'certificat_medical', label: 'Certificat Médical', short: 'Cert. Médical' },
  { id: 'attestation_rc', label: 'Attestation RC', short: 'RC Parents' },
  { id: 'justificatif_domicile', label: 'Justificatif Domicile', short: 'Domicile' },
  { id: 'fiche_urgence', label: 'Fiche D\'urgence', short: 'Urgence' },
  { id: 'carnet_vaccination', label: 'Carnet Vaccination', short: 'Vaccins' },
  { id: 'contrat_accueil', label: 'Contrat d\'accueil', short: 'Contrat' },
];

const getActualStatus = (doc: Document | null): StatutDocument => {
  if (!doc) return 'manquant';
  return calculateDocumentStatus(doc);
};

export const CompliancePage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'warning' | 'missing'>('all');
  const [isDemanderModalOpen, setIsDemanderModalOpen] = useState(false);
  const [isValiderModalOpen, setIsValiderModalOpen] = useState(false);
  const [isRejeterModalOpen, setIsRejeterModalOpen] = useState(false);
  const [selectedEnfantId, setSelectedEnfantId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    enfantId: '',
    type: 'certificat_medical' as TypeDocument,
    nom: '',
    fichierUrl: '',
    commentaire: '',
    dateExpiration: '',
  });

  // Backend state
  const [enfants, setEnfants] = useState<any[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsObligatoiresPersonnalises, setDocumentsObligatoiresPersonnalises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load enfants
      const enfantsResponse = await enfantApi.getEnfantsByEtablissement(DEFAULT_ETABLISSEMENT_ID);
      const enfantsData = enfantsResponse.data || [];
      setEnfants(enfantsData);

      // Load documents for all enfants
      const allDocuments: Document[] = [];
      for (const enfant of enfantsData) {
        try {
          const docsResponse = await documentApi.getDocumentsByEnfant(enfant.id);
          allDocuments.push(...(docsResponse.data || []));
        } catch (err) {
          console.error(`Erreur chargement documents pour enfant ${enfant.id}:`, err);
        }
      }
      setDocuments(allDocuments);

      // Load documents obligatoires personnalisés
      try {
        const docsObligatoiresResponse = await documentObligatoireApi.getDocumentsObligatoiresByEtablissement(DEFAULT_ETABLISSEMENT_ID);
        setDocumentsObligatoiresPersonnalises(docsObligatoiresResponse.data || []);
      } catch (err) {
        console.error('Erreur chargement documents obligatoires personnalisés:', err);
      }
    } catch (err: any) {
      console.error('❌ Erreur chargement données compliance:', err);
      setError(err.response?.data?.error || 'Erreur de chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentForEnfant = (enfantId: string, docType: TypeDocument): Document | null => {
    return documents.find(d => d.enfantId === enfantId && d.type === docType) || null;
  };

  // Combiner documents obligatoires par défaut et personnalisés
  const allDocumentsObligatoires = useMemo(() => {
    const docsPersonnalises = documentsObligatoiresPersonnalises.map((doc) => ({
      id: doc.typeDocument as TypeDocument,
      label: doc.nom,
      short: doc.nom.substring(0, 12),
      isCustom: true,
      customId: doc.id,
    }));

    // Filter out custom documents that have the same ID as default ones
    const uniqueDocsPersonnalises = docsPersonnalises.filter(
      (customDoc) => !DOCUMENTS_OBLIGATOIRES.some((defaultDoc) => defaultDoc.id === customDoc.id)
    );

    return [...DOCUMENTS_OBLIGATOIRES, ...uniqueDocsPersonnalises];
  }, [documentsObligatoiresPersonnalises]);

  // Global calculations using real document data
  const stats = useMemo(() => {
    let valide = 0;
    let alerte = 0;
    let manquant = 0;
    const total = enfants.length * allDocumentsObligatoires.length;

    enfants.forEach((e) => {
      allDocumentsObligatoires.forEach((docType) => {
        const doc = getDocumentForEnfant(e.id, docType.id);
        const status = getActualStatus(doc);

        if (status === 'valide') valide++;
        else if (status === 'expire_bientot' || status === 'expire') alerte++;
        else if (status === 'manquant' || status === 'en_attente') manquant++;
      });
    });

    const rate = total > 0 ? Math.round((valide / total) * 100) : 0;
    return { valide, alerte, manquant, total, rate };
  }, [enfants, allDocumentsObligatoires]);

  // Filter children using real document data
  const filteredEnfants = useMemo(() => {
    return enfants.filter((e) => {
      const matchName = `${e.prenom} ${e.nom}`.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchName) return false;

      if (filterStatus === 'all') return true;

      const statuses = allDocumentsObligatoires.map((docType) => {
        const doc = getDocumentForEnfant(e.id, docType.id);
        return getActualStatus(doc);
      });

      if (filterStatus === 'warning') return statuses.some((s) => s === 'expire_bientot' || s === 'expire');
      if (filterStatus === 'missing') return statuses.some((s) => s === 'manquant' || s === 'en_attente');

      return true;
    });
  }, [enfants, searchQuery, filterStatus, allDocumentsObligatoires]);

  // Handler functions for modals
  const handleDemander = (enfantId: string, docType: TypeDocument) => {
    // Ouvrir directement la modal d'upload avec les infos pré-remplies
    const enfant = enfants.find(e => e.id === enfantId);
    const docLabel = allDocumentsObligatoires.find((d: any) => d.id === docType)?.label || '';
    const nomAutoRempli = `${docLabel} - ${enfant?.prenom || ''} ${enfant?.nom || ''}`;

    setUploadForm({
      ...uploadForm,
      enfantId: enfantId,
      type: docType,
      nom: nomAutoRempli,
    });
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
  };

  const handleRelancer = async (documentId: string) => {
    try {
      await documentApi.relancerDocument(documentId);
      console.log('✅ Relance envoyée pour document:', documentId);
      // Refresh data
      await loadData();
    } catch (err: any) {
      console.error('❌ Erreur relance document:', err);
      alert(err.response?.data?.error || 'Erreur lors de la relance');
    }
  };

  const handleModalClose = async () => {
    // Refresh data after modal actions
    await loadData();
    setIsDemanderModalOpen(false);
    setIsValiderModalOpen(false);
    setIsRejeterModalOpen(false);
    setSelectedEnfantId(null);
    setSelectedDocument(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-16 text-center space-y-4 max-w-md mx-auto mt-20">
        <IoReloadOutline className="h-12 w-12 text-teal-500 mx-auto animate-spin" />
        <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
          Chargement de la conformité documentaire...
        </p>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Vérification des documents obligatoires
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-16 text-center space-y-4 max-w-md mx-auto mt-20">
        <IoAlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
          Erreur de chargement
        </p>
        <p className="text-xs text-slate-500 dark:text-zinc-400">{error}</p>
        <Button onClick={loadData} className="mt-4">
          <IoRefreshOutline className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 sm:p-8 space-y-8 bg-gradient-to-br from-slate-50 via-teal-50/20 to-indigo-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 font-sans antialiased"
    >

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Conformité & Registre Documentaire</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 shadow-xs">
              <IoShieldCheckmarkOutline className="h-3.5 w-3.5" />
              PMI Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">
            Contrôle d'audit réglementaire et suivi automatique des pièces obligatoires.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="h-10 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 hover:bg-teal-50 hover:text-teal-600 transition-all cursor-pointer shadow-xs"
          >
            <IoCloudUploadOutline className="h-4 w-4 mr-1.5" />
            Téléverser un document
          </Button>
          <Button variant="outline" size="sm" className="h-10 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 hover:bg-teal-50 hover:text-teal-600 transition-all cursor-pointer shadow-xs">
            <IoDownloadOutline className="h-4 w-4 mr-1.5 text-slate-500" />
            Rapport d'audit PDF
          </Button>
          <Button size="sm" className="h-10 text-xs font-bold rounded-2xl bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-md cursor-pointer">
            <IoMailOutline className="h-4 w-4 mr-1.5" />
            Relancer tout ({stats.alerte + stats.manquant})
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Score de conformité</span>
              <span className="text-[10px] font-mono font-extrabold text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-lg border border-teal-200/60 dark:border-teal-800">
                +2.4% ce mois
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight">{stats.rate}%</span>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold">({stats.valide}/{stats.total})</span>
            </div>
            <div className="mt-3 h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-teal-600 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${stats.rate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Documents valides</span>
              <IoCheckmarkCircle className="h-5 w-5 text-teal-500" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black tracking-tight text-teal-600 dark:text-teal-400">{stats.valide}</span>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 font-medium">Dossiers conformes et validés</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Expirations imminentes</span>
              <IoWarningOutline className="h-5 w-5 text-amber-500" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black tracking-tight text-amber-600 dark:text-amber-400">{stats.alerte}</span>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 font-medium">Expire sous 30 jours</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Pièces manquantes</span>
              <IoAlertCircle className="h-5 w-5 text-rose-500" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black tracking-tight text-rose-600 dark:text-rose-400">{stats.manquant}</span>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 font-medium">Action requise immédiatement</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar & Matrix Table */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md overflow-hidden">
        
        {/* Filters */}
        <div className="p-5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrer par enfant..."
              className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:border-teal-500 transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl border border-slate-200/80 dark:border-zinc-700">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterStatus('warning')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'warning'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              En alerte ({stats.alerte})
            </button>
            <button
              onClick={() => setFilterStatus('missing')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'missing'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Manquants ({stats.manquant})
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200/80 dark:border-zinc-800 hover:bg-transparent">
                <TableHead className="w-[200px] text-xs font-extrabold text-slate-500 dark:text-zinc-400 pl-5">Enfant</TableHead>
                {allDocumentsObligatoires.map((doc: any) => (
                  <TableHead key={doc.id} className="text-center text-xs font-extrabold text-slate-500 dark:text-zinc-400">
                    <span className={doc.isCustom ? 'text-teal-600 dark:text-teal-400' : ''}>
                      {doc.short}
                    </span>
                  </TableHead>
                ))}
                <TableHead className="text-right text-xs font-extrabold text-slate-500 dark:text-zinc-400 pr-5">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnfants.map((enfant) => (
                <TableRow key={enfant.id} className="border-slate-200/60 dark:border-zinc-800/60 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  
                  {/* Child Profile */}
                  <TableCell className="py-4 pl-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-2xl border border-teal-500/20 shadow-xs">
                        <AvatarImage src={enfant.photo} alt={enfant.prenom} />
                        <AvatarFallback className="text-xs font-extrabold bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200">
                          {enfant.prenom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 leading-tight">
                          {enfant.prenom} {enfant.nom}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 font-bold">
                          {enfant.dateNaissance
                            ? Math.floor((new Date().getTime() - new Date(enfant.dateNaissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                            : 0} ans
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Document Status Cells with Real Data */}
                  {allDocumentsObligatoires.map((docType: any) => {
                    const doc = getDocumentForEnfant(enfant.id, docType.id);
                    const status = getActualStatus(doc);

                    return (
                      <TableCell key={docType.id} className="text-center py-4">
                        <div className="inline-flex flex-col items-center gap-1.5">
                          {/* Status Badge */}
                          {status === 'valide' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/40 px-2.5 py-1 rounded-xl shadow-xs">
                              <IoCheckmarkCircle className="h-3 w-3" />
                              Valide
                            </span>
                          )}

                          {status === 'expire_bientot' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-2.5 py-1 rounded-xl shadow-xs">
                              <IoTimeOutline className="h-3 w-3" />
                              {doc?.dateExpiration ? format(new Date(doc.dateExpiration), 'dd/MM', { locale: fr }) : 'Proche'}
                            </span>
                          )}

                          {status === 'expire' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 px-2.5 py-1 rounded-xl shadow-xs">
                              <IoAlertCircle className="h-3 w-3" />
                              Expiré
                            </span>
                          )}

                          {status === 'en_attente' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 px-2.5 py-1 rounded-xl shadow-xs">
                              En attente
                            </span>
                          )}

                          {status === 'soumis' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/40 px-2.5 py-1 rounded-xl shadow-xs">
                              À valider
                            </span>
                          )}

                          {status === 'rejete' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 px-2.5 py-1 rounded-xl shadow-xs">
                              Refusé
                            </span>
                          )}

                          {status === 'manquant' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-xl">
                              Manquant
                            </span>
                          )}

                          {/* Action Buttons based on status */}
                          <div className="flex gap-1 pt-1">
                            {status === 'manquant' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDemander(enfant.id, docType.id)}
                                className="h-6 text-[10px] font-bold px-2 rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer shadow-xs"
                                title={`Téléverser ${docType.label} pour ${enfant.prenom} ${enfant.nom}`}
                              >
                                <IoCloudUploadOutline className="h-3 w-3" />
                              </Button>
                            )}

                            {status === 'soumis' && doc && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleValider(doc)}
                                  className="h-6 text-[10px] font-bold px-2 bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700 rounded-xl cursor-pointer shadow-xs"
                                >
                                  <IoCheckmarkOutline className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejeter(doc)}
                                  className="h-6 text-[10px] font-bold px-2 bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700 rounded-xl cursor-pointer shadow-xs"
                                >
                                  <IoCloseOutline className="h-3 w-3" />
                                </Button>
                              </>
                            )}

                            {(status === 'expire_bientot' || status === 'expire') && doc && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRelancer(doc.id)}
                                className="h-6 text-[10px] font-bold px-2 rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer shadow-xs"
                              >
                                <IoRefreshOutline className="h-3 w-3" />
                              </Button>
                            )}

                            {status === 'valide' && doc?.fichierUrl && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDownload(doc.fichierUrl!)}
                                className="h-6 text-[10px] font-bold px-2 rounded-xl hover:bg-teal-50 hover:text-teal-600 cursor-pointer"
                              >
                                <IoDownloadOutline className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    );
                  })}

                  {/* Actions */}
                  <TableCell className="text-right py-4 pr-5">
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-bold px-3 text-slate-600 dark:text-zinc-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl cursor-pointer">
                      Relancer
                    </Button>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Compliance Advisory Notice */}
      <div className="p-6 rounded-3xl bg-slate-900 dark:bg-zinc-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xl border border-slate-800">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
            <IoDocumentTextOutline className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold tracking-tight">Protocole d'Inspection PMI</h4>
            <p className="text-xs text-slate-400 dark:text-zinc-400 font-medium leading-relaxed">
              {stats.manquant + stats.alerte} anomalies identifiées. La relance automatique transmettra un lien d'versement sécurisé directement sur l'application parentale.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-10 text-xs font-bold rounded-2xl border-slate-700 bg-slate-800 text-slate-200 hover:bg-teal-600 hover:text-white hover:border-teal-600 shrink-0 transition-all cursor-pointer shadow-xs">
          En savoir plus
        </Button>
      </div>

      {/* Modals */}
      {user && selectedEnfantId && (
        <DemanderDocumentModal
          isOpen={isDemanderModalOpen}
          onClose={handleModalClose}
          enfantId={selectedEnfantId}
          userId={user.id}
          userRole={user.role as 'creche' | 'rsai' | 'superadmin'}
        />
      )}

      {user && selectedDocument && (
        <>
          <ValiderDocumentModal
            isOpen={isValiderModalOpen}
            onClose={handleModalClose}
            document={selectedDocument}
            userId={user.id}
            userRole={user.role as 'creche' | 'rsai' | 'superadmin'}
          />

          <RejeterDocumentModal
            isOpen={isRejeterModalOpen}
            onClose={handleModalClose}
            document={selectedDocument}
            userId={user.id}
            userRole={user.role as 'creche' | 'rsai' | 'superadmin'}
          />
        </>
      )}

      {/* Modal d'upload direct de document */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full shadow-2xl my-8 max-h-[90vh] flex flex-col"
          >
            <div className="p-5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 border border-teal-200 dark:border-teal-800">
                  <IoCloudUploadOutline className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-black tracking-tight">Téléverser un document</h3>
              </div>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedFile(null);
                  // Réinitialiser le formulaire
                  setUploadForm({
                    enfantId: '',
                    type: 'certificat_medical' as TypeDocument,
                    nom: '',
                    fichierUrl: '',
                    commentaire: '',
                    dateExpiration: '',
                  });
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <IoCloseOutline className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {uploadForm.enfantId && uploadForm.type ? (
                <div className="p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl">
                  <p className="text-xs text-teal-700 dark:text-teal-400 font-bold">
                    ⚡ Upload rapide : {allDocumentsObligatoires.find((d: any) => d.id === uploadForm.type)?.label} pour {enfants.find(e => e.id === uploadForm.enfantId)?.prenom}
                  </p>
                  <p className="text-[10px] text-teal-600 dark:text-teal-500 mt-1">
                    Les champs sont pré-remplis, il suffit de téléverser le fichier!
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl">
                  <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                    📋 Téléversez directement un document pour un enfant. Le document sera automatiquement ajouté à son dossier.
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="enfantSelect" className="font-bold text-slate-700 dark:text-zinc-300">
                  Enfant {uploadForm.enfantId && <span className="text-teal-600 text-[10px]">(pré-sélectionné)</span>}
                </Label>
                <Select
                  key={`enfant-${uploadForm.enfantId}`}
                  value={uploadForm.enfantId}
                  onValueChange={(value) => setUploadForm({ ...uploadForm, enfantId: value })}
                >
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue placeholder="Sélectionner un enfant">
                      {uploadForm.enfantId && enfants.find(e => e.id === uploadForm.enfantId)
                        ? `${enfants.find(e => e.id === uploadForm.enfantId)?.prenom} ${enfants.find(e => e.id === uploadForm.enfantId)?.nom}`
                        : "Sélectionner un enfant"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {enfants.map((enfant) => (
                      <SelectItem key={enfant.id} value={enfant.id}>
                        {enfant.prenom} {enfant.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="docTypeSelect" className="font-bold text-slate-700 dark:text-zinc-300">
                  Type de document {uploadForm.type && <span className="text-teal-600 text-[10px]">(pré-sélectionné)</span>}
                </Label>
                <Select
                  key={`doctype-${uploadForm.type}`}
                  value={uploadForm.type}
                  onValueChange={(value: TypeDocument) => setUploadForm({ ...uploadForm, type: value })}
                >
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue placeholder="Sélectionner un type">
                      {(() => {
                        const selectedDoc = allDocumentsObligatoires.find((d: any) => d.id === uploadForm.type);
                        if (uploadForm.type && selectedDoc) {
                          return `${selectedDoc.label}${(selectedDoc as any).isCustom ? ' (Personnalisé)' : ''}`;
                        }
                        return "Sélectionner un type";
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {allDocumentsObligatoires.map((doc: any) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.label} {doc.isCustom && '(Personnalisé)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="docNomUpload" className="font-bold text-slate-700 dark:text-zinc-300">Nom du document</Label>
                <Input
                  id="docNomUpload"
                  value={uploadForm.nom}
                  onChange={(e) => setUploadForm({ ...uploadForm, nom: e.target.value })}
                  placeholder="ex: Certificat médical 2024"
                  className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="docFileUpload" className="font-bold text-slate-700 dark:text-zinc-300">Fichier</Label>
                <label htmlFor="docFileUpload" className="block">
                  <div className="border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-2xl p-6 text-center hover:border-teal-400 dark:hover:border-teal-600 transition-colors cursor-pointer">
                    <IoCloudUploadOutline className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                    {selectedFile ? (
                      <div>
                        <p className="text-xs font-bold text-teal-600 dark:text-teal-400">
                          ✓ {selectedFile.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                          Cliquez pour téléverser ou glissez-déposez
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                          PDF, JPG, PNG (max. 10MB)
                        </p>
                      </div>
                    )}
                    <input
                      id="docFileUpload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                </label>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="docDateExpiration" className="font-bold text-slate-700 dark:text-zinc-300">
                  Date d'expiration (optionnel)
                </Label>
                <Input
                  id="docDateExpiration"
                  type="date"
                  value={uploadForm.dateExpiration}
                  onChange={(e) => setUploadForm({ ...uploadForm, dateExpiration: e.target.value })}
                  className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs"
                />
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                  Certains documents expirent après une période (ex: certificat médical, vaccins)
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="docCommentaireUpload" className="font-bold text-slate-700 dark:text-zinc-300">Commentaire (optionnel)</Label>
                <Textarea
                  id="docCommentaireUpload"
                  value={uploadForm.commentaire}
                  onChange={(e) => setUploadForm({ ...uploadForm, commentaire: e.target.value })}
                  placeholder="Notes ou précisions sur le document..."
                  className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs text-xs min-h-[80px]"
                />
              </div>
            </div>

            {/* Footer avec boutons - fixe en bas */}
            <div className="p-4 border-t border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedFile(null);
                  setUploadForm({
                    enfantId: '',
                    type: 'certificat_medical' as TypeDocument,
                    nom: '',
                    fichierUrl: '',
                    commentaire: '',
                    dateExpiration: '',
                  });
                }}
                disabled={uploadingDoc}
                className="h-10 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="button"
                disabled={uploadingDoc || !uploadForm.enfantId || !uploadForm.nom || !selectedFile}
                className="h-10 text-xs font-bold rounded-2xl bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-md"
                onClick={async () => {
                  if (!selectedFile) return;

                  setUploadingDoc(true);
                  try {
                    await documentApi.uploadDirectDocument({
                      enfantId: uploadForm.enfantId,
                      type: uploadForm.type,
                      nom: uploadForm.nom,
                      file: selectedFile,
                      dateExpiration: uploadForm.dateExpiration || undefined,
                    });

                    alert('Document téléversé avec succès!');
                    setIsUploadModalOpen(false);
                    setSelectedFile(null);
                    setUploadForm({
                      enfantId: '',
                      type: 'certificat_medical' as TypeDocument,
                      nom: '',
                      fichierUrl: '',
                      commentaire: '',
                      dateExpiration: '',
                    });
                    await loadData();
                  } catch (err: any) {
                    console.error('Erreur upload:', err);
                    alert(err.response?.data?.error || 'Erreur lors du téléversement');
                  } finally {
                    setUploadingDoc(false);
                  }
                }}
              >
                {uploadingDoc ? 'Téléversement...' : 'Téléverser'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};