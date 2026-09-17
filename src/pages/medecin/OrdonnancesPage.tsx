import React, { useState, useEffect } from 'react';
import {
  IoAddOutline,
  IoDocumentTextOutline,
  IoSearchOutline,
  IoDownloadOutline,
  IoPrintOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoMedicalOutline,
  IoCloseOutline,
  IoCalendarOutline,
  IoSparkles,
} from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ordonnanceApi, enfantApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { AppBackground } from '@/components/AppBackground';
import { motion } from 'framer-motion';

interface PrescriptionMedicament {
  nom: string;
  posologie: string;
  frequence: string;
}

interface Ordonnance {
  id: string;
  numero: string;
  enfant: {
    id: string;
    nom: string;
    prenom: string;
    photo?: string;
    age: number;
  };
  date: Date;
  medecin: string;
  medicaments: PrescriptionMedicament[];
  statut: 'active' | 'terminee' | 'a_renouveler';
  validiteJusquA: Date;
  autorisationCreche: boolean;
}

const DEFAULT_ETABLISSEMENT_ID = 'test-creche-001';

interface Enfant {
  _id: string;
  nom: string;
  prenom: string;
  age: number;
  photo?: string;
}

export const OrdonnancesPage: React.FC = () => {
  const { user } = useAuth();

  // State management
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([]);
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [selectedEnfantId, setSelectedEnfantId] = useState('');
  const [medName, setMedName] = useState('');
  const [medPoso, setMedPoso] = useState('');
  const [medFreq, setMedFreq] = useState('');
  const [dureeJours, setDureeJours] = useState('7');

  // Get medecin info from user
  const medecinId = user?.id || '';
  const medecinNom = user?.profile ? `Dr. ${user.profile.nom} ${user.profile.prenom}` : 'Médecin';

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Load ordonnances, enfants and stats in parallel
      const [ordonnancesRes, enfantsRes, statsRes] = await Promise.all([
        ordonnanceApi.getOrdonnancesByMedecin(medecinId),
        enfantApi.getEnfantsByEtablissement(DEFAULT_ETABLISSEMENT_ID),
        ordonnanceApi.getOrdonnanceStats(DEFAULT_ETABLISSEMENT_ID),
      ]);

      // Transform ordonnances from backend format
      const transformedOrdonnances = ordonnancesRes.data.map((ord: any) => ({
        id: ord._id,
        numero: ord.numero,
        enfant: {
          id: ord.enfant._id,
          nom: ord.enfant.nom,
          prenom: ord.enfant.prenom,
          age: ord.enfant.age,
          photo: ord.enfant.photo,
        },
        date: new Date(ord.dateCreation),
        medecin: ord.medecin?.nom || medecinNom,
        medicaments: ord.medicaments.map((med: any) => ({
          nom: med.nom,
          posologie: med.posologie,
          frequence: med.frequence,
        })),
        statut: ord.statut,
        validiteJusquA: new Date(ord.validiteJusquA),
        autorisationCreche: ord.autorisationCreche,
      }));

      setOrdonnances(transformedOrdonnances);
      setEnfants(enfantsRes.data);
      setStats(statsRes.data);

      // Set default selected enfant
      if (enfantsRes.data.length > 0 && !selectedEnfantId) {
        setSelectedEnfantId(enfantsRes.data[0]._id);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrdonnances = ordonnances.filter((ord) => {
    const matchesSearch =
      ord.enfant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.enfant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.numero.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ord.statut === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount = stats?.actives || ordonnances.filter((o) => o.statut === 'active').length;
  const toRenewCount = stats?.aRenouveler || ordonnances.filter((o) => o.statut === 'a_renouveler').length;

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const targetEnfant = enfants.find((e) => e._id === selectedEnfantId);
      if (!targetEnfant) {
        throw new Error('Enfant non trouvé');
      }

      const ordonnanceData = {
        enfantId: selectedEnfantId,
        medecinId: medecinId,
        medicaments: [
          {
            nom: medName || 'Sérum Physiologique',
            posologie: medPoso || '1 dose',
            frequence: medFreq || '3x par jour',
          },
        ],
        validiteJours: parseInt(dureeJours) || 7,
        autorisationCreche: true,
      };

      const response = await ordonnanceApi.createOrdonnance(ordonnanceData);

      // Transform and add to list
      const newOrd: Ordonnance = {
        id: response.data._id,
        numero: response.data.numero,
        enfant: {
          id: targetEnfant._id,
          nom: targetEnfant.nom,
          prenom: targetEnfant.prenom,
          age: targetEnfant.age,
          photo: targetEnfant.photo,
        },
        date: new Date(response.data.dateCreation),
        medecin: medecinNom,
        medicaments: response.data.medicaments.map((med: any) => ({
          nom: med.nom,
          posologie: med.posologie,
          frequence: med.frequence,
        })),
        statut: response.data.statut,
        validiteJusquA: new Date(response.data.validiteJusquA),
        autorisationCreche: response.data.autorisationCreche,
      };

      setOrdonnances([newOrd, ...ordonnances]);
      setIsModalOpen(false);
      setMedName('');
      setMedPoso('');
      setMedFreq('');

      // Reload stats
      const statsRes = await ordonnanceApi.getOrdonnanceStats(DEFAULT_ETABLISSEMENT_ID);
      setStats(statsRes.data);
    } catch (err: any) {
      console.error('Error creating ordonnance:', err);
      setError(err.response?.data?.error || 'Erreur lors de la création de l\'ordonnance');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrdonnance = async (ordonnanceId: string, data: any) => {
    try {
      setLoading(true);
      setError(null);

      await ordonnanceApi.updateOrdonnance(ordonnanceId, data);

      // Reload data
      await loadData();
    } catch (err: any) {
      console.error('Error updating ordonnance:', err);
      setError(err.response?.data?.error || 'Erreur lors de la modification de l\'ordonnance');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrdonnance = async (ordonnanceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ordonnance ?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await ordonnanceApi.deleteOrdonnance(ordonnanceId);

      // Remove from list
      setOrdonnances(ordonnances.filter(ord => ord.id !== ordonnanceId));

      // Reload stats
      const statsRes = await ordonnanceApi.getOrdonnanceStats(DEFAULT_ETABLISSEMENT_ID);
      setStats(statsRes.data);
    } catch (err: any) {
      console.error('Error deleting ordonnance:', err);
      setError(err.response?.data?.error || 'Erreur lors de la suppression de l\'ordonnance');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading && ordonnances.length === 0) {
    return (
      <AppBackground>
        <div className="max-w-6xl mx-auto p-6 md:p-10 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 dark:border-cyan-400 mx-auto mb-4"></div>
            <p className="text-sm text-slate-600 dark:text-zinc-400">Chargement des ordonnances...</p>
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

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4 flex items-start gap-3">
          <IoAlertCircleOutline className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900 dark:text-red-200">Erreur</p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600 dark:hover:text-red-200"
          >
            <IoCloseOutline className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Top Bar Header */}
      <div className="border-b border-slate-200/80 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-2.5 mb-2">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">Gestionnaire de Prescriptions & Ordonnances</h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 shadow-xs">
            <IoSparkles className="h-3.5 w-3.5" />
            Médecin
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">
          Édition réglementaire, suivi des traitements et autorisations d'administration en crèche
        </p>

        <Button
          onClick={() => setIsModalOpen(true)}
          disabled={loading}
          className="bg-cyan-600 hover:bg-cyan-700 text-white h-9 text-xs font-semibold shrink-0 disabled:opacity-50"
        >
          <IoAddOutline className="h-4 w-4 mr-1.5" />
          Rédiger une Ordonnance
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Prescriptions Actives</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              <IoCheckmarkCircleOutline className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">À Renouveler / Expire</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{toRenewCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
              <IoAlertCircleOutline className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Total ce mois</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mt-1">{ordonnances.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
              <IoDocumentTextOutline className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Conformité HDS</p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                <IoMedicalOutline className="h-4 w-4" /> 100% Signées
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Main Table Card */}
      <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <CardHeader className="p-4 border-b border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold">Registre des Ordonnances Médicales</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-zinc-400">
              Historique des ordonnances valides pour l'administration des soins en crèche
            </CardDescription>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
            <Button
              variant={filterStatus === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStatus('all')}
              className="h-7 text-xs px-2.5"
            >
              Toutes
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStatus('active')}
              className="h-7 text-xs px-2.5"
            >
              Actives
            </Button>
            <Button
              variant={filterStatus === 'a_renouveler' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStatus('a_renouveler')}
              className="h-7 text-xs px-2.5"
            >
              À Renouveler
            </Button>
            <Button
              variant={filterStatus === 'terminee' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStatus('terminee')}
              className="h-7 text-xs px-2.5"
            >
              Terminées
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          
          {/* Search Input */}
          <div className="relative max-w-sm">
            <IoSearchOutline className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par enfant ou n° ordonnance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Ordonnances Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-zinc-800">
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-zinc-800/40 text-[10px] uppercase font-semibold text-slate-500">
                <TableRow>
                  <TableHead className="py-2.5">N° Ordonnance</TableHead>
                  <TableHead className="py-2.5">Enfant / Patient</TableHead>
                  <TableHead className="py-2.5">Prescripteur</TableHead>
                  <TableHead className="py-2.5">Traitements & Posologie</TableHead>
                  <TableHead className="py-2.5">Validité</TableHead>
                  <TableHead className="py-2.5">Statut</TableHead>
                  <TableHead className="py-2.5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredOrdonnances.map((ord) => (
                  <TableRow key={ord.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                    <TableCell className="font-mono text-slate-600 dark:text-zinc-400 font-semibold">
                      {ord.numero}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-cyan-100 text-cyan-800 text-[10px] font-bold">
                            {ord.enfant.prenom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-zinc-100">
                            {ord.enfant.prenom} {ord.enfant.nom}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">{ord.enfant.age} ans</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-600 dark:text-zinc-400 font-medium">
                      {ord.medecin}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 my-1">
                        {ord.medicaments.map((med, idx) => (
                          <div key={idx} className="bg-slate-50 dark:bg-zinc-800 p-1.5 rounded border border-slate-200/60 dark:border-zinc-700/60">
                            <span className="font-bold text-slate-900 dark:text-zinc-100">{med.nom}</span>
                            <span className="text-[10px] text-slate-500 block">
                              {med.posologie} · <span className="italic">{med.frequence}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-slate-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1">
                        <IoCalendarOutline className="h-3.5 w-3.5 text-slate-400" />
                        <span>{format(ord.validiteJusquA, 'dd/MM/yyyy', { locale: fr })}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {ord.statut === 'active' && (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 text-[10px]">
                          En cours
                        </Badge>
                      )}
                      {ord.statut === 'a_renouveler' && (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 text-[10px] animate-pulse">
                          À renouveler
                        </Badge>
                      )}
                      {ord.statut === 'terminee' && (
                        <Badge variant="outline" className="text-slate-400 text-[10px]">
                          Terminée
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Imprimer">
                          <IoPrintOutline className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Télécharger PDF">
                          <IoDownloadOutline className="h-4 w-4 text-slate-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Création d'Ordonnance Médicale */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <IoMedicalOutline className="h-5 w-5 text-cyan-600" />
                <h3 className="text-sm font-bold">Nouvelle Ordonnance Médicale</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <IoCloseOutline className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="p-4 space-y-4">
              
              {/* Sélecteur Patient */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Enfant concerné
                </label>
                <select
                  value={selectedEnfantId}
                  onChange={(e) => setSelectedEnfantId(e.target.value)}
                  className="w-full p-2 text-xs rounded-md bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  required
                >
                  {enfants.length === 0 ? (
                    <option value="">Aucun enfant disponible</option>
                  ) : (
                    enfants.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.prenom} {e.nom} ({e.age} ans)
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Détails du traitement */}
              <div className="space-y-3 p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800">
                <p className="text-[11px] font-bold text-slate-500 uppercase">Prescription Médicamenteuse</p>

                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-0.5">Dénomination du Médicament</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Paracétamol Sirop 2.4%"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    className="w-full p-2 text-xs rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-0.5">Posologie</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 1 dose poids (12kg)"
                      value={medPoso}
                      onChange={(e) => setMedPoso(e.target.value)}
                      className="w-full p-2 text-xs rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-0.5">Fréquence / Condition</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Si T° > 38.5°C"
                      value={medFreq}
                      onChange={(e) => setMedFreq(e.target.value)}
                      className="w-full p-2 text-xs rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-0.5">Durée du traitement (Jours)</label>
                  <input
                    type="number"
                    value={dureeJours}
                    onChange={(e) => setDureeJours(e.target.value)}
                    className="w-24 p-2 text-xs rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              {/* Engagement et validation */}
              <div className="p-3 bg-cyan-50/50 dark:bg-cyan-950/20 rounded-lg border border-cyan-200/50 dark:border-cyan-900/40 text-[11px] text-cyan-800 dark:text-cyan-300 flex items-start gap-2">
                <IoCheckmarkCircleOutline className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Cette ordonnance vaut autorisation d'administration pour l'équipe encadrante de la crèche.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                  className="h-8 text-xs"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading || enfants.length === 0}
                  className="h-8 text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-semibold disabled:opacity-50"
                >
                  {loading ? 'Création en cours...' : 'Signer & Délivrer l\'ordonnance'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-slate-200/80 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-bold text-cyan-600 dark:text-cyan-400">Kids'Med IA</span>
            <span>•</span>
            <span>© 2026 Tous droits réservés</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400">
            <a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Aide</a>
            <a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">CGU</a>
          </div>
        </div>
      </footer>
      </motion.div>
    </AppBackground>
  );
};