import React, { useState, useMemo, useEffect } from 'react';
import {
  IoHelpCircleOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoPersonOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoChatbubbleEllipsesOutline,
  IoChevronBack,
  IoMailOutline,
  IoCallOutline,
  IoBugOutline,
  IoSparklesOutline,
  IoWarningOutline,
  IoRefreshOutline,
  IoAlertCircleOutline,
  IoSendOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { messageApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface SupportTicket {
  id: string;
  numero: string;
  utilisateur: {
    nom: string;
    prenom: string;
    role: string;
    email: string;
    telephone?: string;
  };
  sujet: string;
  description: string;
  categorie: 'bug' | 'feature' | 'question' | 'incident' | 'autre';
  priorite: 'basse' | 'moyenne' | 'haute' | 'critique';
  statut: 'ouvert' | 'en_cours' | 'en_attente' | 'resolu' | 'ferme';
  dateCreation: Date;
  dateModification: Date;
  tempsReponse?: string;
  messages: number;
}

export const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<'tous' | 'ouvert' | 'en_cours' | 'en_attente' | 'resolu' | 'ferme'>('tous');
  const [filterPriorite, setFilterPriorite] = useState<'tous' | 'basse' | 'moyenne' | 'haute' | 'critique'>('tous');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  // États pour les données backend
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour le nouveau formulaire de ticket support
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    sujet: '',
    description: '',
    categorie: 'question' as 'bug' | 'feature' | 'question' | 'incident' | 'autre',
    priorite: 'moyenne' as 'basse' | 'moyenne' | 'haute' | 'critique',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Note: La page Support affiche des données mockées car le système de tickets
  // n'est pas encore implémenté côté backend. Le formulaire envoie les données
  // à la console pour test.
  useEffect(() => {
    // Utiliser des données mockées pour l'instant
    loadMockTickets();
  }, []);

  const loadMockTickets = () => {
    setTickets([
      {
        id: 'ticket-1',
        numero: 'SUPP-2024-0045',
        utilisateur: {
          nom: 'Lefebvre',
          prenom: 'Marie',
          role: 'Directrice',
          email: 'marie.lefebvre@petitslutins.fr',
          telephone: '01 42 56 78 90',
        },
        sujet: 'Impossible d\'ajouter un nouveau PAI pour un enfant',
        description: 'Lorsque j\'essaie d\'ajouter un nouveau PAI depuis la fiche enfant, le formulaire se bloque après avoir rempli les champs. Le bouton "Enregistrer" ne répond pas.',
        categorie: 'bug',
        priorite: 'haute',
        statut: 'ouvert',
        dateCreation: new Date(),
        dateModification: new Date(),
        messages: 0,
      },
      {
        id: 'ticket-2',
        numero: 'SUPP-2024-0044',
        utilisateur: {
          nom: 'Martin',
          prenom: 'Dr Claire',
          role: 'Pédiatre',
          email: 'dr.martin@sante.fr',
          telephone: '01 45 67 89 01',
        },
        sujet: 'Export PDF des ordonnances ne fonctionne pas',
        description: 'Depuis ce matin, impossible d\'exporter les ordonnances en PDF. Un message d\'erreur "Échec du téléchargement" s\'affiche systématiquement.',
        categorie: 'incident',
        priorite: 'haute',
        statut: 'en_cours',
        dateCreation: new Date(Date.now() - 3 * 60 * 60 * 1000),
        dateModification: new Date(Date.now() - 30 * 60 * 1000),
        tempsReponse: '15 min',
        messages: 3,
      },
      {
        id: 'ticket-3',
        numero: 'SUPP-2024-0043',
        utilisateur: {
          nom: 'Garcia',
          prenom: 'Carlos',
          role: 'Inspecteur RSAI',
          email: 'carlos.garcia@rsai.gouv.fr',
          telephone: '01 56 78 90 12',
        },
        sujet: 'Geofencing bloqué malgré présence sur site',
        description: 'Le système de geofencing me bloque l\'accès aux dossiers alors que je suis physiquement présent dans l\'établissement Les Petits Lutins.',
        categorie: 'bug',
        priorite: 'critique',
        statut: 'resolu',
        dateCreation: new Date(Date.now() - 24 * 60 * 60 * 1000),
        dateModification: new Date(Date.now() - 12 * 60 * 60 * 1000),
        tempsReponse: '8 min',
        messages: 7,
      },
    ]);
  };

  // Filtrage des tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.sujet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.numero.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatut = filterStatut === 'tous' || ticket.statut === filterStatut;
      const matchesPriorite = filterPriorite === 'tous' || ticket.priorite === filterPriorite;

      return matchesSearch && matchesStatut && matchesPriorite;
    });
  }, [tickets, searchTerm, filterStatut, filterPriorite]);

  // Statistiques
  const stats = useMemo(() => {
    const total = tickets.length;
    const ouverts = tickets.filter(t => t.statut === 'ouvert').length;
    const enCours = tickets.filter(t => t.statut === 'en_cours').length;
    const resolus = tickets.filter(t => t.statut === 'resolu' || t.statut === 'ferme').length;
    const critiques = tickets.filter(t => t.priorite === 'critique' && t.statut !== 'resolu' && t.statut !== 'ferme').length;

    return { total, ouverts, enCours, resolus, critiques };
  }, [tickets]);

  const getCategorieBadgeStyle = (categorie: string) => {
    switch (categorie) {
      case 'bug':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'incident':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'feature':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'question':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';
    }
  };

  const getPrioriteBadgeStyle = (priorite: string) => {
    switch (priorite) {
      case 'critique':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'haute':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'moyenne':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'basse':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  const getStatutBadgeStyle = (statut: string) => {
    switch (statut) {
      case 'ouvert':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'en_cours':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'en_attente':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'resolu':
      case 'ferme':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  const getCategorieIcon = (categorie: string) => {
    switch (categorie) {
      case 'bug':
        return <IoBugOutline className="h-4 w-4" />;
      case 'incident':
        return <IoWarningOutline className="h-4 w-4" />;
      case 'feature':
        return <IoSparklesOutline className="h-4 w-4" />;
      case 'question':
        return <IoHelpCircleOutline className="h-4 w-4" />;
      default:
        return <IoChatbubbleEllipsesOutline className="h-4 w-4" />;
    }
  };

  const handleResolve = (id: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, statut: 'resolu' as const, dateModification: new Date() } : t));
  };

  const handleTakeCharge = (id: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, statut: 'en_cours' as const, dateModification: new Date(), tempsReponse: 'Maintenant' } : t));
  };

  // Soumettre un nouveau ticket support
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTicket.sujet || !newTicket.description) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Pour l'instant, on log les données en console car le système de tickets
      // n'est pas encore implémenté côté backend
      console.log('Nouveau ticket support soumis:', {
        utilisateur: user,
        sujet: newTicket.sujet,
        description: newTicket.description,
        categorie: newTicket.categorie,
        priorite: newTicket.priorite,
        dateCreation: new Date(),
      });

      // Réinitialiser le formulaire
      setNewTicket({
        sujet: '',
        description: '',
        categorie: 'question',
        priorite: 'moyenne',
      });
      setShowNewTicketForm(false);

      // Message de succès
      alert('Ticket support soumis avec succès! (Les données ont été loguées dans la console)');
    } catch (err: any) {
      console.error('Erreur lors de la soumission du ticket:', err);
      setError(err.response?.data?.error || 'Impossible de soumettre le ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-10 space-y-8 bg-slate-50/50 dark:bg-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 font-sans antialiased"
    >
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-sm">
              <IoHelpCircleOutline className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Support Utilisateur & Tickets
                </h1>
                {stats.critiques > 0 && (
                  <Badge className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                    {stats.critiques} CRITIQUE{stats.critiques > 1 ? 'S' : ''}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Gestion centralisée des demandes de support, incidents et questions utilisateurs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="default"
            size="sm"
            className="h-10 px-4 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
            onClick={() => setShowNewTicketForm(!showNewTicketForm)}
          >
            <IoSendOutline className="h-4 w-4 mr-1.5" />
            Nouveau ticket
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-4 text-xs font-semibold rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition-all cursor-pointer"
            onClick={() => navigate('/developpeur')}
          >
            <IoChevronBack className="h-4 w-4 mr-1.5" />
            Retour console
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs border-l-4 border-l-rose-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Tickets Ouverts
            </CardTitle>
            <IoCloseCircleOutline className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 font-mono">
              {stats.ouverts}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
              En attente de prise en charge
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              En Cours
            </CardTitle>
            <IoChatbubbleEllipsesOutline className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              {stats.enCours}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
              En cours de traitement
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Résolus
            </CardTitle>
            <IoCheckmarkCircleOutline className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.resolus}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
              Tickets clôturés
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Total
            </CardTitle>
            <IoHelpCircleOutline className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              {stats.total}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
              Tous les tickets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire nouveau ticket */}
      {showNewTicketForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="rounded-2xl border border-purple-200/80 dark:border-purple-800 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-zinc-800 px-6 pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IoSendOutline className="h-5 w-5 text-purple-600" />
                    Nouveau ticket support
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Décrivez votre problème ou question
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewTicketForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-400">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Catégorie
                    </label>
                    <Select
                      value={newTicket.categorie}
                      onValueChange={(value: any) => setNewTicket({ ...newTicket, categorie: value })}
                    >
                      <SelectTrigger className="h-10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="incident">Incident</SelectItem>
                        <SelectItem value="feature">Demande de fonctionnalité</SelectItem>
                        <SelectItem value="question">Question</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Priorité
                    </label>
                    <Select
                      value={newTicket.priorite}
                      onValueChange={(value: any) => setNewTicket({ ...newTicket, priorite: value })}
                    >
                      <SelectTrigger className="h-10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basse">Basse</SelectItem>
                        <SelectItem value="moyenne">Moyenne</SelectItem>
                        <SelectItem value="haute">Haute</SelectItem>
                        <SelectItem value="critique">Critique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Sujet
                  </label>
                  <Input
                    value={newTicket.sujet}
                    onChange={(e) => setNewTicket({ ...newTicket, sujet: e.target.value })}
                    placeholder="Résumé court du problème"
                    className="h-10 text-xs"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Description détaillée
                  </label>
                  <Textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    placeholder="Décrivez le problème en détail..."
                    className="min-h-[120px] text-xs"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewTicketForm(false)}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <IoRefreshOutline className="h-4 w-4 mr-1.5 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <IoSendOutline className="h-4 w-4 mr-1.5" />
                        Soumettre le ticket
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filtres */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher par sujet, utilisateur ou numéro de ticket..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-xs bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <IoFilterOutline className="h-4 w-4 text-slate-400 shrink-0" />

              <Select value={filterStatut} onValueChange={(value: any) => setFilterStatut(value)}>
                <SelectTrigger className="w-full md:w-[140px] h-10 text-xs bg-slate-50/50 dark:bg-zinc-800/50 rounded-xl border-slate-200 dark:border-zinc-700">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous statuts</SelectItem>
                  <SelectItem value="ouvert">Ouverts</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="resolu">Résolus</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriorite} onValueChange={(value: any) => setFilterPriorite(value)}>
                <SelectTrigger className="w-full md:w-[140px] h-10 text-xs bg-slate-50/50 dark:bg-zinc-800/50 rounded-xl border-slate-200 dark:border-zinc-700">
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Toutes priorités</SelectItem>
                  <SelectItem value="critique">Critique</SelectItem>
                  <SelectItem value="haute">Haute</SelectItem>
                  <SelectItem value="moyenne">Moyenne</SelectItem>
                  <SelectItem value="basse">Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des tickets */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800 px-6 pt-6">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              File de tickets support
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {filteredTickets.length} ticket{filteredTickets.length > 1 ? 's' : ''} affiché{filteredTickets.length > 1 ? 's' : ''}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-zinc-500 text-xs">
              <IoCheckmarkCircleOutline className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
              <p>Aucun ticket ne correspond aux critères de recherche.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 px-6 hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedTicket(ticket.id === selectedTicket ? null : ticket.id)}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold text-xs">
                        {ticket.utilisateur.prenom[0]}{ticket.utilisateur.nom[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                              {ticket.numero}
                            </span>
                            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-semibold border ${getCategorieBadgeStyle(ticket.categorie)}`}>
                              {getCategorieIcon(ticket.categorie)}
                              <span className="ml-1">{ticket.categorie}</span>
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-semibold border ${getPrioriteBadgeStyle(ticket.priorite)}`}>
                              {ticket.priorite}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-medium border ${getStatutBadgeStyle(ticket.statut)}`}>
                              {ticket.statut}
                            </Badge>
                            {ticket.messages > 0 && (
                              <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400">
                                <IoChatbubbleEllipsesOutline className="h-3 w-3" />
                                {ticket.messages}
                              </span>
                            )}
                          </div>

                          <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 mb-2">
                            {ticket.sujet}
                          </h3>

                          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-zinc-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <IoPersonOutline className="h-3 w-3" />
                              {ticket.utilisateur.prenom} {ticket.utilisateur.nom} ({ticket.utilisateur.role})
                            </span>
                            <span className="flex items-center gap-1">
                              <IoTimeOutline className="h-3 w-3" />
                              {format(ticket.dateCreation, 'dd/MM/yyyy HH:mm', { locale: fr })}
                            </span>
                            {ticket.tempsReponse && (
                              <>
                                <span>•</span>
                                <span>Réponse: {ticket.tempsReponse}</span>
                              </>
                            )}
                          </div>

                          {selectedTicket === ticket.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-lg"
                            >
                              <p className="text-xs text-slate-700 dark:text-zinc-300 mb-3">
                                {ticket.description}
                              </p>
                              <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <IoMailOutline className="h-3 w-3 text-slate-400" />
                                  <span className="text-slate-600 dark:text-zinc-400">{ticket.utilisateur.email}</span>
                                </div>
                                {ticket.utilisateur.telephone && (
                                  <div className="flex items-center gap-2">
                                    <IoCallOutline className="h-3 w-3 text-slate-400" />
                                    <span className="text-slate-600 dark:text-zinc-400">{ticket.utilisateur.telephone}</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {ticket.statut === 'ouvert' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs font-semibold rounded-xl border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTakeCharge(ticket.id);
                              }}
                            >
                              Prendre en charge
                            </Button>
                          )}
                          {(ticket.statut === 'en_cours' || ticket.statut === 'en_attente') && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs font-semibold rounded-xl border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResolve(ticket.id);
                              }}
                            >
                              <IoCheckmarkCircleOutline className="h-3.5 w-3.5 mr-1" />
                              Résoudre
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
