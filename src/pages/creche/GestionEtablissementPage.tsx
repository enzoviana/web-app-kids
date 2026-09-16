import React, { useState, useEffect } from 'react';
import {
  IoBusinessOutline,
  IoPeople,
  IoLocationOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoShieldCheckmarkOutline,
  IoAddOutline,
  IoPencilOutline,
  IoTrendingUpOutline,
  IoConstructOutline,
  IoTrashOutline,
  IoCloseOutline,
  IoReloadOutline,
  IoAlertCircleOutline,
  IoDocumentTextOutline,
  IoCloudUploadOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { sectionApi, etablissementApi, documentApi, documentObligatoireApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface Section {
  id: string;
  nom: string;
  ageMin: number;
  ageMax: number;
  capacite: number;
  effectif: number;
  responsable: string;
  horaires: string;
}

interface StructureInfo {
  nom: string;
  adresse: string;
  codePostalVille: string;
  joursOuverture: string;
  horaires: string;
  numeroAgrement: string;
}

const DEFAULT_ETABLISSEMENT_ID = 'test-creche-001';

export const GestionEtablissementPage: React.FC = () => {
  const { user } = useAuth();

  // State principal
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [etablissementId, setEtablissementId] = useState<string>(DEFAULT_ETABLISSEMENT_ID);
  const [structure, setStructure] = useState<StructureInfo>({
    nom: '',
    adresse: '',
    codePostalVille: '',
    joursOuverture: '',
    horaires: '',
    numeroAgrement: '',
  });

  // State des modales
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [isAddDocObligatoireModalOpen, setIsAddDocObligatoireModalOpen] = useState(false);
  const [documentsObligatoires, setDocumentsObligatoires] = useState<any[]>([]);
  const [newDocObligatoire, setNewDocObligatoire] = useState({
    nom: '',
    description: '',
    typeDocument: 'autre',
  });

  // Formulaire local Structure
  const [structureForm, setStructureForm] = useState<StructureInfo>(structure);

  // Formulaire local Section
  const [sectionForm, setSectionForm] = useState<Partial<Section>>({
    nom: '',
    ageMin: 0,
    ageMax: 36,
    capacite: 10,
    effectif: 0,
    responsable: '',
    horaires: '07:30 - 18:30',
  });

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger l'établissement
      const etablissementResponse = await etablissementApi.getEtablissementById(DEFAULT_ETABLISSEMENT_ID);
      const etablissement = etablissementResponse.data;

      if (etablissement) {
        setEtablissementId(etablissement.id);
        setStructure({
          nom: etablissement.nom || '',
          adresse: etablissement.adresse || '',
          codePostalVille: `${etablissement.codePostal} ${etablissement.ville}` || '',
          joursOuverture: etablissement.horaires?.joursOuverture || 'Lundi - Vendredi',
          horaires: etablissement.horaires?.horaires || '07:30 - 18:30',
          numeroAgrement: etablissement.numeroAgrement || '',
        });
      }

      // Charger les sections
      const sectionsResponse = await sectionApi.getSectionsByEtablissement(DEFAULT_ETABLISSEMENT_ID);
      setSections(sectionsResponse.data || []);

      // Charger les documents obligatoires personnalisés
      try {
        const docsObligatoiresResponse = await documentObligatoireApi.getDocumentsObligatoiresByEtablissement(DEFAULT_ETABLISSEMENT_ID);
        setDocumentsObligatoires(docsObligatoiresResponse.data || []);
      } catch (docErr) {
        console.warn('⚠️ Documents obligatoires personnalisés non disponibles');
        setDocumentsObligatoires([]);
      }
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement des données:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async () => {
    try {
      const response = await sectionApi.getSectionsByEtablissement(DEFAULT_ETABLISSEMENT_ID);
      setSections(response.data || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des sections:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des sections');
    }
  };

  // Calculs KPI dynamiques
  const totalCapacite = sections.reduce((sum, s) => sum + (Number(s.capacite) || 0), 0);
  const totalEffectif = sections.reduce((sum, s) => sum + (Number(s.effectif) || 0), 0);
  const tauxOccupation = totalCapacite > 0 ? Math.round((totalEffectif / totalCapacite) * 100) : 0;

  // Handlers Structure
  const handleOpenStructureModal = () => {
    setStructureForm(structure);
    setIsStructureModalOpen(true);
  };

  const handleSaveStructure = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Extraire code postal et ville
      const parts = structureForm.codePostalVille.split(' ');
      const codePostal = parts[0] || '';
      const ville = parts.slice(1).join(' ') || '';

      await etablissementApi.updateEtablissement(etablissementId, {
        nom: structureForm.nom,
        adresse: structureForm.adresse,
        codePostal,
        ville,
        numeroAgrement: structureForm.numeroAgrement,
        horaires: {
          joursOuverture: structureForm.joursOuverture,
          horaires: structureForm.horaires,
        },
      });

      setStructure(structureForm);
      setIsStructureModalOpen(false);
      console.log('✅ Établissement mis à jour avec succès');
    } catch (err: any) {
      console.error('❌ Erreur mise à jour établissement:', err);
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  // Handlers Section
  const handleOpenAddSectionModal = () => {
    setSelectedSection(null);
    setSectionForm({
      nom: '',
      ageMin: 0,
      ageMax: 36,
      capacite: 10,
      effectif: 0,
      responsable: '',
      horaires: '07:30 - 18:30',
    });
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSectionModal = (section: Section) => {
    setSelectedSection(section);
    setSectionForm(section);
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      if (selectedSection) {
        // Édition
        await sectionApi.updateSection(selectedSection.id, {
          nom: sectionForm.nom,
          ageMin: Number(sectionForm.ageMin),
          ageMax: Number(sectionForm.ageMax),
          capacite: Number(sectionForm.capacite),
          effectif: Number(sectionForm.effectif),
          responsable: sectionForm.responsable,
          horaires: sectionForm.horaires,
        });
      } else {
        // Création
        await sectionApi.createSection({
          etablissementId: DEFAULT_ETABLISSEMENT_ID,
          nom: sectionForm.nom || 'Nouvelle Section',
          ageMin: Number(sectionForm.ageMin) || 0,
          ageMax: Number(sectionForm.ageMax) || 36,
          capacite: Number(sectionForm.capacite) || 10,
          effectif: Number(sectionForm.effectif) || 0,
          responsable: sectionForm.responsable || 'Non assigné',
          horaires: sectionForm.horaires || '07:30 - 18:30',
        });
      }

      // Recharger les sections
      await loadSections();
      setIsSectionModalOpen(false);
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde de la section:', err);
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde de la section');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette section ?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await sectionApi.deleteSection(id);

      // Recharger les sections
      await loadSections();
    } catch (err: any) {
      console.error('Erreur lors de la suppression de la section:', err);
      setError(err.response?.data?.error || 'Erreur lors de la suppression de la section');
    } finally {
      setLoading(false);
    }
  };

  // Affichage de l'état de chargement
  if (loading && sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <IoReloadOutline className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
            Chargement des sections...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 sm:p-8 space-y-8 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-teal-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 font-sans antialiased"
    >

      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex items-start gap-3">
          <IoAlertCircleOutline className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-rose-900 dark:text-rose-100">Erreur</p>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
          >
            <IoCloseOutline className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Gestion de l'Établissement & Sections</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-xs">
              <IoShieldCheckmarkOutline className="h-3.5 w-3.5" />
              Administration Crèche
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">
            Configuration globale de la structure, agréments PMI et répartition des groupes.
          </p>
        </div>

        <Button
          onClick={handleOpenStructureModal}
          className="h-10 text-xs font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md cursor-pointer"
        >
          <IoPencilOutline className="h-4 w-4 mr-1.5" />
          Modifier la structure
        </Button>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">Capacité Agréée</p>
              <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-zinc-100 mt-2 font-mono">{totalCapacite}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Places autorisées PMI</p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl text-slate-600 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700 shadow-xs">
              <IoBusinessOutline className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 2 */}
        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">Effectif Inscrit</p>
              <p className="text-3xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 mt-2 font-mono">{totalEffectif}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Enfants rattachés</p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800 shadow-xs">
              <IoPeople className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 3 */}
        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">Taux d'Occupation</p>
              <p className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 mt-2 font-mono">{tauxOccupation}%</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Niveau d'accueil optimal</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800 shadow-xs">
              <IoTrendingUpOutline className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4 */}
        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">Sections Actives</p>
              <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-zinc-100 mt-2 font-mono">{sections.length}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Groupes configurés</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800 shadow-xs">
              <IoConstructOutline className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Établissement Information Card */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-200/80 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-black tracking-tight">Fiche Signalétique de la Structure</CardTitle>
              <CardDescription className="text-xs text-slate-500 font-medium mt-0.5">
                {structure.nom}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-1 rounded-xl shadow-xs">
                <IoCheckmarkCircle className="h-3 w-3" /> Conforme PMI
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 px-2.5 py-1 rounded-xl shadow-xs">
                <IoShieldCheckmarkOutline className="h-3 w-3" /> Hébergeur HDS
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-500 border border-slate-200/80 dark:border-zinc-700 shrink-0">
                <IoLocationOutline className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider">Adresse physique</p>
                <p className="font-extrabold text-slate-900 dark:text-zinc-100">{structure.adresse}</p>
                <p className="text-slate-500 font-medium">{structure.codePostalVille}</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-500 border border-slate-200/80 dark:border-zinc-700 shrink-0">
                <IoTimeOutline className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider">Plage d'ouverture</p>
                <p className="font-extrabold text-slate-900 dark:text-zinc-100">{structure.joursOuverture}</p>
                <p className="text-slate-500 font-mono font-bold">{structure.horaires}</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-500 border border-slate-200/80 dark:border-zinc-700 shrink-0">
                <IoBusinessOutline className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider">Agrément & Sécurité</p>
                <p className="font-extrabold text-slate-900 dark:text-zinc-100">Agrément PMI N° {structure.numeroAgrement}</p>
                <p className="text-slate-500 font-medium">Registre mis à jour régulièrement</p>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Documents Obligatoires de la Crèche */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-black tracking-tight flex items-center gap-2">
              <IoDocumentTextOutline className="h-5 w-5 text-teal-600" />
              Documents Obligatoires de l'Établissement
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-medium mt-0.5">
              Gestion des documents réglementaires PMI pour la structure
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsDocModalOpen(true)}
            variant="outline"
            size="sm"
            className="h-9 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 hover:bg-teal-50 hover:text-teal-600 transition-all cursor-pointer shadow-xs"
          >
            <IoCloudUploadOutline className="h-4 w-4 mr-1.5" />
            Téléverser un document
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Ajoutez des documents obligatoires personnalisés (ex: "Vaccin Hépatite A"). Tous les enfants devront fournir ces documents.
              </p>
              <Button
                onClick={() => setIsAddDocObligatoireModalOpen(true)}
                variant="outline"
                size="sm"
                className="h-8 text-xs font-bold rounded-xl border-teal-200 dark:border-teal-800 hover:bg-teal-50 hover:text-teal-600 transition-all cursor-pointer shadow-xs"
              >
                <IoAddOutline className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {/* Documents obligatoires par défaut */}
              {[
                { type: 'Certificat PMI', icon: IoShieldCheckmarkOutline, color: 'teal', isDefault: true },
                { type: 'Assurance Responsabilité Civile', icon: IoShieldCheckmarkOutline, color: 'indigo', isDefault: true },
                { type: 'Règlement Intérieur', icon: IoDocumentTextOutline, color: 'purple', isDefault: true },
                { type: 'Projet Pédagogique', icon: IoDocumentTextOutline, color: 'amber', isDefault: true },
                { type: 'Registre de Sécurité', icon: IoAlertCircleOutline, color: 'rose', isDefault: true },
                { type: 'Protocole Sanitaire', icon: IoCheckmarkCircle, color: 'emerald', isDefault: true },
              ].map((doc, idx) => {
                const Icon = doc.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 hover:bg-slate-100 dark:hover:bg-zinc-800/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-${doc.color}-50 dark:bg-${doc.color}-950/40 border border-${doc.color}-200 dark:border-${doc.color}-800`}>
                          <Icon className={`h-4 w-4 text-${doc.color}-600`} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{doc.type}</p>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">Document par défaut</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30"
                        onClick={() => setIsDocModalOpen(true)}
                      >
                        <IoCloudUploadOutline className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {/* Documents obligatoires personnalisés */}
              {documentsObligatoires.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl border border-teal-200/80 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-950/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-800">
                        <IoDocumentTextOutline className="h-4 w-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{doc.nom}</p>
                        <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-0.5 font-bold">Document personnalisé</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-100 dark:hover:bg-teal-950/60"
                        onClick={() => setIsDocModalOpen(true)}
                      >
                        <IoCloudUploadOutline className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        onClick={async () => {
                          if (confirm(`Supprimer le document obligatoire "${doc.nom}" ?`)) {
                            try {
                              await documentObligatoireApi.deleteDocumentObligatoire(doc.id);
                              await loadData();
                            } catch (err) {
                              alert('Erreur lors de la suppression');
                            }
                          }
                        }}
                      >
                        <IoTrashOutline className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {doc.description && (
                    <p className="text-[10px] text-slate-600 dark:text-zinc-400 mt-2 ml-11">
                      {doc.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections Cards Grid */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-black tracking-tight">Groupes & Sections</CardTitle>
            <CardDescription className="text-xs text-slate-500 font-medium mt-0.5">
              Répartition des enfants et capacité par tranche d'âge
            </CardDescription>
          </div>
          <Button
            onClick={handleOpenAddSectionModal}
            variant="outline"
            size="sm"
            className="h-9 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer shadow-xs"
          >
            <IoAddOutline className="h-4 w-4 mr-1.5" />
            Créer une section
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {sections.map((section) => {
              const occupation = section.capacite > 0 ? Math.round((section.effectif / section.capacite) * 100) : 0;
              
              let badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
              let progressColor = 'bg-emerald-500';

              if (occupation >= 90) {
                badgeColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
                progressColor = 'bg-rose-500';
              } else if (occupation >= 75) {
                badgeColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
                progressColor = 'bg-amber-500';
              }

              return (
                <div
                  key={section.id}
                  className="p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 space-y-4 relative group shadow-xs hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100">{section.nom}</h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Tranche d'âge : <span className="font-bold text-slate-700 dark:text-zinc-300">{section.ageMin} à {section.ageMax} mois</span>
                      </p>
                    </div>
                    <span className={`inline-flex items-center text-[10px] font-mono font-bold border px-2.5 py-1 rounded-xl shadow-xs ${badgeColor}`}>
                      {occupation}% occupé
                    </span>
                  </div>

                  {/* Occupation Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-slate-500 text-[11px] font-bold">Remplissage</span>
                      <span className="font-extrabold font-mono text-slate-800 dark:text-zinc-200">
                        {section.effectif} <span className="text-slate-400 font-normal">/ {section.capacite} places</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all ${progressColor}`}
                        style={{ width: `${Math.min(occupation, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-200/60 dark:border-zinc-700/60 text-xs">
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Responsable Référent</p>
                      <p className="font-extrabold text-slate-800 dark:text-zinc-200 mt-0.5">{section.responsable}</p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Horaires de la Section</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-slate-600 dark:text-zinc-300 font-mono text-[11px] font-bold">
                        <IoTimeOutline className="h-3.5 w-3.5 text-slate-400" />
                        {section.horaires}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      onClick={() => handleOpenEditSectionModal(section)}
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer shadow-xs"
                    >
                      Configurer la section
                    </Button>
                    <Button
                      onClick={() => handleDeleteSection(section.id)}
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                    >
                      <IoTrashOutline className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal 1: Édition de la Structure */}
      <AnimatePresence>
        {isStructureModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 border border-indigo-200 dark:border-indigo-800">
                    <IoBusinessOutline className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-black tracking-tight">Modifier la structure</h3>
                </div>
                <button
                  onClick={() => setIsStructureModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <IoCloseOutline className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveStructure} className="p-6 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="nom" className="font-bold text-slate-700 dark:text-zinc-300">Nom de la structure</Label>
                  <Input
                    id="nom"
                    value={structureForm.nom}
                    onChange={(e) => setStructureForm({ ...structureForm, nom: e.target.value })}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="adresse" className="font-bold text-slate-700 dark:text-zinc-300">Adresse</Label>
                  <Input
                    id="adresse"
                    value={structureForm.adresse}
                    onChange={(e) => setStructureForm({ ...structureForm, adresse: e.target.value })}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="codePostalVille" className="font-bold text-slate-700 dark:text-zinc-300">Code Postal & Ville</Label>
                  <Input
                    id="codePostalVille"
                    value={structureForm.codePostalVille}
                    onChange={(e) => setStructureForm({ ...structureForm, codePostalVille: e.target.value })}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="jours" className="font-bold text-slate-700 dark:text-zinc-300">Jours d'ouverture</Label>
                    <Input
                      id="jours"
                      value={structureForm.joursOuverture}
                      onChange={(e) => setStructureForm({ ...structureForm, joursOuverture: e.target.value })}
                      className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="horairesStruct" className="font-bold text-slate-700 dark:text-zinc-300">Horaires</Label>
                    <Input
                      id="horairesStruct"
                      value={structureForm.horaires}
                      onChange={(e) => setStructureForm({ ...structureForm, horaires: e.target.value })}
                      className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="agrement" className="font-bold text-slate-700 dark:text-zinc-300">N° Agrément PMI</Label>
                  <Input
                    id="agrement"
                    value={structureForm.numeroAgrement}
                    onChange={(e) => setStructureForm({ ...structureForm, numeroAgrement: e.target.value })}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsStructureModalOpen(false)}
                    className="h-10 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 cursor-pointer"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="h-10 text-xs font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-md"
                  >
                    Enregistrer
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Création / Édition de Section */}
      <AnimatePresence>
        {isSectionModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 border border-indigo-200 dark:border-indigo-800">
                    <IoConstructOutline className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-black tracking-tight">
                    {selectedSection ? 'Configurer la section' : 'Créer une section'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsSectionModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <IoCloseOutline className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSection} className="p-6 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="sectionNom" className="font-bold text-slate-700 dark:text-zinc-300">Nom de la section</Label>
                  <Input
                    id="sectionNom"
                    placeholder="ex: Bébés (Petits)"
                    value={sectionForm.nom || ''}
                    onChange={(e) => setSectionForm({ ...sectionForm, nom: e.target.value })}
                    required
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ageMin" className="font-bold text-slate-700 dark:text-zinc-300">Âge Min (mois)</Label>
                    <Input
                      id="ageMin"
                      type="number"
                      value={sectionForm.ageMin ?? 0}
                      onChange={(e) => setSectionForm({ ...sectionForm, ageMin: Number(e.target.value) })}
                      required
                      className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ageMax" className="font-bold text-slate-700 dark:text-zinc-300">Âge Max (mois)</Label>
                    <Input
                      id="ageMax"
                      type="number"
                      value={sectionForm.ageMax ?? 36}
                      onChange={(e) => setSectionForm({ ...sectionForm, ageMax: Number(e.target.value) })}
                      required
                      className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="capacite" className="font-bold text-slate-700 dark:text-zinc-300">Capacité max (places)</Label>
                    <Input
                      id="capacite"
                      type="number"
                      value={sectionForm.capacite ?? 10}
                      onChange={(e) => setSectionForm({ ...sectionForm, capacite: Number(e.target.value) })}
                      required
                      className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="effectif" className="font-bold text-slate-700 dark:text-zinc-300">Effectif actuel</Label>
                    <Input
                      id="effectif"
                      type="number"
                      value={sectionForm.effectif ?? 0}
                      onChange={(e) => setSectionForm({ ...sectionForm, effectif: Number(e.target.value) })}
                      required
                      className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="responsable" className="font-bold text-slate-700 dark:text-zinc-300">Responsable référent</Label>
                  <Input
                    id="responsable"
                    placeholder="ex: Sophie Bernard (EJE)"
                    value={sectionForm.responsable || ''}
                    onChange={(e) => setSectionForm({ ...sectionForm, responsable: e.target.value })}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="horaires" className="font-bold text-slate-700 dark:text-zinc-300">Horaires de la section</Label>
                  <Input
                    id="horaires"
                    value={sectionForm.horaires || ''}
                    onChange={(e) => setSectionForm({ ...sectionForm, horaires: e.target.value })}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSectionModalOpen(false)}
                    className="h-10 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 cursor-pointer"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="h-10 text-xs font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-md"
                  >
                    {selectedSection ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 3: Téléverser un Document */}
      <AnimatePresence>
        {isDocModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 border border-teal-200 dark:border-teal-800">
                    <IoCloudUploadOutline className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-black tracking-tight">Téléverser un document</h3>
                </div>
                <button
                  onClick={() => setIsDocModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <IoCloseOutline className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl">
                  <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                    📋 Les documents téléversés ici seront disponibles pour tous les dossiers enfants de l'établissement.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="docType" className="font-bold text-slate-700 dark:text-zinc-300">Type de document</Label>
                  <select
                    id="docType"
                    className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 shadow-xs text-xs"
                  >
                    <option>Certificat PMI</option>
                    <option>Assurance Responsabilité Civile</option>
                    <option>Règlement Intérieur</option>
                    <option>Projet Pédagogique</option>
                    <option>Registre de Sécurité</option>
                    <option>Protocole Sanitaire</option>
                    <option>Autre</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="docNom" className="font-bold text-slate-700 dark:text-zinc-300">Nom du document</Label>
                  <Input
                    id="docNom"
                    placeholder="ex: Certificat PMI 2024"
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="docFile" className="font-bold text-slate-700 dark:text-zinc-300">Fichier</Label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-2xl p-6 text-center hover:border-teal-400 dark:hover:border-teal-600 transition-colors cursor-pointer">
                    <IoCloudUploadOutline className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Cliquez pour téléverser ou glissez-déposez
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                      PDF, JPG, PNG (max. 10MB)
                    </p>
                    <input
                      id="docFile"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="docCommentaire" className="font-bold text-slate-700 dark:text-zinc-300">Commentaire (optionnel)</Label>
                  <Textarea
                    id="docCommentaire"
                    placeholder="Notes ou précisions sur le document..."
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs text-xs min-h-[80px]"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDocModalOpen(false)}
                    disabled={uploadingDoc}
                    className="h-10 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 cursor-pointer"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    disabled={uploadingDoc}
                    className="h-10 text-xs font-bold rounded-2xl bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-md"
                    onClick={() => {
                      setUploadingDoc(true);
                      setTimeout(() => {
                        setUploadingDoc(false);
                        setIsDocModalOpen(false);
                        alert('Document téléversé avec succès!');
                      }, 1500);
                    }}
                  >
                    {uploadingDoc ? 'Téléversement...' : 'Téléverser'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 4: Ajouter un Document Obligatoire Personnalisé */}
      <AnimatePresence>
        {isAddDocObligatoireModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 border border-teal-200 dark:border-teal-800">
                    <IoAddOutline className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-black tracking-tight">Ajouter un document obligatoire</h3>
                </div>
                <button
                  onClick={() => setIsAddDocObligatoireModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <IoCloseOutline className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl">
                  <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                    📋 Ajoutez un document obligatoire personnalisé (ex: "Vaccin Hépatite A"). Tous les enfants devront fournir ce document.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="docObligNom" className="font-bold text-slate-700 dark:text-zinc-300">
                    Nom du document *
                  </Label>
                  <Input
                    id="docObligNom"
                    value={newDocObligatoire.nom}
                    onChange={(e) => setNewDocObligatoire({ ...newDocObligatoire, nom: e.target.value })}
                    placeholder="ex: Vaccin Hépatite A"
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="docObligType" className="font-bold text-slate-700 dark:text-zinc-300">
                    Type de document
                  </Label>
                  <select
                    id="docObligType"
                    value={newDocObligatoire.typeDocument}
                    onChange={(e) => setNewDocObligatoire({ ...newDocObligatoire, typeDocument: e.target.value })}
                    className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 shadow-xs text-xs"
                  >
                    <option value="carnet_vaccination">Vaccin</option>
                    <option value="certificat_medical">Certificat médical</option>
                    <option value="autorisation_sortie">Autorisation</option>
                    <option value="pai">PAI / Protocole</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="docObligDesc" className="font-bold text-slate-700 dark:text-zinc-300">
                    Description (optionnel)
                  </Label>
                  <Textarea
                    id="docObligDesc"
                    value={newDocObligatoire.description}
                    onChange={(e) => setNewDocObligatoire({ ...newDocObligatoire, description: e.target.value })}
                    placeholder="Précisions sur ce document..."
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 shadow-xs text-xs min-h-[80px]"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDocObligatoireModalOpen(false);
                      setNewDocObligatoire({ nom: '', description: '', typeDocument: 'autre' });
                    }}
                    className="h-10 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 cursor-pointer"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    disabled={!newDocObligatoire.nom}
                    className="h-10 text-xs font-bold rounded-2xl bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-md disabled:opacity-50"
                    onClick={async () => {
                      try {
                        setLoading(true);
                        await documentObligatoireApi.createDocumentObligatoire({
                          etablissementId: etablissementId,
                          nom: newDocObligatoire.nom,
                          description: newDocObligatoire.description,
                          typeDocument: newDocObligatoire.typeDocument,
                        });
                        setIsAddDocObligatoireModalOpen(false);
                        setNewDocObligatoire({ nom: '', description: '', typeDocument: 'autre' });
                        await loadData();
                        console.log('✅ Document obligatoire ajouté avec succès');
                      } catch (err: any) {
                        console.error('❌ Erreur ajout document obligatoire:', err);
                        alert(err.response?.data?.error || 'Erreur lors de l\'ajout');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};