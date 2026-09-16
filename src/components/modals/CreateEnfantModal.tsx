import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IoPersonAddOutline } from 'react-icons/io5';

interface CreateEnfantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnfantCreated: (enfantData: any) => void; // Changed to accept raw form data
}

export const CreateEnfantModal: React.FC<CreateEnfantModalProps> = ({
  isOpen,
  onClose,
  onEnfantCreated,
}) => {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    dateNaissance: '',
    groupeSanguin: '',
    photo: '',
    allergies: '',
    antecedents: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Préparer les données pour l'API backend
    const enfantData = {
      prenom: formData.prenom,
      nom: formData.nom,
      dateNaissance: new Date(formData.dateNaissance).toISOString(),
      groupeSanguin: formData.groupeSanguin || null,
      photo: formData.photo || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      allergies: formData.allergies
        ? formData.allergies.split(',').map(a => a.trim()).filter(a => a)
        : [],
      traitements: [], // Empty array for now
      statut: 'sain', // Default status
    };

    onEnfantCreated(enfantData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      prenom: '',
      nom: '',
      dateNaissance: '',
      groupeSanguin: '',
      photo: '',
      allergies: '',
      antecedents: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IoPersonAddOutline className="h-5 w-5" />
            Ajouter un nouvel enfant
          </DialogTitle>
          <DialogDescription>
            Créez la fiche d'un nouvel enfant. Un code confidentiel unique sera généré pour permettre aux parents de lier leur compte.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-zinc-800"
                placeholder="Prénom"
              />
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-zinc-800"
                placeholder="Nom"
              />
            </div>

            {/* Date de naissance */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Date de naissance <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.dateNaissance}
                onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-zinc-800"
              />
            </div>

            {/* Groupe sanguin */}
            <div>
              <label className="block text-sm font-medium mb-1">Groupe sanguin</label>
              <select
                value={formData.groupeSanguin}
                onChange={(e) => setFormData({ ...formData, groupeSanguin: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-zinc-800"
              >
                <option value="">Non renseigné</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-sm font-medium mb-1">URL Photo (optionnel)</label>
            <input
              type="url"
              value={formData.photo}
              onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-zinc-800"
              placeholder="https://example.com/photo.jpg"
            />
            <p className="text-xs text-slate-500 mt-1">Si vide, une photo aléatoire sera générée</p>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-sm font-medium mb-1">Allergies</label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-zinc-800"
              placeholder="Séparer par des virgules (ex: Arachides, Lait)"
            />
          </div>

          {/* Antécédents */}
          <div>
            <label className="block text-sm font-medium mb-1">Antécédents médicaux</label>
            <textarea
              value={formData.antecedents}
              onChange={(e) => setFormData({ ...formData, antecedents: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-zinc-800 resize-none"
              rows={3}
              placeholder="Séparer par des virgules"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" variant="default">
              Créer l'enfant
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
