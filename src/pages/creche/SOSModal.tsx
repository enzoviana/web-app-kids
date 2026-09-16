import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoWarning } from 'react-icons/io5';
import { PrimaryButton } from '@/components/PrimaryButton';
import { mockData } from '@/data/mockData';

interface SOSModalProps {
  open: boolean;
  onClose: () => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({ open, onClose }) => {
  const [selectedEnfant, setSelectedEnfant] = useState('');
  const [motif, setMotif] = useState('');
  const [description, setDescription] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = setTimeout(() => {
      if (countdown === 1) {
        handleSend();
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      onClose();
      reset();
    }, 2500);
  };

  const startCountdown = () => {
    if (!selectedEnfant || !motif) return;
    setCountdown(10);
  };

  const reset = () => {
    setSelectedEnfant('');
    setMotif('');
    setDescription('');
    setCountdown(null);
    setSent(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop with red tint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={countdown === null ? onClose : undefined}
          className="absolute inset-0 bg-red-900/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-md mx-4 bg-white dark:bg-surface-dark-secondary rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-red-500 text-white">
            <div className="flex items-center gap-2">
              <IoWarning size={24} className="animate-pulse" />
              <h2 className="text-xl font-black">ALERTE SOS</h2>
            </div>
            {countdown === null && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <IoClose size={20} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {sent ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-4"
                >
                  <IoWarning className="text-red-500" size={40} />
                </motion.div>
                <h3 className="text-lg font-black text-text dark:text-text-inverse mb-2">
                  SOS DÉCLENCHÉ
                </h3>
                <p className="text-sm text-text-secondary dark:text-text-tertiary">
                  Notification envoyée aux parents et au service d'urgence
                </p>
              </div>
            ) : countdown !== null ? (
              <div className="text-center py-8">
                <motion.div
                  key={countdown}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-32 h-32 mx-auto rounded-full bg-red-500 flex items-center justify-center mb-4 shadow-2xl"
                >
                  <span className="text-6xl font-black text-white">{countdown}</span>
                </motion.div>
                <p className="text-base font-bold text-text dark:text-text-inverse mb-4">
                  Envoi automatique dans {countdown} secondes
                </p>
                <button
                  onClick={() => setCountdown(null)}
                  className="px-6 py-2 rounded-pill bg-gray-200 dark:bg-gray-700 text-text dark:text-text-inverse font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-text dark:text-text-inverse mb-2">
                    Enfant concerné *
                  </label>
                  <select
                    value={selectedEnfant}
                    onChange={(e) => setSelectedEnfant(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-text dark:text-text-inverse focus:outline-none focus:border-red-500"
                  >
                    <option value="">Sélectionner un enfant</option>
                    {mockData.enfants.map((enfant) => (
                      <option key={enfant._id} value={enfant._id}>
                        {enfant.prenom} {enfant.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-text dark:text-text-inverse mb-2">
                    Motif de l'urgence *
                  </label>
                  <input
                    type="text"
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    placeholder="Ex: Chute grave, difficulté respiratoire..."
                    className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-text dark:text-text-inverse placeholder-text-tertiary focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-text dark:text-text-inverse mb-2">
                    Description (optionnel)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Détails supplémentaires..."
                    className="w-full h-20 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-text dark:text-text-inverse placeholder-text-tertiary resize-none focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4">
                  <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                    ⚠️ Cette action déclenchera une notification d'urgence immédiate aux parents
                    et au service médical. Utilisez uniquement en cas de réelle urgence.
                  </p>
                </div>

                <PrimaryButton
                  label="DÉCLENCHER L'ALERTE SOS"
                  onClick={startCountdown}
                  disabled={!selectedEnfant || !motif}
                  variant="magenta"
                  className="w-full bg-gradient-to-br from-red-500 to-red-600 shadow-glow-magenta"
                />
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
