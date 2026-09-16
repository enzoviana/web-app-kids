import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoPaperPlane } from 'react-icons/io5';
import { PrimaryButton } from '@/components/PrimaryButton';
import type { Enfant } from '@/types';

interface DeclarationSymptomeModalProps {
  open: boolean;
  onClose: () => void;
  enfant: Enfant | null;
}

const SYMPTOMES = [
  { id: 'fievre', label: 'Fièvre' },
  { id: 'toux', label: 'Toux' },
  { id: 'rhume', label: 'Rhume' },
  { id: 'maux_ventre', label: 'Maux de ventre' },
  { id: 'vomissements', label: 'Vomissements' },
  { id: 'diarrhee', label: 'Diarrhée' },
  { id: 'eruption', label: 'Éruption cutanée' },
  { id: 'fatigue', label: 'Fatigue inhabituelle' },
  { id: 'perte_appetit', label: 'Perte d\'appétit' },
  { id: 'irritabilite', label: 'Irritabilité' },
];

export const DeclarationSymptomeModal: React.FC<DeclarationSymptomeModalProps> = ({
  open,
  onClose,
  enfant,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleSymptom = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSelected([]);
      setNotes('');
      setSubmitted(false);
    }, 2000);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          className="relative w-full max-w-lg mx-4 bg-white dark:bg-surface-dark-secondary rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Handle */}
          <div className="sm:hidden w-11 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mx-auto mt-3" />

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-black text-text dark:text-text-inverse">
                Signaler un symptôme
              </h2>
              {enfant && (
                <p className="text-sm text-text-secondary dark:text-text-tertiary mt-0.5">
                  Pour {enfant.prenom} {enfant.nom}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <IoClose size={24} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-200px)]">
            {submitted ? (
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 mx-auto rounded-full bg-lime/20 flex items-center justify-center mb-4"
                >
                  <div className="w-12 h-12 rounded-full bg-lime flex items-center justify-center text-white text-2xl font-black">
                    ✓
                  </div>
                </motion.div>
                <h3 className="text-lg font-black text-text dark:text-text-inverse mb-2">
                  Alerte envoyée
                </h3>
                <p className="text-sm text-text-secondary dark:text-text-tertiary">
                  Parents et médecin notifiés · Diagnostic IA en cours
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm font-bold text-text dark:text-text-inverse mb-3">
                  Sélectionnez les symptômes observés :
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {SYMPTOMES.map((symptome) => {
                    const isSelected = selected.includes(symptome.id);
                    return (
                      <button
                        key={symptome.id}
                        onClick={() => toggleSymptom(symptome.id)}
                        className={`px-3 py-2 rounded-pill font-bold text-sm transition-all ${
                          isSelected
                            ? 'bg-magenta text-white border-2 border-magenta'
                            : 'bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-text-tertiary border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {symptome.label}
                      </button>
                    );
                  })}
                </div>

                <p className="text-sm font-bold text-text dark:text-text-inverse mb-2">
                  Notes complémentaires (optionnel) :
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Détails sur les symptômes, contexte, heure d'apparition..."
                  className="w-full h-24 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-text dark:text-text-inverse placeholder-text-tertiary resize-none focus:outline-none focus:border-cyan"
                />

                <PrimaryButton
                  label="Envoyer l'alerte"
                  icon={<IoPaperPlane />}
                  onClick={handleSubmit}
                  disabled={selected.length === 0}
                  variant="magenta"
                  className="w-full mt-4"
                />
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
