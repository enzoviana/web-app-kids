import React, { useState, useEffect } from 'react';
import {
  IoMedkitOutline,
  IoAddOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoShieldCheckmarkOutline,
  IoPrintOutline,
  IoDocumentTextOutline,
  IoAlertCircleOutline,
  IoReloadOutline,
} from 'react-icons/io5';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { medicamentApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { AppBackground } from '@/components/AppBackground';

const DEFAULT_ETABLISSEMENT_ID = 'test-creche-001';

export const RegistreMedicamentsPage: React.FC = () => {
  const { user } = useAuth();

  // Role detection for theming
  const isCreche = user?.role === 'creche' || user?.role === 'professionnel';
  const isMedecin = user?.role === 'medecin';
  const isAuxiliaire = user?.role === 'auxiliaire' || user?.role === 'professionnel_puericulture';

  // Dynamic theme based on role
  const roleTheme = isCreche
    ? { primary: 'lime', hex: '#8BC34A', light: 'lime-50', dark: 'lime-950', border: 'lime-200', text: 'lime-600', darkText: 'lime-400' }
    : isMedecin
    ? { primary: 'cyan', hex: '#0099FF', light: 'cyan-50', dark: 'cyan-950', border: 'cyan-200', text: 'cyan-600', darkText: 'cyan-400' }
    : { primary: 'teal', hex: '#14B8A6', light: 'teal-50', dark: 'teal-950', border: 'teal-200', text: 'teal-600', darkText: 'teal-400' };

  const [medicaments, setMedicaments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    administrationsToday: 0,
    adminFaites: 0,
    tauxReussite: 100,
  });

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State pour nouvelle administration
  const [selectedMedicamentId, setSelectedMedicamentId] = useState('');
  const [heureInput, setHeureInput] = useState('14:00');
  const [observationsInput, setObservationsInput] = useState('');
  const [verifIdentite, setVerifIdentite] = useState(false);

  // Load data from backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load today's administrations
      const todayResponse = await medicamentApi.getAdministrationsToday(DEFAULT_ETABLISSEMENT_ID);
      setMedicaments(todayResponse.data || []);

      // Load stats
      const statsResponse = await medicamentApi.getMedicamentStats(DEFAULT_ETABLISSEMENT_ID);
      setStats(statsResponse.data || {
        total: 0,
        administrationsToday: 0,
        adminFaites: 0,
        tauxReussite: 100,
      });
    } catch (err: any) {
      console.error('❌ Erreur chargement médicaments:', err);
      setError(err.response?.data?.error || 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter medicaments
  const filteredMedicaments = medicaments.filter((med) => {
    const matchesSearch =
      med.enfant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.enfant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.nomMedicament.toLowerCase().includes(searchTerm.toLowerCase());

    // Check administration status
    const hasAdminToday = med.administrations && med.administrations.length > 0;
    const isAdministered = hasAdminToday && med.administrations.some((a: any) => a.statut === 'fait');

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'administre') return matchesSearch && isAdministered;
    if (filterStatus === 'a_venir') return matchesSearch && !isAdministered;

    return matchesSearch;
  });

  const handleAddAdministration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifIdentite || !selectedMedicamentId || !user) return;

    try {
      const todayDate = new Date();
      const [hours, minutes] = heureInput.split(':').map(Number);
      todayDate.setHours(hours || 12, minutes || 0);

      const selectedMed = medicaments.find(m => m.id === selectedMedicamentId);
      if (!selectedMed) {
        alert('Médicament non trouvé');
        return;
      }

      await medicamentApi.createAdministration(selectedMedicamentId, {
        enfantId: selectedMed.enfantId,
        dateHeure: todayDate.toISOString(),
        statut: 'fait',
        administrePar: user.id,
        administreParNom: `${user.profile?.prenom} ${user.profile?.nom}`,
        commentaire: observationsInput || undefined,
      });

      console.log('✅ Administration enregistrée');

      // Réinitialiser l'état
      setIsModalOpen(false);
      setSelectedMedicamentId('');
      setObservationsInput('');
      setVerifIdentite(false);
      setHeureInput('14:00');

      // Recharger les données
      await loadData();
    } catch (err: any) {
      console.error('❌ Erreur enregistrement administration:', err);
      alert(err.response?.data?.error || 'Erreur lors de l\'enregistrement');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <AppBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <IoReloadOutline className={`h-12 w-12 mx-auto animate-spin ${isCreche ? 'text-lime-600' : isMedecin ? 'text-cyan-600' : 'text-teal-600'}`} />
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
              Chargement du registre médicaments...
            </p>
          </div>
        </div>
      </AppBackground>
    );
  }

  // Error state
  if (error) {
    return (
      <AppBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4 max-w-md">
            <IoAlertCircleOutline className="h-12 w-12 text-rose-500 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">Erreur de chargement</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">{error}</p>
            <Button
              size="sm"
              onClick={loadData}
              className={`${isCreche ? 'bg-lime-700 hover:bg-lime-600' : isMedecin ? 'bg-cyan-700 hover:bg-cyan-600' : 'bg-teal-700 hover:bg-teal-600'}`}
            >
              <IoReloadOutline className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 text-slate-900 dark:text-zinc-100"
      >

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Registre d'Administration des Médicaments</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-${roleTheme.light} dark:bg-${roleTheme.dark}/50 text-${roleTheme.text} dark:text-${roleTheme.darkText} border border-${roleTheme.border} dark:border-${roleTheme.dark.replace('950', '800')} shadow-xs`}
                style={{
                  backgroundColor: `color-mix(in srgb, ${roleTheme.hex} 10%, transparent)`,
                  borderColor: `color-mix(in srgb, ${roleTheme.hex} 30%, transparent)`,
                  color: roleTheme.hex
                }}
              >
                <IoShieldCheckmarkOutline className="h-3.5 w-3.5" />
                Conforme PMI / ARS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">
              Traçabilité horodatée et infalsifiable des soins et traitements administrés.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" className="h-10 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 transition-all cursor-pointer">
              <IoPrintOutline className="mr-1.5 h-4 w-4 text-slate-500" />
              Émargement PMI
            </Button>
          </div>
        </div>

        {/* Analytics KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

          <Card className={`rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden relative border-l-4`}
            style={{ borderLeftColor: roleTheme.hex }}
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">Soins du Jour</p>
                <p className="text-3xl font-black tracking-tight mt-2 text-slate-900 dark:text-zinc-100">{stats.administrationsToday}</p>
              </div>
              <div className="p-3 rounded-2xl border shadow-xs" style={{
                backgroundColor: `color-mix(in srgb, ${roleTheme.hex} 10%, transparent)`,
                borderColor: `color-mix(in srgb, ${roleTheme.hex} 30%, transparent)`,
                color: roleTheme.hex
              }}>
                <IoMedkitOutline className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className={`rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden relative border-l-4`}
            style={{ borderLeftColor: roleTheme.hex }}
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">Administrés</p>
                <p className="text-3xl font-black tracking-tight mt-2" style={{ color: roleTheme.hex }}>{stats.adminFaites}</p>
              </div>
              <div className="p-3 rounded-2xl border shadow-xs" style={{
                backgroundColor: `color-mix(in srgb, ${roleTheme.hex} 10%, transparent)`,
                borderColor: `color-mix(in srgb, ${roleTheme.hex} 30%, transparent)`,
                color: roleTheme.hex
              }}>
                <IoCheckmarkCircleOutline className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden relative border-l-4 border-l-amber-500">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">Prises à Venir</p>
                <p className="text-3xl font-black tracking-tight mt-2 text-amber-600 dark:text-amber-400">{stats.administrationsToday - stats.adminFaites}</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800 shadow-xs">
                <IoTimeOutline className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className={`rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden relative border-l-4`}
            style={{ borderLeftColor: roleTheme.hex }}
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">Conformité PAI</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-xl border w-fit" style={{
                  backgroundColor: `color-mix(in srgb, ${roleTheme.hex} 10%, transparent)`,
                  borderColor: `color-mix(in srgb, ${roleTheme.hex} 30%, transparent)`,
                  color: roleTheme.hex
                }}>
                  <IoShieldCheckmarkOutline className="h-4 w-4" /> 100% Validés
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Registry Table Section */}
        <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden">
        
          {/* Header & Filter Controls */}
          <div className="p-5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par enfant ou médicament..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-2xl focus:outline-none transition-all"
                style={{
                  borderColor: searchTerm ? roleTheme.hex : undefined
                }}
              />
            </div>

            <div className="flex items-center gap-1.5 w-full md:w-auto bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl border border-slate-200/80 dark:border-zinc-700">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === 'all'
                    ? 'text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
                style={filterStatus === 'all' ? { backgroundColor: roleTheme.hex } : {}}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterStatus('administre')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === 'administre'
                    ? 'text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
                style={filterStatus === 'administre' ? { backgroundColor: roleTheme.hex } : {}}
              >
                Administrés
              </button>
              <button
                onClick={() => setFilterStatus('a_venir')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === 'a_venir'
                    ? 'text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
                style={filterStatus === 'a_venir' ? { backgroundColor: roleTheme.hex } : {}}
              >
                À Venir
              </button>
            </div>
          </div>

        <CardContent className="p-0">
          {/* Table Container */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200/80 dark:border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-xs font-extrabold text-slate-500 dark:text-zinc-400 pl-5">Heure</TableHead>
                  <TableHead className="text-xs font-extrabold text-slate-500 dark:text-zinc-400">Enfant / Patient</TableHead>
                  <TableHead className="text-xs font-extrabold text-slate-500 dark:text-zinc-400">Médicament & Posologie</TableHead>
                  <TableHead className="text-xs font-extrabold text-slate-500 dark:text-zinc-400">Ordonnance Liée</TableHead>
                  <TableHead className="text-xs font-extrabold text-slate-500 dark:text-zinc-400">Administré Par</TableHead>
                  <TableHead className="text-xs font-extrabold text-slate-500 dark:text-zinc-400">Observations / RCR</TableHead>
                  <TableHead className="text-right text-xs font-extrabold text-slate-500 dark:text-zinc-400 pr-5">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-200/60 dark:divide-zinc-800/60">
                {filteredMedicaments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">
                      Aucun médicament à administrer aujourd'hui
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMedicaments.map((med) => {
                    const lastAdmin = med.administrations && med.administrations[0];
                    const isAdministered = lastAdmin && lastAdmin.statut === 'fait';
                    const age = med.enfant.dateNaissance
                      ? Math.floor((new Date().getTime() - new Date(med.enfant.dateNaissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                      : 0;

                    return (
                      <TableRow key={med.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">

                        <TableCell className="font-mono font-bold text-slate-700 dark:text-zinc-300 py-4 pl-5">
                          {med.frequence}
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 rounded-2xl border border-teal-500/25 shadow-xs">
                              <AvatarImage src={med.enfant.photo} />
                              <AvatarFallback className="text-xs font-extrabold bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200">
                                {med.enfant.prenom[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100">
                                  {med.enfant.prenom} {med.enfant.nom}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold mt-0.5 block">{age} ans</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <div>
                            <p className="text-xs font-extrabold text-slate-900 dark:text-zinc-100">{med.nomMedicament}</p>
                            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono font-medium">{med.dosage}</p>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          {med.numerOrdonnance && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-2.5 py-1 rounded-xl border border-slate-200/80 dark:border-zinc-700 shadow-xs">
                              <IoDocumentTextOutline className="h-3 w-3 text-slate-400" />
                              {med.numerOrdonnance}
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="py-4 text-xs text-slate-600 dark:text-zinc-300 font-medium">
                          {lastAdmin?.administreParNom || '—'}
                        </TableCell>

                        <TableCell className="py-4 text-xs text-slate-500 dark:text-zinc-400 max-w-xs italic font-normal">
                          {lastAdmin?.commentaire || med.indication || '—'}
                        </TableCell>

                        <TableCell className="text-right py-4 pr-5">
                          {isAdministered ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/40 px-2.5 py-1 rounded-xl shadow-xs">
                              <IoCheckmarkCircleOutline className="h-3 w-3" />
                              Administré
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedMedicamentId(med.id);
                                setIsModalOpen(true);
                              }}
                              className="h-7 text-[10px] font-bold px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 cursor-pointer"
                            >
                              <IoAddOutline className="h-3 w-3 mr-1" />
                              Administrer
                            </Button>
                          )}
                        </TableCell>

                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

        {/* Rappel Réglementaire Banderole */}
        <div className="p-6 rounded-xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <IoAlertCircleOutline className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold tracking-tight text-amber-900 dark:text-amber-200">Obligation de Traçabilité Sanitaire (Décret PMI/EAJE)</h4>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/90 font-medium leading-relaxed">
              Tout acte d'administration de médicament en structure d'accueil doit obligatoirement correspondre à une ordonnance médicale en cours de validité. L'agent doit impérativement vérifier l'identité de l'enfant, la concordance du produit, la posologie prescrite et consigner immédiatement la prise dans ce registre.
            </p>
          </div>
        </div>

      {/* Modal d'Administration / Consignation */}
      <AnimatePresence>
        {isModalOpen && selectedMedicamentId && (
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
                    <IoMedkitOutline className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-black tracking-tight">Enregistrer l'Administration</h3>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedMedicamentId('');
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <IoCloseOutline className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddAdministration} className="p-6 space-y-4">

                {/* Informations du médicament (lecture seule) */}
                {selectedMedicamentId && (() => {
                  const selectedMed = medicaments.find(m => m.id === selectedMedicamentId);
                  if (!selectedMed) return null;

                  const age = selectedMed.enfant.dateNaissance
                    ? Math.floor((new Date().getTime() - new Date(selectedMed.enfant.dateNaissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                    : 0;

                  return (
                    <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                          Enfant concerné
                        </label>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-2xl border border-teal-500/25">
                            <AvatarImage src={selectedMed.enfant.photo} />
                            <AvatarFallback className="text-xs font-extrabold bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200">
                              {selectedMed.enfant.prenom[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                              {selectedMed.enfant.prenom} {selectedMed.enfant.nom}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">{age} ans</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-600 dark:text-zinc-400 mb-1">
                            Médicament
                          </label>
                          <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{selectedMed.nomMedicament}</p>
                        </div>
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-600 dark:text-zinc-400 mb-1">
                            Dosage
                          </label>
                          <p className="text-xs font-mono font-bold text-slate-900 dark:text-zinc-100">{selectedMed.dosage}</p>
                        </div>
                      </div>

                      {selectedMed.numerOrdonnance && (
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-600 dark:text-zinc-400 mb-1">
                            N° Ordonnance
                          </label>
                          <p className="text-xs font-mono font-bold text-slate-900 dark:text-zinc-100">{selectedMed.numerOrdonnance}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Heure d'administration */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-600 dark:text-zinc-400 mb-1.5">
                    Heure de prise
                  </label>
                  <input
                    type="time"
                    required
                    value={heureInput}
                    onChange={(e) => setHeureInput(e.target.value)}
                    className="w-full p-2.5 text-xs font-medium rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-teal-500 font-mono shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-600 dark:text-zinc-400 mb-1.5">
                    Observations / Réaction de l'enfant
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Température prise à 38.1°C avant administration. Pas de refus."
                    value={observationsInput}
                    onChange={(e) => setObservationsInput(e.target.value)}
                    className="w-full p-2.5 text-xs font-medium rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-teal-500 shadow-xs resize-none"
                  />
                </div>

                {/* Verification Checkbox */}
                <div className="p-4 bg-teal-50/60 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-800/60">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifIdentite}
                      onChange={(e) => setVerifIdentite(e.target.checked)}
                      className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <span className="text-[11px] text-teal-900 dark:text-teal-200 font-bold leading-relaxed">
                      Je confirme avoir vérifié l'identité de l'enfant, la concordance du produit avec l'ordonnance valide et la posologie exacte.
                    </span>
                  </label>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedMedicamentId('');
                      setObservationsInput('');
                      setVerifIdentite(false);
                    }}
                    className="h-10 text-xs font-bold rounded-2xl border-slate-200 dark:border-zinc-700 cursor-pointer"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={!verifIdentite || !selectedMedicamentId}
                    className="h-10 text-xs font-bold rounded-2xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    Valider & Émarger le Soin
                  </Button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        {/* Professional Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-200/80 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
              <span className="font-bold" style={{ color: roleTheme.hex }}>Kids'Med IA</span>
              <span>•</span>
              <span>© 2026 Tous droits réservés</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400">
              <a href="#" className="hover:text-slate-700 dark:hover:text-zinc-200 transition-colors font-medium">
                Centre d'aide
              </a>
              <span>•</span>
              <a href="#" className="hover:text-slate-700 dark:hover:text-zinc-200 transition-colors font-medium">
                Documentation
              </a>
            </div>
          </div>
        </footer>

      </motion.div>
    </AppBackground>
  );
};