import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  IoMedicalOutline,
  IoAddCircleOutline,
  IoTrashOutline,
  IoSaveOutline,
  IoArrowBackOutline,
  IoWarningOutline,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5';
import { enfantApi } from '@/services/api';
import { toast } from 'sonner';
import type { Enfant, Vaccin } from '@/types';

/**
 * Page d'édition des informations médicales d'un enfant par les parents
 * Conforme CDC pages 2-3 : "Mise à jour infos médicales"
 *
 * Nécessite validation crèche/médecin avant prise en compte (simulation)
 */
export const EditMedicalInfoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [enfant, setEnfant] = useState<Enfant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // États du formulaire
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergie, setNewAllergie] = useState('');
  const [antecedents, setAntecedents] = useState<string[]>([]);
  const [newAntecedent, setNewAntecedent] = useState('');
  const [groupeSanguin, setGroupeSanguin] = useState('');
  const [vaccins, setVaccins] = useState<Vaccin[]>([]);
  const [newVaccin, setNewVaccin] = useState({ nom: '', date: '' });

  useEffect(() => {
    loadEnfant();
  }, [id]);

  const loadEnfant = async () => {
    try {
      setLoading(true);
      const response = await enfantApi.getEnfant(id!);
      const enfantData = response.data;

      setEnfant(enfantData);
      setAllergies(enfantData.allergies || []);
      setAntecedents(enfantData.antecedents || []);
      setGroupeSanguin(enfantData.groupeSanguin || '');
      setVaccins(enfantData.vaccins || []);
    } catch (error) {
      console.error('Erreur chargement enfant:', error);
      toast.error('Impossible de charger les informations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllergie = () => {
    if (newAllergie.trim()) {
      setAllergies([...allergies, newAllergie.trim()]);
      setNewAllergie('');
    }
  };

  const handleRemoveAllergie = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleAddAntecedent = () => {
    if (newAntecedent.trim()) {
      setAntecedents([...antecedents, newAntecedent.trim()]);
      setNewAntecedent('');
    }
  };

  const handleRemoveAntecedent = (index: number) => {
    setAntecedents(antecedents.filter((_, i) => i !== index));
  };

  const handleAddVaccin = () => {
    if (newVaccin.nom.trim() && newVaccin.date) {
      setVaccins([...vaccins, { ...newVaccin, nom: newVaccin.nom.trim() }]);
      setNewVaccin({ nom: '', date: '' });
    }
  };

  const handleRemoveVaccin = (index: number) => {
    setVaccins(vaccins.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // En mode démo : simulation de sauvegarde avec validation
      // En production : endpoint backend /api/enfants/:id/medical-update-request

      const updateData = {
        allergies,
        antecedents,
        groupeSanguin: groupeSanguin || enfant?.groupeSanguin,
        vaccins,
        // Métadonnées pour workflow de validation
        validation_requise: true,
        demande_parent: {
          date: new Date().toISOString(),
          type: 'mise_a_jour_medicale',
        },
      };

      // Mode démo : mise à jour directe
      await enfantApi.updateEnfant(id!, updateData);

      toast.success('✅ Demande de mise à jour envoyée', {
        description: 'Votre demande sera validée par la crèche ou le médecin',
        duration: 5000,
      });

      navigate('/parent/portail');
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Impossible d\'enregistrer les modifications');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!enfant) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <IoWarningOutline className="text-6xl text-red-500 mx-auto mb-4" />
            <p className="text-xl text-gray-700">Enfant non trouvé</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/parent/portail')} className="mb-4">
          <IoArrowBackOutline className="mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <IoMedicalOutline className="text-primary" />
          Modifier les informations médicales
        </h1>
        <p className="text-gray-600 mt-2">
          {enfant.prenom} {enfant.nom} · {enfant.age} ans
        </p>
      </div>

      {/* Alerte validation */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <IoShieldCheckmarkOutline className="text-2xl text-blue-600 flex-shrink-0 mt-1" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Validation requise</p>
              <p>
                Vos modifications seront vérifiées par la crèche ou le médecin avant d'être prises en compte.
                Vous recevrez une notification une fois la validation effectuée.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Allergies</CardTitle>
          <CardDescription>
            Renseignez toutes les allergies connues (alimentaires, médicamenteuses, environnementales)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allergies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergie, index) => (
                  <Badge key={index} variant="destructive" className="text-sm px-3 py-1">
                    {allergie}
                    <button
                      onClick={() => handleRemoveAllergie(index)}
                      className="ml-2 hover:text-white"
                    >
                      <IoTrashOutline />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Ex: Arachides, Lactose, Pollen..."
                value={newAllergie}
                onChange={(e) => setNewAllergie(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAllergie()}
              />
              <Button onClick={handleAddAllergie} type="button">
                <IoAddCircleOutline className="mr-2" />
                Ajouter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Antécédents */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Antécédents médicaux</CardTitle>
          <CardDescription>
            Maladies, opérations ou conditions médicales passées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {antecedents.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {antecedents.map((antecedent, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                    {antecedent}
                    <button
                      onClick={() => handleRemoveAntecedent(index)}
                      className="ml-2 hover:text-gray-900"
                    >
                      <IoTrashOutline />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Ex: Asthme, Eczéma, Opération appendicite..."
                value={newAntecedent}
                onChange={(e) => setNewAntecedent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAntecedent()}
              />
              <Button onClick={handleAddAntecedent} type="button">
                <IoAddCircleOutline className="mr-2" />
                Ajouter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Groupe sanguin */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Groupe sanguin</CardTitle>
          <CardDescription>
            Si connu, renseignez le groupe sanguin (modifiable une seule fois)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <select
              value={groupeSanguin}
              onChange={(e) => setGroupeSanguin(e.target.value)}
              disabled={!!enfant.groupeSanguin && enfant.groupeSanguin !== 'Non renseigné'}
              className="flex-1 p-2 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Sélectionnez...</option>
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
          {enfant.groupeSanguin && enfant.groupeSanguin !== 'Non renseigné' && (
            <p className="text-xs text-gray-500 mt-2">
              Le groupe sanguin ne peut pas être modifié après validation médicale
            </p>
          )}
        </CardContent>
      </Card>

      {/* Vaccins */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Vaccins</CardTitle>
          <CardDescription>
            Historique des vaccinations (facultatif - uploadez le carnet de santé séparément)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vaccins.length > 0 && (
              <div className="space-y-2">
                {vaccins.map((vaccin, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{vaccin.nom}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(vaccin.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveVaccin(index)}
                    >
                      <IoTrashOutline className="text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Nom du vaccin</Label>
                <Input
                  placeholder="Ex: DTP, ROR, BCG..."
                  value={newVaccin.nom}
                  onChange={(e) => setNewVaccin({ ...newVaccin, nom: e.target.value })}
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newVaccin.date}
                  onChange={(e) => setNewVaccin({ ...newVaccin, date: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleAddVaccin} type="button" className="w-full">
              <IoAddCircleOutline className="mr-2" />
              Ajouter un vaccin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => navigate('/parent/portail')} className="flex-1">
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Enregistrement...
            </>
          ) : (
            <>
              <IoSaveOutline className="mr-2" />
              Enregistrer les modifications
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
