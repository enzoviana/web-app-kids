import React, { useState, useEffect } from 'react';
import {
  IoAddOutline,
  IoDocumentTextOutline,
  IoTimeOutline,
  IoRestaurantOutline,
  IoMoonOutline,
  IoMedicalOutline,
  IoWarningOutline,
  IoSparklesOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoEyeOutline,
  IoShieldCheckmarkOutline,
  IoReloadOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { transmissionApi, enfantApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

const DEFAULT_ETABLISSEMENT_ID = 'test-creche-001';

interface Transmission {
  id: string;
  createdAt: string;
  enfant: {
    id: string;
    nom: string;
    prenom: string;
    dateNaissance: string;
    photo?: string;
  };
  type: 'repas' | 'sieste' | 'soin' | 'incident' | 'observation';
  auteurNom: string;
  contenu: string;
  destinataire: 'parent' | 'medecin' | 'equipe';
}

export const CahierLiaisonPage: React.FC = () => {
  const { user } = useAuth();
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [enfants, setEnfants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    repas: 0,
    sieste: 0,
    soin: 0,
    incident: 0,
    observation: 0,
  });
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // États du formulaire de modal
  const [selectedEnfantId, setSelectedEnfantId] = useState('');
  const [typeInput, setTypeInput] = useState<'repas' | 'sieste' | 'soin' | 'incident' | 'observation'>('repas');
  const [contenuInput, setContenuInput] = useState('');
  const [destinataireInput, setDestinataireInput] = useState<'parent' | 'medecin' | 'equipe'>('parent');

  // Load data from backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load transmissions
      const transmissionsResponse = await transmissionApi.getTransmissionsByEtablissement(
        DEFAULT_ETABLISSEMENT_ID
      );
      setTransmissions(transmissionsResponse.data || []);

      // Load enfants
      const enfantsResponse = await enfantApi.getEnfantsByEtablissement(DEFAULT_ETABLISSEMENT_ID);
      const enfantsData = enfantsResponse.data || [];
      setEnfants(enfantsData);

      if (enfantsData.length > 0 && !selectedEnfantId) {
        setSelectedEnfantId(enfantsData[0].id);
      }

      // Load stats
      const statsResponse = await transmissionApi.getTransmissionStats(DEFAULT_ETABLISSEMENT_ID);
      setStats(statsResponse.data || { total: 0, repas: 0, sieste: 0, soin: 0, incident: 0, observation: 0 });
    } catch (err: any) {
      console.error('❌ Erreur chargement transmissions:', err);
      setError(err.response?.data?.error || 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransmissions = transmissions
    .map((trans) => {
      // Calculate age
      const age = trans.enfant.dateNaissance
        ? Math.floor(
            (new Date().getTime() - new Date(trans.enfant.dateNaissance).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : 0;

      return {
        ...trans,
        enfant: {
          ...trans.enfant,
          age,
        },
      };
    })
    .filter((trans) => {
      const matchesSearch =
        trans.enfant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trans.enfant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trans.contenu.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || trans.type === filterType;
      return matchesSearch && matchesType;
    });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'repas':
        return <IoRestaurantOutline className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'sieste':
        return <IoMoonOutline className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case 'soin':
        return <IoMedicalOutline className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'incident':
        return <IoWarningOutline className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      case 'observation':
        return <IoSparklesOutline className="h-4 w-4 text-sky-600 dark:text-sky-400" />;
      default:
        return <IoDocumentTextOutline className="h-4 w-4 text-slate-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'repas':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-1 rounded-xl shadow-xs">
            Repas
          </span>
        );
      case 'sieste':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 px-2.5 py-1 rounded-xl shadow-xs">
            Sieste
          </span>
        );
      case 'soin':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-2.5 py-1 rounded-xl shadow-xs">
            Soin
          </span>
        );
      case 'incident':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 px-2.5 py-1 rounded-xl shadow-xs">
            Incident
          </span>
        );
      case 'observation':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-sky-700 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 px-2.5 py-1 rounded-xl shadow-xs">
            Observation
          </span>
        );
      default:
        return <span className="inline-flex items-center text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">{type}</span>;
    }
  };

  const handleCreateTransmission = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedEnfantId || !contenuInput.trim()) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      await transmissionApi.createTransmission({
        enfantId: selectedEnfantId,
        etablissementId: DEFAULT_ETABLISSEMENT_ID,
        type: typeInput,
        contenu: contenuInput,
        auteurId: user.id,
        auteurNom: `${user.profile?.prenom} ${user.profile?.nom}`,
        destinataire: destinataireInput,
      });

      console.log('✅ Transmission créée');

      // Reset form
      setIsModalOpen(false);
      setContenuInput('');
      setTypeInput('repas');
      setDestinataireInput('parent');

      // Reload data
      await loadData();
    } catch (err: any) {
      console.error('❌ Erreur création transmission:', err);
      alert(err.response?.data?.error || 'Erreur lors de la création');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-16 text-center space-y-4 max-w-md mx-auto mt-20">
        <IoReloadOutline className="h-12 w-12 text-sky-500 mx-auto animate-spin" />
        <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
          Chargement des transmissions...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-16 text-center space-y-4 max-w-md mx-auto mt-20">
        <IoAlertCircleOutline className="h-12 w-12 text-rose-500 mx-auto" />
        <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
          Erreur de chargement
        </p>
        <p className="text-xs text-slate-500 dark:text-zinc-400">{error}</p>
        <Button onClick={loadData}>
          <IoReloadOutline className="h-4 w-4 mr-2" />
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
      className="p-4 sm:p-8 space-y-8 bg-gradient-to-br from-slate-50 via-sky-50/20 to-indigo-50/20 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 font-sans antialiased"
    >
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Cahier de Liaison Sanitaire</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800 shadow-xs">
              <IoShieldCheckmarkOutline className="h-3.5 w-3.5" />
              Transmissions HDS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">
            Suivi quotidien horodaté et sécurisé entre l'équipe éducative, la direction, le RSAI et les familles.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-10 text-xs font-bold rounded-2xl bg-sky-600 hover:bg-sky-700 text-white transition-all shadow-md cursor-pointer"
        >
          <IoAddOutline className="h-4 w-4 mr-1.5" />
          Nouvelle Transmission
        </Button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        
        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Transmissions</p>
            <p className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Repas</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.repas}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Siestes</p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {stats.sieste}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">Soins</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {stats.soin}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md col-span-2 sm:col-span-1">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">Incidents</p>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {stats.incident}
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Main Card List Section */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md overflow-hidden">
        
        {/* Header & Filter Controls */}
        <div className="p-5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par enfant, soignant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:border-sky-500 transition-all shadow-xs"
            />
          </div>

          {/* Filtres par catégorie */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl border border-slate-200/80 dark:border-zinc-700">
            {['all', 'repas', 'sieste', 'soin', 'incident', 'observation'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  filterType === t
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                {t === 'all' ? 'Toutes' : t}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          
          {/* Liste des transmissions */}
          <div className="space-y-3">
            {filteredTransmissions.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-3xl border-slate-200 dark:border-zinc-800">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Aucune transmission ne correspond à votre filtre.</p>
              </div>
            ) : (
              filteredTransmissions.map((trans) => (
                <div
                  key={trans.id}
                  className="p-4 rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-all flex gap-4 items-start shadow-xs"
                >
                  <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs shrink-0 mt-0.5">
                    {getTypeIcon(trans.type)}
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 rounded-xl border border-sky-500/25 shadow-xs">
                          <AvatarFallback className="bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200 text-[10px] font-extrabold">
                            {trans.enfant.prenom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-extrabold text-xs text-slate-900 dark:text-zinc-100">
                          {trans.enfant.prenom} {trans.enfant.nom}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">• {trans.enfant.age} ans</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {getTypeBadge(trans.type)}
                        <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-xl">
                          <IoTimeOutline className="h-3 w-3" />
                          {format(new Date(trans.createdAt), 'HH:mm', { locale: fr })}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
                      {trans.contenu}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200/60 dark:border-zinc-800/60">
                      <span className="font-bold text-slate-500 dark:text-zinc-400">Auteur : {trans.auteurNom}</span>
                      <div className="flex items-center gap-1 font-mono font-bold">
                        <IoEyeOutline className="h-3 w-3 text-slate-400" />
                        <span>
                          Visibilité :{' '}
                          {trans.destinataire === 'parent'
                            ? 'Parents & Équipe'
                            : trans.destinataire === 'medecin'
                            ? 'Médecin / RSAI'
                            : 'Équipe Seule'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </CardContent>
      </Card>

      {/* Note d'information réglementaire */}
      <div className="p-6 rounded-3xl bg-sky-500/10 dark:bg-sky-950/20 border border-sky-500/20 flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shrink-0">
          <IoDocumentTextOutline className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold tracking-tight text-sky-900 dark:text-sky-200">Cahier de Liaison Numérique Réglementaire</h4>
          <p className="text-xs text-sky-800/90 dark:text-sky-300/90 font-medium leading-relaxed">
            Ce journal remplace le registre papier. Toutes les saisies sont horodatées de manière infalsifiable, signées par l'agent émetteur et archivées selon la norme HDS (Hébergement de Données de Santé).
          </p>
        </div>
      </div>

      {/* Modal Nouvelle Transmission */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden"
            >
              
              <div className="p-5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 border border-sky-200 dark:border-sky-800">
                    <IoDocumentTextOutline className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-black tracking-tight">Ajouter une Transmission Sanitaire</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <IoCloseOutline className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTransmission} className="p-6 space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Enfant concerné
                  </label>
                  <select
                    value={selectedEnfantId}
                    onChange={(e) => setSelectedEnfantId(e.target.value)}
                    className="w-full p-2.5 text-xs font-medium rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-sky-500 shadow-xs"
                  >
                    {enfants.map((e) => {
                      const age = e.dateNaissance
                        ? Math.floor(
                            (new Date().getTime() - new Date(e.dateNaissance).getTime()) /
                              (365.25 * 24 * 60 * 60 * 1000)
                          )
                        : 0;
                      return (
                        <option key={e.id} value={e.id}>
                          {e.prenom} {e.nom} ({age} ans)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Catégorie d'Événement
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['repas', 'sieste', 'soin', 'incident', 'observation'] as const).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTypeInput(t)}
                        className={`p-2.5 text-xs rounded-2xl border capitalize font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          typeInput === t
                            ? 'bg-sky-50 border-sky-300 text-sky-800 dark:bg-sky-950 dark:border-sky-800 dark:text-sky-300'
                            : 'bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        {getTypeIcon(t)}
                        <span>{t}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Description de la transmission
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Saisissez les détails observés (quantité bue, durée du sommeil, symptômes, comportement)..."
                    value={contenuInput}
                    onChange={(e) => setContenuInput(e.target.value)}
                    className="w-full p-3 text-xs font-medium rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-sky-500 shadow-xs resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Destinataire & Visibilité
                  </label>
                  <select
                    value={destinataireInput}
                    onChange={(e) => setDestinataireInput(e.target.value as any)}
                    className="w-full p-2.5 text-xs font-medium rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-sky-500 shadow-xs"
                  >
                    <option value="parent">Visible par les Parents & l'Équipe</option>
                    <option value="equipe">Restreint à l'Équipe Pédagogique</option>
                    <option value="medecin">Confidentiel Médical / RSAI</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="h-10 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 cursor-pointer"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="h-10 text-xs font-bold rounded-2xl bg-sky-600 hover:bg-sky-700 text-white cursor-pointer shadow-md"
                  >
                    Publier la Transmission
                  </Button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};