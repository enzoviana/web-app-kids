import React, { useState, useEffect } from 'react';
import {
  IoWalletOutline,
  IoCreateOutline,
  IoCheckmarkCircleOutline,
  IoAddCircleOutline,
  IoCardOutline,
  IoStatsChartOutline,
  IoTrendingUp,
  IoChevronForward,
  IoAlertCircleOutline,
  IoRefreshOutline,
} from 'react-icons/io5';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { tarifApi, abonnementApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Tarif {
  _id: string;
  id?: string;
  plan: string;
  nom: string;
  description?: string;
  prixMensuel: number;
  prixAnnuel: number;
  fonctionnalites: any;
  limites: any;
  isActive: boolean;
}

interface Abonnement {
  _id: string;
  plan: string;
  statut: string;
}

export const GestionTarifsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTarif, setCurrentTarif] = useState<Tarif | null>(null);
  const [formData, setFormData] = useState({
    plan: '',
    nom: '',
    description: '',
    prixMensuel: 0,
    prixAnnuel: 0,
    capaciteMax: 0,
    fonctionnalites: [] as string[],
    isActive: true,
  });
  const [newFeature, setNewFeature] = useState('');

  // Empêcher l'accès si l'utilisateur n'est pas superadmin
  useEffect(() => {
    if (user && user.role !== 'superadmin') {
      console.log('User role:', user.role, '- redirecting...');
      navigate('/');
    }
  }, [user, navigate]);

  // Afficher un message pendant la vérification des permissions
  if (!user) {
    return (
      <div className="p-6 md:p-10 min-h-screen bg-slate-50/50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <IoRefreshOutline className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600 dark:text-zinc-400">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'superadmin') {
    return (
      <div className="p-6 md:p-10 min-h-screen bg-slate-50/50 dark:bg-zinc-950 flex items-center justify-center">
        <Card className="max-w-md w-full border-red-200 dark:border-red-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <IoAlertCircleOutline className="h-8 w-8 text-red-600" />
              <div>
                <CardTitle className="text-red-900 dark:text-red-100">Accès refusé</CardTitle>
                <CardDescription>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Charger les tarifs et abonnements au montage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger tous les tarifs
      const tarifsResponse = await tarifApi.getAllTarifs();
      console.log('Tarifs response:', tarifsResponse);
      setTarifs(tarifsResponse.data || []);

      // Charger tous les abonnements pour les statistiques
      try {
        const abonnementsResponse = await abonnementApi.getAllAbonnements();
        console.log('Abonnements response:', abonnementsResponse);
        setAbonnements(abonnementsResponse.data || []);
      } catch (abErr) {
        console.warn('Erreur chargement abonnements (non bloquant):', abErr);
        setAbonnements([]);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des données:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.error || err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTarif = () => {
    setCurrentTarif(null);
    setFormData({
      plan: '',
      nom: '',
      description: '',
      prixMensuel: 0,
      prixAnnuel: 0,
      capaciteMax: 0,
      fonctionnalites: [],
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleUpdateTarif = (tarifId: string) => {
    const tarif = tarifs.find(t => (t._id || t.id) === tarifId);
    if (!tarif) return;

    // Extraire capaciteMax des limites si c'est un objet JSON
    let capaciteMax = 0;
    if (tarif.limites && typeof tarif.limites === 'object') {
      capaciteMax = tarif.limites.enfants || 0;
    }

    // Extraire fonctionnalites si c'est un tableau
    let fonctionnalites: string[] = [];
    if (Array.isArray(tarif.fonctionnalites)) {
      fonctionnalites = [...tarif.fonctionnalites];
    } else if (tarif.fonctionnalites && typeof tarif.fonctionnalites === 'object') {
      // Si c'est un objet JSON, essayer d'extraire un tableau
      fonctionnalites = Array.isArray(tarif.fonctionnalites) ? tarif.fonctionnalites : [];
    }

    setCurrentTarif(tarif);
    setFormData({
      plan: tarif.plan,
      nom: tarif.nom,
      description: tarif.description || '',
      prixMensuel: tarif.prixMensuel,
      prixAnnuel: tarif.prixAnnuel,
      capaciteMax,
      fonctionnalites,
      isActive: tarif.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSaveTarif = async () => {
    try {
      setIsSaving(true);

      // Validation
      if (!formData.plan || !formData.nom || formData.prixMensuel <= 0) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Préparer les données au format attendu par le backend
      const dataToSend = {
        plan: formData.plan,
        nom: formData.nom,
        description: formData.description,
        prixMensuel: formData.prixMensuel,
        prixAnnuel: formData.prixAnnuel,
        fonctionnalites: formData.fonctionnalites,
        limites: {
          enfants: formData.capaciteMax === 999 ? -1 : formData.capaciteMax,
        },
        isActive: formData.isActive,
      };

      if (currentTarif) {
        // Mise à jour
        await tarifApi.updateTarif(currentTarif._id || currentTarif.id!, dataToSend);
        toast.success('Tarif mis à jour avec succès');
      } else {
        // Création
        await tarifApi.createTarif(dataToSend);
        toast.success('Tarif créé avec succès');
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde du tarif:', err);
      toast.error(err.response?.data?.error || 'Erreur lors de la sauvegarde du tarif');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        fonctionnalites: [...formData.fonctionnalites, newFeature.trim()],
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      fonctionnalites: formData.fonctionnalites.filter((_, i) => i !== index),
    });
  };

  const handleDesactiverTarif = async (tarifId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver ce tarif ?')) {
      return;
    }

    try {
      await tarifApi.desactiverTarif(tarifId);
      await loadData();
    } catch (err: any) {
      console.error('Erreur lors de la désactivation du tarif:', err);
      alert(err.response?.data?.error || 'Erreur lors de la désactivation du tarif');
    }
  };

  const handleDeleteTarif = async (tarifId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce tarif ? Cette action est irréversible.')) {
      return;
    }

    try {
      await tarifApi.deleteTarif(tarifId);
      await loadData();
    } catch (err: any) {
      console.error('Erreur lors de la suppression du tarif:', err);
      alert(err.response?.data?.error || 'Erreur lors de la suppression du tarif');
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 min-h-screen bg-slate-50/50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <IoRefreshOutline className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600 dark:text-zinc-400">Chargement des tarifs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-10 min-h-screen bg-slate-50/50 dark:bg-zinc-950 flex items-center justify-center">
        <Card className="max-w-md w-full border-red-200 dark:border-red-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <IoAlertCircleOutline className="h-8 w-8 text-red-600" />
              <div>
                <CardTitle className="text-red-900 dark:text-red-100">Erreur de chargement</CardTitle>
                <CardDescription>{error}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={loadData} className="w-full">
              <IoRefreshOutline className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-10 space-y-8 bg-slate-50/50 dark:bg-zinc-950 min-h-screen text-slate-900 dark:text-zinc-100 font-sans antialiased"
    >
      {/* Top Header Professionnel & Épuré (Aligné avec le Dashboard) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
              <IoWalletOutline className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Gestion des Tarifs
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Configuration et modification des plans d'abonnement de la plateforme
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-4 text-xs font-semibold rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition-all"
            onClick={() => navigate('/superadmin')}
          >
            Retour au tableau de bord
          </Button>
          <Button
            size="sm"
            className="h-10 px-4 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm cursor-pointer"
            onClick={handleCreateTarif}
          >
            <IoAddCircleOutline className="h-4 w-4 mr-2" />
            Nouveau plan
          </Button>
        </div>
      </div>

      {/* Grille des Plans Tarifaires */}
      {tarifs.length === 0 ? (
        <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardContent className="p-12 text-center">
            <IoWalletOutline className="h-16 w-16 mx-auto text-slate-300 dark:text-zinc-700 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Aucun tarif configuré
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
              Créez votre premier plan tarifaire pour commencer.
            </p>
            <Button onClick={handleCreateTarif} className="bg-blue-600 hover:bg-blue-700">
              <IoAddCircleOutline className="h-4 w-4 mr-2" />
              Créer un plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tarifs.map((tarif) => {
          const isPopular = tarif.plan === 'premium';
          const planIcons = {
            basic: IoCardOutline,
            premium: IoStatsChartOutline,
            enterprise: IoTrendingUp,
          };
          const Icon = planIcons[tarif.plan as keyof typeof planIcons] || IoCardOutline;

          return (
            <Card
              key={tarif._id}
              className={`rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs transition-all relative flex flex-col justify-between ${
                isPopular
                  ? 'ring-2 ring-blue-600 dark:ring-blue-500'
                  : ''
              }`}
            >
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${
                    tarif.plan === 'basic' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' :
                    tarif.plan === 'premium' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                    'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    {isPopular && (
                      <Badge className="bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md border-0">
                        Populaire
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] font-mono font-bold border-slate-200 dark:border-zinc-700 uppercase">
                      {tarif.plan}
                    </Badge>
                  </div>
                </div>

                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">{tarif.nom}</CardTitle>
                
                <div className="mt-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {tarif.prixMensuel}€
                    </span>
                    <span className="text-xs text-slate-500 dark:text-zinc-500">/mois</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1">
                    ou {tarif.prixAnnuel}€ par an (économie de{' '}
                    {Math.round(((tarif.prixMensuel * 12 - tarif.prixAnnuel) / (tarif.prixMensuel * 12)) * 100)}%)
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Capacité */}
                  <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                      Capacité maximale
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {tarif.limites?.enfants === -1 || tarif.limites?.enfants === 999 ? 'Illimitée' : `${tarif.limites?.enfants || 0} enfants`}
                    </span>
                  </div>

                  {/* Fonctionnalités */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Fonctionnalités incluses
                    </p>
                    <ul className="space-y-2">
                      {(Array.isArray(tarif.fonctionnalites) ? tarif.fonctionnalites : []).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <IoCheckmarkCircleOutline className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" />
                          <span className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                      {(!Array.isArray(tarif.fonctionnalites) || tarif.fonctionnalites.length === 0) && (
                        <li className="text-xs text-slate-400 italic">Aucune fonctionnalité définie</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full h-10 text-xs font-semibold rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition-all cursor-pointer"
                    onClick={() => handleUpdateTarif(tarif._id)}
                  >
                    <IoCreateOutline className="h-4 w-4 mr-2 text-blue-600" />
                    Modifier ce plan
                  </Button>
                  {!tarif.isActive ? (
                    <Badge variant="outline" className="w-full justify-center text-xs border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-400">
                      Plan désactivé
                    </Badge>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}

      {/* Statistiques d'utilisation des plans */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <IoStatsChartOutline className="h-5 w-5 text-blue-600" />
            Statistiques d'Abonnement
          </CardTitle>
          <CardDescription className="text-xs">
            Répartition des crèches et revenus générés par plan tarifaire
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tarifs.map((tarif) => {
              const count = abonnements.filter(
                ab => ab.plan === tarif.plan && ab.statut === 'actif'
              ).length;
              const revenue = count * tarif.prixMensuel;

              return (
                <div
                  key={tarif._id}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-200">{tarif.nom}</h4>
                    <Badge variant="outline" className="text-[10px] font-semibold border-slate-200 dark:border-zinc-700">
                      {count} crèche{count > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Prix mensuel / annuel</span>
                      <span className="font-semibold text-slate-700 dark:text-zinc-300">{tarif.prixMensuel}€ / {tarif.prixAnnuel}€</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200/50 dark:border-zinc-700 flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Revenu mensuel</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                        {revenue.toLocaleString('fr-FR')}€
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Guide de tarification */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <IoWalletOutline className="h-5 w-5 text-blue-600" />
            Guide de Tarification
          </CardTitle>
          <CardDescription className="text-xs">Recommandations d'attribution des formules</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4 space-y-3 text-xs text-slate-600 dark:text-zinc-400">
          <p>
            <strong className="text-slate-900 dark:text-white">Plan Basic :</strong> Idéal pour les petites structures (jusqu'à 15 enfants) souhaitant démarrer avec les fonctionnalités essentielles.
          </p>
          <p>
            <strong className="text-slate-900 dark:text-white">Plan Premium :</strong> Recommandé pour les crèches moyennes (jusqu'à 40 enfants) nécessitant des outils avancés comme le diagnostic IA et la messagerie sécurisée.
          </p>
          <p>
            <strong className="text-slate-900 dark:text-white">Plan Enterprise :</strong> Conçu pour les groupes de crèches ou grandes structures (capacité illimitée) avec besoin d'intégration API et support dédié.
          </p>
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
            <IoCheckmarkCircleOutline className="h-4 w-4 shrink-0" />
            <span>Tous les plans incluent la conformité HDS et le chiffrement bout-en-bout des données de santé.</span>
          </div>
        </CardContent>
      </Card>

      {/* Modal de création/édition de tarif */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentTarif ? 'Modifier le tarif' : 'Créer un nouveau tarif'}
            </DialogTitle>
            <DialogDescription>
              {currentTarif
                ? 'Modifiez les informations du plan tarifaire ci-dessous.'
                : 'Remplissez les informations pour créer un nouveau plan tarifaire.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Plan */}
            <div className="space-y-2">
              <Label htmlFor="plan">Plan <span className="text-red-500">*</span></Label>
              <Input
                id="plan"
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                placeholder="starter, essentiel, premium"
                disabled={!!currentTarif}
              />
              <p className="text-xs text-slate-500">Identifiant unique du plan (non modifiable après création)</p>
            </div>

            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du plan <span className="text-red-500">*</span></Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Plan Starter, Plan Essentiel, Plan Premium"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description courte du plan"
              />
            </div>

            {/* Prix */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prixMensuel">Prix mensuel (€) <span className="text-red-500">*</span></Label>
                <Input
                  id="prixMensuel"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.prixMensuel}
                  onChange={(e) => setFormData({ ...formData, prixMensuel: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prixAnnuel">Prix annuel (€) <span className="text-red-500">*</span></Label>
                <Input
                  id="prixAnnuel"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.prixAnnuel}
                  onChange={(e) => setFormData({ ...formData, prixAnnuel: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Capacité */}
            <div className="space-y-2">
              <Label htmlFor="capaciteMax">Capacité maximale (enfants)</Label>
              <Input
                id="capaciteMax"
                type="number"
                min="0"
                value={formData.capaciteMax}
                onChange={(e) => setFormData({ ...formData, capaciteMax: parseInt(e.target.value) || 0 })}
                placeholder="999 pour illimité"
              />
              <p className="text-xs text-slate-500">Utilisez 999 pour une capacité illimitée</p>
            </div>

            {/* Fonctionnalités */}
            <div className="space-y-2">
              <Label>Fonctionnalités incluses</Label>
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Ajouter une fonctionnalité"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddFeature} size="sm">
                  <IoAddCircleOutline className="h-4 w-4" />
                </Button>
              </div>
              {formData.fonctionnalites.length > 0 && (
                <ul className="space-y-2 mt-3">
                  {formData.fonctionnalites.map((feature, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                      <span className="text-sm flex items-center gap-2">
                        <IoCheckmarkCircleOutline className="h-4 w-4 text-blue-600" />
                        {feature}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFeature(idx)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Statut actif */}
            <div className="flex items-center space-x-2">
              <input
                id="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              <Label htmlFor="isActive" className="cursor-pointer">Plan actif</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveTarif}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <IoRefreshOutline className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <IoCheckmarkCircleOutline className="h-4 w-4 mr-2" />
                  {currentTarif ? 'Mettre à jour' : 'Créer'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};