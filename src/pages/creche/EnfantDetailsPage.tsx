import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IoArrowBack,
  IoCallOutline,
  IoShieldCheckmarkOutline,
  IoMedkitOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoDownloadOutline,
  IoKeyOutline,
  IoCopyOutline,
  IoTimeOutline,
  IoReloadOutline,
  IoPeopleOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoLocationOutline,
} from 'react-icons/io5';
import { AppBackground } from '@/components/AppBackground';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  const [activeSection, setActiveSection] = useState('general');
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
      <AppBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-3">
            <IoReloadOutline className="h-8 w-8 text-fuchsia-600 animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">
              Chargement du dossier enfant...
            </p>
          </div>
        </div>
      </AppBackground>
    );
  }

  // Error state
  if (error || !enfant) {
    return (
      <AppBackground>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-4">
            <IoAlertCircleOutline className="h-12 w-12 text-red-500 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
              {error || 'Dossier enfant introuvable.'}
            </p>
            <Button
              size="sm"
              onClick={() => navigate(-1)}
              className="bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-medium text-xs h-9 px-4 rounded-xl cursor-pointer"
            >
              <IoArrowBack className="h-4 w-4 mr-2" />
              Retour au registre
            </Button>
          </div>
        </div>
      </AppBackground>
    );
  }

  // Récupération des parents associés
  const parents = enfant.parents || [];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(enfant.codeConfidentiel);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppBackground>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen text-slate-900 dark:text-zinc-100 p-6 md:p-10 font-sans antialiased"
      >
        {/* TOP CONTENT CONTAINER */}
        <div className="w-full max-w-6xl mx-auto space-y-6">

          {/* HEADER BREADCRUMB */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-200/80 dark:border-zinc-800">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 transition-colors cursor-pointer"
            >
              <IoArrowBack className="h-4 w-4" />
              Retour au registre
            </button>

            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-900">
              Dossier Enfant
            </span>
          </div>

          {/* PROFILE CARD */}
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200/80 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row items-start gap-6">

                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar className="h-20 w-20 border-2 border-fuchsia-500/30 shadow-md">
                    <AvatarImage src={enfant.photo} alt={enfant.prenom} />
                    <AvatarFallback className="bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200 font-black text-2xl">
                      {enfant.prenom?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 ring-2 ring-white dark:ring-zinc-900 h-5 w-5 rounded-full flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  </div>
                </div>

                {/* Infos principales */}
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {enfant.prenom} {enfant.nom}
                      </h1>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                        ID-{enfant._id?.slice(-6)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {enfant.statut === 'sain' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg">
                          <IoCheckmarkCircleOutline className="h-3 w-3" />
                          En forme
                        </span>
                      )}
                      {enfant.statut === 'symptome' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-lg animate-pulse">
                          <IoWarningOutline className="h-3 w-3" />
                          Symptôme
                        </span>
                      )}
                      {enfant.pai?.actif && (
                        <span className="inline-flex items-center text-[10px] font-bold text-white bg-rose-600 px-2.5 py-1 rounded-lg">
                          PAI Actif
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-zinc-700/60">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Âge</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                        {enfant.age || Math.floor((new Date().getTime() - new Date(enfant.dateNaissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} ans
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-zinc-700/60">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Né(e) le</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-0.5 font-mono">
                        {format(new Date(enfant.dateNaissance), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-zinc-700/60">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Groupe</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-0.5 font-mono">
                        {enfant.groupeSanguin || 'N/A'}
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-zinc-700/60">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Allergies</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                        {enfant.allergies && enfant.allergies.length > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400">{enfant.allergies.length}</span>
                        ) : (
                          'Aucune'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                  {parents[0]?.tel && (
                    <a href={`tel:${parents[0].tel}`} className="flex-1 sm:flex-none">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-9 text-xs font-medium rounded-xl cursor-pointer"
                      >
                        <IoCallOutline className="h-4 w-4 mr-2" />
                        Appeler
                      </Button>
                    </a>
                  )}
                  {canViewCode(user?.role || 'parent') && enfant.codeConfidentiel && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCodeModalOpen(true)}
                      className="flex-1 sm:flex-none w-full h-9 text-xs font-medium rounded-xl cursor-pointer"
                    >
                      <IoKeyOutline className="h-4 w-4 mr-2" />
                      Code
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs navigation */}
            <div className="px-6 py-3 bg-slate-50/50 dark:bg-zinc-800/30 border-b border-slate-200/80 dark:border-zinc-800 flex gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveSection('general')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeSection === 'general'
                    ? 'bg-fuchsia-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800'
                }`}
              >
                <IoDocumentTextOutline className="inline h-3.5 w-3.5 mr-1.5" />
                Général
              </button>
              <button
                onClick={() => setActiveSection('sante')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeSection === 'sante'
                    ? 'bg-fuchsia-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800'
                }`}
              >
                <IoMedkitOutline className="inline h-3.5 w-3.5 mr-1.5" />
                Santé
              </button>
              <button
                onClick={() => setActiveSection('documents')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeSection === 'documents'
                    ? 'bg-fuchsia-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800'
                }`}
              >
                <IoDocumentTextOutline className="inline h-3.5 w-3.5 mr-1.5" />
                Documents
              </button>
              <button
                onClick={() => setActiveSection('parents')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeSection === 'parents'
                    ? 'bg-fuchsia-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800'
                }`}
              >
                <IoPeopleOutline className="inline h-3.5 w-3.5 mr-1.5" />
                Parents
              </button>
            </div>

            {/* Content sections */}
            <div className="p-6">
              {/* Section: Général */}
              {activeSection === 'general' && (
                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Informations générales</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Prénom</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{enfant.prenom}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Nom</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{enfant.nom}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Date de naissance</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {format(new Date(enfant.dateNaissance), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Sexe</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                        {enfant.sexe || 'Non spécifié'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Adresse</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {enfant.adresse || 'Non renseignée'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Section</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {enfant.section?.nom || 'Non assigné'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Santé */}
              {activeSection === 'sante' && (
                <div className="space-y-6">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Informations de santé</h2>

                  {/* PAI */}
                  {enfant.pai?.actif ? (
                    <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <IoShieldCheckmarkOutline className="h-5 w-5 text-rose-700 dark:text-rose-400" />
                        <h3 className="text-sm font-bold text-rose-900 dark:text-rose-300">PAI Actif</h3>
                      </div>
                      <p className="text-xs text-rose-800 dark:text-rose-400">
                        <span className="font-bold">Pathologie :</span> {enfant.pai.pathologie}
                      </p>
                      {enfant.pai.dateDebut && (
                        <p className="text-xs text-rose-800 dark:text-rose-400 font-mono">
                          Depuis le {format(new Date(enfant.pai.dateDebut), 'dd/MM/yyyy', { locale: fr })}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <IoCheckmarkCircleOutline className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Aucun PAI actif</p>
                      </div>
                    </div>
                  )}

                  {/* Allergies */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-3">Allergies déclarées</h3>
                    {enfant.allergies && enfant.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {enfant.allergies.map((allergie: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
                          >
                            <IoWarningOutline className="inline h-3 w-3 mr-1" />
                            {allergie}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-zinc-400">Aucune allergie signalée</p>
                    )}
                  </div>

                  {/* Vaccinations */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-3">Vaccinations</h3>
                    {enfant.vaccinations && enfant.vaccinations.length > 0 ? (
                      <div className="space-y-2">
                        {enfant.vaccinations.map((vaccin: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 rounded-xl"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{vaccin.nom}</p>
                              {vaccin.dateAdministration && (
                                <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                                  {format(new Date(vaccin.dateAdministration), 'dd/MM/yyyy', { locale: fr })}
                                </p>
                              )}
                            </div>
                            <IoCheckmarkCircleOutline className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-zinc-400">Aucune vaccination enregistrée</p>
                    )}
                  </div>

                  {/* Groupe sanguin */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-3">Groupe sanguin</h3>
                    <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 rounded-xl">
                      <p className="text-2xl font-black text-slate-900 dark:text-white font-mono text-center">
                        {enfant.groupeSanguin || 'Non déterminé'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Documents */}
              {activeSection === 'documents' && (
                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Documents administratifs</h2>
                  <DocumentsManager
                    enfantId={enfant._id}
                    userRole={user?.role || 'parent'}
                    userId={user?.id || ''}
                  />
                </div>
              )}

              {/* Section: Parents */}
              {activeSection === 'parents' && (
                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Parents et responsables légaux</h2>

                  {parents.length > 0 ? (
                    <div className="space-y-3">
                      {parents.map((parent: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-2"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200 text-xs font-bold">
                                {parent.prenom?.[0]}{parent.nom?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {parent.prenom} {parent.nom}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-zinc-400">
                                {parent.email || 'Email non renseigné'}
                              </p>
                            </div>
                          </div>

                          {parent.tel && (
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400">
                              <IoCallOutline className="h-3.5 w-3.5" />
                              <span className="font-mono">{parent.tel}</span>
                            </div>
                          )}

                          {parent.adresse && (
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400">
                              <IoLocationOutline className="h-3.5 w-3.5" />
                              <span>{parent.adresse}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-zinc-400">Aucun parent enregistré</p>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="w-full max-w-6xl mx-auto text-center border-t border-slate-200/30 dark:border-zinc-800/30 pt-4 mt-6">
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            Kids'Med IA © 2026 · Plateforme de gestion sanitaire de la petite enfance
          </p>
        </div>

        {/* Modals */}
        {canViewCode(user?.role || 'parent') && enfant.codeConfidentiel && (
          <CodeConfidentielModal
            isOpen={isCodeModalOpen}
            onClose={() => setIsCodeModalOpen(false)}
            enfant={enfant}
            userId={user?.id || ''}
            userRole={user?.role as 'creche' | 'rsai' | 'superadmin'}
          />
        )}
      </motion.div>
    </AppBackground>
  );
};
