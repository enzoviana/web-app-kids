import React, { useState, useEffect, useMemo } from 'react';
import {
  IoDocumentTextOutline,
  IoAddOutline,
  IoSearchOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline,
  IoReloadOutline,
  IoBusinessOutline,
  IoCalendarOutline,
  IoStarOutline,
  IoStar,
} from 'react-icons/io5';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AppBackground } from '@/components/AppBackground';

interface Note {
  id: string;
  etablissement: string;
  date: Date;
  note: number;
  categorie: 'Conformité' | 'Hygiène' | 'Sécurité' | 'Encadrement' | 'Documentation';
  titre: string;
  contenu: string;
  auteur: string;
}

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategorie, setFilterCategorie] = useState<string>('all');

  // États des modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // États du formulaire
  const [formData, setFormData] = useState({
    etablissement: '',
    date: '',
    note: 5,
    categorie: 'Conformité' as Note['categorie'],
    titre: '',
    contenu: '',
  });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      // Simuler le chargement
      setTimeout(() => {
        setNotes([
          {
            id: '1',
            etablissement: 'Crèche Les Petits Loups',
            date: new Date('2026-09-10'),
            note: 5,
            categorie: 'Conformité',
            titre: 'Audit trimestriel - Excellent',
            contenu: 'Tous les documents sont à jour. Protocoles bien respectés. Personnel formé et compétent.',
            auteur: 'Sophie Martin',
          },
          {
            id: '2',
            etablissement: 'Multi-Accueil Montessori',
            date: new Date('2026-09-08'),
            note: 4,
            categorie: 'Hygiène',
            titre: 'Visite surprise - Satisfaisant',
            contenu: 'Bonne tenue générale. Quelques améliorations possibles au niveau du stockage des produits.',
            auteur: 'Sophie Martin',
          },
          {
            id: '3',
            etablissement: 'Jardin d\'Enfants Soleil',
            date: new Date('2026-09-05'),
            note: 3,
            categorie: 'Sécurité',
            titre: 'Points d\'attention identifiés',
            contenu: 'Mise à jour des registres nécessaire. Plan d\'évacuation à afficher plus visiblement.',
            auteur: 'Sophie Martin',
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Erreur chargement notes:', err);
      setLoading(false);
    }
  };

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchSearch =
        searchQuery === '' ||
        n.etablissement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.contenu.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategorie = filterCategorie === 'all' || n.categorie === filterCategorie;

      return matchSearch && matchCategorie;
    });
  }, [notes, searchQuery, filterCategorie]);

  const openCreateModal = () => {
    setFormData({
      etablissement: '',
      date: new Date().toISOString().split('T')[0],
      note: 5,
      categorie: 'Conformité',
      titre: '',
      contenu: '',
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    setSelectedNote(note);
    setFormData({
      etablissement: note.etablissement,
      date: note.date.toISOString().split('T')[0],
      note: note.note,
      categorie: note.categorie,
      titre: note.titre,
      contenu: note.contenu,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (note: Note) => {
    setSelectedNote(note);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async () => {
    setIsSaving(true);
    setTimeout(() => {
      alert('Note créée avec succès!');
      setIsCreateModalOpen(false);
      setIsSaving(false);
      loadNotes();
    }, 1000);
  };

  const handleEdit = async () => {
    setIsSaving(true);
    setTimeout(() => {
      alert('Note modifiée avec succès!');
      setIsEditModalOpen(false);
      setSelectedNote(null);
      setIsSaving(false);
      loadNotes();
    }, 1000);
  };

  const handleDelete = async () => {
    setIsSaving(true);
    setTimeout(() => {
      alert('Note supprimée!');
      setIsDeleteModalOpen(false);
      setSelectedNote(null);
      setIsSaving(false);
      loadNotes();
    }, 1000);
  };

  const renderStars = (note: number, interactive: boolean = false, onClick?: (value: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onClick && onClick(star)}
            className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
            disabled={!interactive}
          >
            {star <= note ? (
              <IoStar className="h-5 w-5 text-amber-500" />
            ) : (
              <IoStarOutline className="h-5 w-5 text-slate-300 dark:text-zinc-600" />
            )}
          </button>
        ))}
      </div>
    );
  };

  const getCategorieColor = (categorie: Note['categorie']) => {
    switch (categorie) {
      case 'Conformité':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';
      case 'Hygiène':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
      case 'Sécurité':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';
      case 'Encadrement':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800';
      case 'Documentation':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };

  if (loading) {
    return (
      <AppBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <IoReloadOutline className="h-12 w-12 text-fuchsia-600 mx-auto mb-3 animate-spin" />
            <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">Chargement des notes...</p>
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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Notes & Observations</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-fuchsia-50 dark:bg-fuchsia-950/50 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-800 shadow-xs">
                <IoDocumentTextOutline className="h-3.5 w-3.5" />
                Module Notes
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">
              Journal de vos observations sur les établissements
            </p>
          </div>

          <Button
            size="sm"
            onClick={openCreateModal}
            className="h-10 px-5 text-xs font-bold rounded-2xl bg-fuchsia-700 hover:bg-fuchsia-600 text-white transition-all shadow-md cursor-pointer"
          >
            <IoAddOutline className="h-4 w-4 mr-2" />
            Nouvelle note
          </Button>
        </div>

        {/* Filtres */}
        <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-md">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recherche */}
              <div className="relative">
                <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Rechercher par établissement ou titre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 text-xs rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 focus:border-fuchsia-500 focus:ring-fuchsia-500"
                />
              </div>

              {/* Filtre catégorie */}
              <Select value={filterCategorie} onValueChange={setFilterCategorie}>
                <SelectTrigger className="h-10 text-xs rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="Conformité">Conformité</SelectItem>
                  <SelectItem value="Hygiène">Hygiène</SelectItem>
                  <SelectItem value="Sécurité">Sécurité</SelectItem>
                  <SelectItem value="Encadrement">Encadrement</SelectItem>
                  <SelectItem value="Documentation">Documentation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Liste des notes */}
        {filteredNotes.length === 0 ? (
          <Card className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-md">
            <CardContent className="p-16 text-center">
            <IoDocumentTextOutline className="h-16 w-16 text-slate-300 dark:text-zinc-600 mx-auto mb-4" />
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
              {searchQuery || filterCategorie !== 'all'
                ? 'Aucune note ne correspond aux critères'
                : 'Aucune note enregistrée'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <IoBusinessOutline className="h-4 w-4 text-slate-400 shrink-0" />
                          <h3 className="text-sm font-bold truncate">{note.etablissement}</h3>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-2">
                          {note.titre}
                        </h4>
                        <div className="flex items-center gap-2">
                          {renderStars(note.note)}
                          <Badge className={`text-[10px] px-2 py-0.5 ${getCategorieColor(note.categorie)}`}>
                            {note.categorie}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700">
                      <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-3">
                        {note.contenu}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                        <IoCalendarOutline className="h-3.5 w-3.5" />
                        <span>{format(note.date, 'dd MMM yyyy', { locale: fr })}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(note)}
                          className="h-8 w-8 p-0 rounded-xl border-slate-200 dark:border-zinc-700 cursor-pointer"
                        >
                          <IoPencilOutline className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal(note)}
                          className="h-8 w-8 p-0 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/20 cursor-pointer"
                        >
                          <IoTrashOutline className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL DE CRÉATION */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl pointer-events-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-950/30 flex items-center justify-center border border-fuchsia-200 dark:border-fuchsia-800">
                      <IoAddOutline className="h-5 w-5 text-fuchsia-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black">Nouvelle Note</h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">Ajouter une observation</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="h-8 w-8 p-0 rounded-xl"
                  >
                    <IoCloseOutline className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-4">
                  <div className="space-y-4">
                    {/* Établissement */}
                    <div className="space-y-2">
                      <Label htmlFor="etablissement" className="text-xs font-bold">
                        Établissement *
                      </Label>
                      <Input
                        id="etablissement"
                        type="text"
                        value={formData.etablissement}
                        onChange={(e) => setFormData({ ...formData, etablissement: e.target.value })}
                        placeholder="Crèche Les Petits Loups"
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Date */}
                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-xs font-bold">
                          Date *
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="h-10 text-xs rounded-2xl"
                        />
                      </div>

                      {/* Catégorie */}
                      <div className="space-y-2">
                        <Label htmlFor="categorie" className="text-xs font-bold">
                          Catégorie *
                        </Label>
                        <Select
                          value={formData.categorie}
                          onValueChange={(value) =>
                            setFormData({ ...formData, categorie: value as Note['categorie'] })
                          }
                        >
                          <SelectTrigger className="h-10 text-xs rounded-2xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Conformité">Conformité</SelectItem>
                            <SelectItem value="Hygiène">Hygiène</SelectItem>
                            <SelectItem value="Sécurité">Sécurité</SelectItem>
                            <SelectItem value="Encadrement">Encadrement</SelectItem>
                            <SelectItem value="Documentation">Documentation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">Note *</Label>
                      <div className="flex items-center gap-3">
                        {renderStars(formData.note, true, (value) => setFormData({ ...formData, note: value }))}
                        <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                          {formData.note}/5
                        </span>
                      </div>
                    </div>

                    {/* Titre */}
                    <div className="space-y-2">
                      <Label htmlFor="titre" className="text-xs font-bold">
                        Titre *
                      </Label>
                      <Input
                        id="titre"
                        type="text"
                        value={formData.titre}
                        onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                        placeholder="Audit trimestriel - Excellent"
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>

                    {/* Contenu */}
                    <div className="space-y-2">
                      <Label htmlFor="contenu" className="text-xs font-bold">
                        Observations détaillées *
                      </Label>
                      <Textarea
                        id="contenu"
                        value={formData.contenu}
                        onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                        placeholder="Notez vos observations détaillées..."
                        rows={6}
                        className="text-xs rounded-2xl resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={isSaving}
                    className="h-10 px-6 text-xs font-bold rounded-2xl"
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    disabled={
                      isSaving || !formData.etablissement || !formData.date || !formData.titre || !formData.contenu
                    }
                    className="h-10 px-6 text-xs font-bold rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700"
                  >
                    {isSaving ? (
                      <>
                        <IoReloadOutline className="h-4 w-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <IoCheckmarkCircleOutline className="h-4 w-4 mr-2" />
                        Créer la note
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL D'ÉDITION */}
      <AnimatePresence>
        {isEditModalOpen && selectedNote && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl pointer-events-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-950/30 flex items-center justify-center border border-fuchsia-200 dark:border-fuchsia-800">
                      <IoPencilOutline className="h-5 w-5 text-fuchsia-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black">Modifier la Note</h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">{selectedNote.etablissement}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditModalOpen(false)}
                    className="h-8 w-8 p-0 rounded-xl"
                  >
                    <IoCloseOutline className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-4">
                  <div className="space-y-4">
                    {/* Établissement */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-etablissement" className="text-xs font-bold">
                        Établissement *
                      </Label>
                      <Input
                        id="edit-etablissement"
                        type="text"
                        value={formData.etablissement}
                        onChange={(e) => setFormData({ ...formData, etablissement: e.target.value })}
                        placeholder="Crèche Les Petits Loups"
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Date */}
                      <div className="space-y-2">
                        <Label htmlFor="edit-date" className="text-xs font-bold">
                          Date *
                        </Label>
                        <Input
                          id="edit-date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="h-10 text-xs rounded-2xl"
                        />
                      </div>

                      {/* Catégorie */}
                      <div className="space-y-2">
                        <Label htmlFor="edit-categorie" className="text-xs font-bold">
                          Catégorie *
                        </Label>
                        <Select
                          value={formData.categorie}
                          onValueChange={(value) =>
                            setFormData({ ...formData, categorie: value as Note['categorie'] })
                          }
                        >
                          <SelectTrigger className="h-10 text-xs rounded-2xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Conformité">Conformité</SelectItem>
                            <SelectItem value="Hygiène">Hygiène</SelectItem>
                            <SelectItem value="Sécurité">Sécurité</SelectItem>
                            <SelectItem value="Encadrement">Encadrement</SelectItem>
                            <SelectItem value="Documentation">Documentation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">Note *</Label>
                      <div className="flex items-center gap-3">
                        {renderStars(formData.note, true, (value) => setFormData({ ...formData, note: value }))}
                        <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                          {formData.note}/5
                        </span>
                      </div>
                    </div>

                    {/* Titre */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-titre" className="text-xs font-bold">
                        Titre *
                      </Label>
                      <Input
                        id="edit-titre"
                        type="text"
                        value={formData.titre}
                        onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                        placeholder="Audit trimestriel - Excellent"
                        className="h-10 text-xs rounded-2xl"
                      />
                    </div>

                    {/* Contenu */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-contenu" className="text-xs font-bold">
                        Observations détaillées *
                      </Label>
                      <Textarea
                        id="edit-contenu"
                        value={formData.contenu}
                        onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                        placeholder="Notez vos observations détaillées..."
                        rows={6}
                        className="text-xs rounded-2xl resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={isSaving}
                    className="h-10 px-6 text-xs font-bold rounded-2xl"
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEdit}
                    disabled={
                      isSaving || !formData.etablissement || !formData.date || !formData.titre || !formData.contenu
                    }
                    className="h-10 px-6 text-xs font-bold rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700"
                  >
                    {isSaving ? (
                      <>
                        <IoReloadOutline className="h-4 w-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <IoCheckmarkCircleOutline className="h-4 w-4 mr-2" />
                        Enregistrer les modifications
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL DE SUPPRESSION */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedNote && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <Card className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl pointer-events-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center border border-rose-200 dark:border-rose-800">
                      <IoTrashOutline className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black">Supprimer la Note</h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">Cette action est irréversible</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="h-8 w-8 p-0 rounded-xl"
                  >
                    <IoCloseOutline className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
                    <p className="text-sm font-medium text-rose-900 dark:text-rose-300">
                      Êtes-vous sûr de vouloir supprimer cette note ?
                    </p>
                    <p className="text-xs text-rose-700 dark:text-rose-400 mt-2">
                      La note "<span className="font-bold">{selectedNote.titre}</span>" sera définitivement supprimée.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-zinc-800">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isSaving}
                    className="h-10 px-6 text-xs font-bold rounded-2xl"
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="h-10 px-6 text-xs font-bold rounded-2xl bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    {isSaving ? (
                      <>
                        <IoReloadOutline className="h-4 w-4 mr-2 animate-spin" />
                        Suppression...
                      </>
                    ) : (
                      <>
                        <IoTrashOutline className="h-4 w-4 mr-2" />
                        Supprimer
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

        {/* Professional Footer */}
        <footer className="mt-8 pt-6 border-t border-slate-200 dark:border-zinc-800 text-center">
          <p className="text-xs text-slate-500 dark:text-zinc-500 font-medium">
            Kids'Med IA © 2026 - Carnet de Notes RSAI
          </p>
        </footer>
      </motion.div>
    </AppBackground>
  );
};
