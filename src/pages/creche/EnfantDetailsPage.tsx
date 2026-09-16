import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IoArrowBack,
  IoCallOutline,
  IoLocationOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoMedkitOutline,
  IoPulseOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoDownloadOutline,
  IoKeyOutline,
  IoCopyOutline,
  IoRefreshOutline,
  IoHappyOutline,
  IoTimeOutline,
  IoReloadOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { enfantApi } from '@/services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { DocumentsManager } from '@/components/documents/DocumentsManager';
import { CodeConfidentielModal } from '@/components/modals/CodeConfidentielModal';
import { canViewCode } from '@/utils/documentHelpers';
import { motion } from 'framer-motion';

export const EnfantDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [enfant, setEnfant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données de l'enfant depuis l'API
  useEffect(() => {
    const loadEnfant = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await enfantApi.getEnfantById(id);
        setEnfant(response.data);
      } catch (err: any) {
        console.error('Erreur chargement enfant:', err);
        setError(err.response?.data?.error || 'Enfant non trouvé');
      } finally {
        setIsLoading(false);
      }
    };

    loadEnfant();
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-16 text-center space-y-4 max-w-md mx-auto mt-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xl">
        <IoReloadOutline className="h-12 w-12 text-teal-500 mx-auto animate-spin" />
        <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">Chargement du dossier...</p>
      </div>
    );
  }

  // Error state
  if (error || !enfant) {
    return (
      <div className="p-16 text-center space-y-4 max-w-md mx-auto mt-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xl">
        <IoAlertCircleOutline className="h-12 w-12 text-red-500 mx-auto" />
        <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">{error || 'Dossier enfant introuvable.'}</p>
        <Button size="sm" onClick={() => navigate(-1)} className="rounded-2xl font-bold bg-teal-600 hover:bg-teal-700 text-white cursor-pointer">
          Retour au registre
        </Button>
      </div>
    );
  }

  // Récupération des parents associés depuis la relation many-to-many
  const parents = enfant.parents || [];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(enfant.codeConfidentiel);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans antialiased text-slate-900 dark:text-zinc-100 bg-gradient-to-br from-slate-50 via-teal-50/20 to-indigo-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 min-h-screen"
    >
      
      {/* Navigation Breadcrumb */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-400 transition-colors cursor-pointer group"
        >
          <div className="p-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 group-hover:border-teal-500/50 shadow-xs">
            <IoArrowBack className="h-3.5 w-3.5" />
          </div>
          Retour au Registre des Enfants
        </button>
      </div>

      {/* Main Profile Header Card */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-none">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            
            {/* Avatar Profile */}
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24 border-4 border-teal-500/30 shadow-lg">
                <AvatarImage src={enfant.photo} alt={enfant.prenom} />
                <AvatarFallback className="bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200 font-black text-2xl">
                  {enfant.prenom[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-teal-500 ring-4 ring-white dark:ring-zinc-900 h-6 w-6 rounded-full flex items-center justify-center shadow-md">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            {/* Profile Overview Details */}
            <div className="flex-1 space-y-4 w-full">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
                      {enfant.prenom} {enfant.nom}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                      ID-{enfant.id}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {enfant.statut === 'sain' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-3 py-1 rounded-xl">
                        <IoCheckmarkCircleOutline className="h-3.5 w-3.5" />
                        En forme
                      </span>
                    )}
                    {enfant.statut === 'symptome' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-3 py-1 rounded-xl animate-pulse">
                        <IoWarningOutline className="h-3.5 w-3.5" />
                        Symptôme Signalé
                      </span>
                    )}
                    {enfant.statut !== 'sain' && enfant.statut !== 'symptome' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-xl">
                        <IoAlertCircleOutline className="h-3.5 w-3.5" />
                        Surveillance
                      </span>
                    )}

                    {enfant.pai?.actif && (
                      <span className="inline-flex items-center text-[11px] font-extrabold text-white bg-rose-600 px-3 py-1 rounded-xl shadow-xs">
                        PAI Actif
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {parents[0]?.tel && (
                    <a href={`tel:${parents[0].tel}`} className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="w-full h-10 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 transition-all cursor-pointer shadow-xs">
                        <IoCallOutline className="h-4 w-4 mr-2 text-teal-600" />
                        Appeler Responsable
                      </Button>
                    </a>
                  )}
                  <Button size="sm" className="w-full sm:w-auto h-10 px-5 text-xs font-bold rounded-2xl bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-md cursor-pointer">
                    Pointer Présence
                  </Button>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                <div className="bg-slate-50/80 dark:bg-zinc-800/50 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Âge</p>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 mt-1">{enfant.age} ans</p>
                </div>

                <div className="bg-slate-50/80 dark:bg-zinc-800/50 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Né(e) le</p>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 mt-1 font-mono">
                    {format(new Date(enfant.dateNaissance), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>

                <div className="bg-slate-50/80 dark:bg-zinc-800/50 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Groupe Sanguin</p>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 mt-1 font-mono">
                    {enfant.groupeSanguin || 'Inconnu'}
                  </p>
                </div>

                <div className="bg-slate-50/80 dark:bg-zinc-800/50 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Allergies</p>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 mt-1">
                    {enfant.allergies && enfant.allergies.length > 0 ? (
                      <span className="text-rose-600 dark:text-rose-400 font-bold">{enfant.allergies.length} Signalée(s)</span>
                    ) : (
                      'Aucune'
                    )}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Structured Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        
        <TabsList className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-1.5 rounded-2xl w-full sm:w-auto justify-start border border-slate-200/80 dark:border-zinc-800 shadow-md">
          <TabsTrigger value="general" className="text-xs font-bold gap-2 h-9 rounded-xl data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all cursor-pointer">
            <IoDocumentTextOutline className="h-4 w-4" />
            Fiche Générale
          </TabsTrigger>
          <TabsTrigger value="medical" className="text-xs font-bold gap-2 h-9 rounded-xl data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all cursor-pointer">
            <IoMedkitOutline className="h-4 w-4" />
            Dossier Médical & PAI
          </TabsTrigger>
          <TabsTrigger value="suivi" className="text-xs font-bold gap-2 h-9 rounded-xl data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all cursor-pointer">
            <IoPulseOutline className="h-4 w-4" />
            Journal Quotidien
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs font-bold gap-2 h-9 rounded-xl data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all cursor-pointer">
            <IoShieldCheckmarkOutline className="h-4 w-4" />
            Coffre-fort HDS
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Fiche Générale */}
        <TabsContent value="general" className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Contacts d'Urgence */}
            <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
              <CardHeader className="p-5 border-b border-slate-100 dark:border-zinc-800">
                <CardTitle className="text-sm font-extrabold">Responsables Légaux & Urgence</CardTitle>
                <CardDescription className="text-xs text-slate-500 font-medium">
                  Contacts à joindre immédiatement en cas d'incident
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-3.5">
                {parents.map((parent) => (
                  <div
                    key={parent.id}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/30 flex items-start justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-start gap-3.5">
                      <Avatar className="h-10 w-10 mt-0.5 border border-teal-500/20">
                        <AvatarFallback className="bg-teal-50 text-teal-800 dark:bg-teal-950 text-xs font-bold">
                          {parent.prenom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-zinc-100">
                          {parent.prenom} {parent.nom}
                        </p>
                        <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">{parent.lien || 'Tuteur Légal'}</p>
                        
                        <div className="pt-1.5 space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-200 font-mono font-bold">
                            <IoCallOutline className="h-4 w-4 text-teal-600 shrink-0" />
                            {parent.tel}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                            <IoLocationOutline className="h-4 w-4 text-slate-400 shrink-0" />
                            {parent.adresse}
                          </div>
                        </div>
                      </div>
                    </div>

                    <a href={`tel:${parent.tel}`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs font-bold rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer shadow-xs">
                        Appeler
                      </Button>
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Autorisations Administratives */}
            <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
              <CardHeader className="p-5 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-extrabold">Autorisations Signées</CardTitle>
                    <CardDescription className="text-xs text-slate-500 font-medium">
                      Déclarations d'accord de la famille
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => alert('Module de gestion des autorisations à venir')}
                    className="h-8 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
                  >
                    Gérer
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {enfant.autorisations && Object.keys(enfant.autorisations).length > 0 ? (
                  <div className="space-y-3">
                    {enfant.autorisations.sorties && (
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/40">
                        <span className="text-xs font-extrabold text-teal-900 dark:text-teal-300">
                          Sorties Pédagogiques & Extérieures
                        </span>
                        <span className="inline-flex items-center text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/50 px-2.5 py-1 rounded-xl">
                          Autorisé
                        </span>
                      </div>
                    )}

                    {enfant.autorisations.droitImage && (
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/40">
                        <span className="text-xs font-extrabold text-teal-900 dark:text-teal-300">
                          Droit à l'Image (Photos / Vidéos)
                        </span>
                        <span className="inline-flex items-center text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/50 px-2.5 py-1 rounded-xl">
                          Autorisé
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-800 text-center">
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      Aucune autorisation n'a encore été fournie par les parents.
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                      Cliquez sur "Gérer" pour demander les autorisations nécessaires.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Code Confidentiel (visible seulement pour crèche/RSAI/SuperAdmin) */}
            {user && canViewCode(user.role) && (
              <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md lg:col-span-2">
                <CardHeader className="p-5 border-b border-slate-100 dark:border-zinc-800">
                  <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                    <IoKeyOutline className="h-4 w-4 text-teal-600" />
                    Code de liaison parent
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 font-medium">
                    Code confidentiel pour permettre aux parents de lier leur compte
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-wider">
                        {enfant.codeConfidentiel}
                      </p>
                      {enfant.codeGenereeLe && (
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 font-medium">
                          Généré le {format(new Date(enfant.codeGenereeLe), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyCode}
                        className="h-10 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer gap-2"
                      >
                        {copied ? (
                          <>
                            <IoCheckmarkCircleOutline className="h-4 w-4 text-teal-600" />
                            Copié !
                          </>
                        ) : (
                          <>
                            <IoCopyOutline className="h-4 w-4" />
                            Copier
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsCodeModalOpen(true)}
                        className="h-10 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer gap-2"
                      >
                        <IoRefreshOutline className="h-4 w-4" />
                        Régénérer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </TabsContent>

        {/* Tab 2: Dossier Médical & PAI */}
        <TabsContent value="medical" className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Allergies & PAI Active Card */}
            <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
              <CardHeader className="p-5 border-b border-slate-100 dark:border-zinc-800">
                <CardTitle className="text-sm font-extrabold">Protocole de Soins & Allergies</CardTitle>
                <CardDescription className="text-xs text-slate-500 font-medium">
                  Informations de santé prioritaires pour l'équipe encadrante
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                
                {/* Allergies list */}
                {enfant.allergies && enfant.allergies.length > 0 ? (
                  <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-2">
                    <p className="text-xs font-extrabold text-rose-900 dark:text-rose-200 flex items-center gap-2">
                      <IoWarningOutline className="h-4 w-4 shrink-0" />
                      Allergies Alimentaires / Médicamenteuses
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {enfant.allergies.map((a: string, i: number) => (
                        <span key={i} className="text-[10px] font-bold bg-rose-600 text-white px-3 py-1 rounded-xl shadow-xs">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/40 text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-2">
                    <IoCheckmarkCircleOutline className="h-4 w-4" />
                    Aucune allergie connue enregistrée.
                  </div>
                )}

                {/* PAI Info */}
                {enfant.pai?.actif ? (
                  <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-extrabold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                        <IoAlertCircleOutline className="h-4 w-4" />
                        Projet d'Accueil Individualisé (PAI)
                      </p>
                      <span className="text-[10px] font-extrabold bg-amber-600 text-white px-2.5 py-0.5 rounded-lg">EN VIGUEUR</span>
                    </div>

                    <div className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200 font-medium">
                      <p><span className="font-bold">Pathologie :</span> {enfant.pai.pathologie || 'Asthme léger'}</p>
                      <p><span className="font-bold">Traitement d'urgence :</span> {enfant.pai.traitement || 'Ventoline 100µg (2 bouffées)'}</p>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 italic pt-1 font-semibold">
                        Consignes : Contact immédiat des urgences si pas d'amélioration après 15 minutes.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-800 text-xs text-slate-500 font-medium">
                    Aucun PAI spécifique actif.
                  </div>
                )}

              </CardContent>
            </Card>

            {/* Carnet de Vaccination */}
            <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
              <CardHeader className="p-5 border-b border-slate-100 dark:border-zinc-800">
                <CardTitle className="text-sm font-extrabold">Carnet de Vaccinations</CardTitle>
                <CardDescription className="text-xs text-slate-500 font-medium">
                  Suivi des injections réglementaires obligatoires
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {enfant.vaccins && enfant.vaccins.length > 0 ? (
                  enfant.vaccins.map((vaccin: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-800 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-zinc-100">{vaccin.nom}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5 font-semibold">
                          Injecté le : {format(new Date(vaccin.date), 'dd/MM/yyyy', { locale: fr })}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-xl">
                        Conforme
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic font-medium">Aucune donnée vaccinale renseignée.</p>
                )}
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* Tab 3: Journal Quotidien */}
        <TabsContent value="suivi" className="space-y-5">
          <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
            <CardHeader className="p-5 border-b border-slate-100 dark:border-zinc-800">
              <CardTitle className="text-sm font-extrabold">Historique Récent des Transmissions</CardTitle>
              <CardDescription className="text-xs text-slate-500 font-medium">
                Activités, repas, sieste et soins enregistrés pour cet enfant
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              {enfant.transmissions && enfant.transmissions.length > 0 ? (
                <div className="space-y-3.5">
                  {enfant.transmissions.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/30 flex items-start gap-4 shadow-xs"
                    >
                      <span className="font-mono text-xs font-extrabold text-teal-600 dark:text-teal-400 mt-0.5 shrink-0 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-xl border border-teal-200 dark:border-teal-800/50">
                        {item.time}
                      </span>
                      <div className="space-y-1.5 flex-1">
                        <span className="text-[10px] font-bold bg-white dark:bg-zinc-900 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-zinc-700">
                          {item.category}
                        </span>
                        <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <IoHappyOutline className="h-12 w-12 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
                    Aucune transmission enregistrée pour aujourd'hui
                  </p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
                    Les activités, repas et siestes seront affichés ici
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Coffre-fort HDS - Documents */}
        <TabsContent value="documents" className="space-y-5">
          {user && (
            <DocumentsManager
              enfantId={enfant.id}
              userRole={user.role}
              userId={user.id}
            />
          )}
        </TabsContent>

      </Tabs>

      {/* Modals */}
      {user && (
        <CodeConfidentielModal
          isOpen={isCodeModalOpen}
          onClose={() => setIsCodeModalOpen(false)}
          enfant={enfant}
          userId={user.id}
          userRole={user.role as 'creche' | 'rsai' | 'superadmin'}
        />
      )}

    </motion.div>
  );
};