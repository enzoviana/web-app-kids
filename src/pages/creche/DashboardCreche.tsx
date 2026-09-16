import React, { useState, useMemo } from 'react';
import { IoSparkles, IoPeople, IoHappy, IoPulse, IoEye, IoPersonAdd, IoAdd, IoAlert, IoShieldCheckmark, IoStar } from 'react-icons/io5';
import { GlassCard } from '@/components/GlassCard';
import { StatusBadge } from '@/components/StatusBadge';
import { PrimaryButton } from '@/components/PrimaryButton';
import { mockData } from '@/data/mockData';
import { DeclarationSymptomeModal } from './DeclarationSymptomeModal';
import { SOSModal } from './SOSModal';
import { NotesSection } from './NotesSection';
import { AlertesSection } from './AlertesSection';
import type { Enfant } from '@/types';

export const DashboardCreche: React.FC = () => {
  const [symptomeModalOpen, setSymptomeModalOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Enfant | null>(null);

  const enfants = mockData.enfants;
  const rsai = mockData.rsaiList[0];

  const counts = useMemo(() => ({
    total: enfants.length,
    sain: enfants.filter(e => e.statut === 'sain').length,
    symptome: enfants.filter(e => e.statut === 'symptome').length,
    attention: enfants.filter(e => e.statut === 'attention').length,
  }), [enfants]);

  const openSymptomeModal = (enfant: Enfant) => {
    setSelectedChild(enfant);
    setSymptomeModalOpen(true);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Trend chips */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <TrendChip icon={<IoPeople />} value={counts.total} label="Présents" color="cyan" />
          <TrendChip icon={<IoHappy />} value={counts.sain} label="En forme" color="lime" />
          <TrendChip icon={<IoPulse />} value={counts.symptome} label="Symptômes" color="magenta" />
          <TrendChip icon={<IoEye />} value={counts.attention} label="Surveillance" color="cyan" />
        </div>

        {/* AI Insight Banner */}
        <GlassCard borderColor="rgba(255,0,122,0.3)">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-magenta/20 flex items-center justify-center shadow-glow-magenta">
              <IoSparkles className="text-magenta" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-extrabold text-text dark:text-text-inverse">
                Tendance IA du jour
              </h3>
              <p className="text-xs text-text-secondary dark:text-text-tertiary mt-1 leading-relaxed">
                Recrudescence de symptômes ORL détectée (+2 aujourd'hui). Renforcez le lavage des mains.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Children List */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-text dark:text-text-inverse">
            Enfants présents
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 rounded-pill bg-cyan text-white font-extrabold text-sm hover:shadow-glow-cyan transition-shadow">
            <IoPersonAdd size={16} />
            <span>Ajouter</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enfants.map((enfant) => (
            <GlassCard key={enfant._id} className="p-4">
              <div className="flex items-center gap-3">
                <img
                  src={enfant.photo}
                  alt={enfant.prenom}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-text dark:text-text-inverse">
                      {enfant.prenom} {enfant.nom}
                    </h3>
                    {enfant.pai?.actif && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-pill bg-magenta text-white">
                        <IoAlert size={10} />
                        <span className="text-[10px] font-black tracking-wide">PAI</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary dark:text-text-tertiary mt-0.5">
                    {enfant.age} ans · {enfant.groupeSanguin}
                    {enfant.allergies.length > 0 && ` · ${enfant.allergies.length} allergie(s)`}
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={enfant.statut} />
                  </div>
                </div>
                <button
                  onClick={() => openSymptomeModal(enfant)}
                  className="w-11 h-11 rounded-xl bg-magenta/10 border border-magenta/50 flex items-center justify-center hover:bg-magenta/20 transition-colors"
                >
                  <IoAdd className="text-magenta" size={24} />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* RSAI Review Card */}
        <GlassCard borderColor="rgba(251,191,36,0.3)">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan/10 flex items-center justify-center">
              <IoShieldCheckmark className="text-cyan" size={22} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-extrabold text-text dark:text-text-inverse">
                RSAI · {rsai.prenom} {rsai.nom}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <IoStar key={star} className="text-cyan" size={13} />
                  ))}
                </div>
                <span className="text-xs text-text-secondary dark:text-text-tertiary">
                  5.0/5 · 2 avis
                </span>
              </div>
            </div>
          </div>
          <button className="w-full mt-3 px-4 py-2.5 rounded-pill border-2 border-cyan text-cyan font-extrabold text-sm hover:bg-cyan/10 transition-colors flex items-center justify-center gap-2">
            <IoStar size={15} />
            <span>Évaluer le RSAI</span>
          </button>
        </GlassCard>

        {/* Notes et Alertes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <NotesSection />
          <AlertesSection />
        </div>
      </div>

      {/* Floating SOS Button */}
      <button
        onClick={() => setSosModalOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-transform neon-pulse"
      >
        SOS
      </button>

      {/* Modals */}
      <DeclarationSymptomeModal
        open={symptomeModalOpen}
        onClose={() => {
          setSymptomeModalOpen(false);
          setSelectedChild(null);
        }}
        enfant={selectedChild}
      />

      <SOSModal
        open={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
      />
    </>
  );
};

interface TrendChipProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: 'cyan' | 'magenta' | 'lime';
}

const TrendChip: React.FC<TrendChipProps> = ({ icon, value, label, color }) => {
  const colorMap = {
    cyan: 'text-cyan bg-cyan/10 border-cyan/40',
    magenta: 'text-magenta bg-magenta/10 border-magenta/40',
    lime: 'text-lime bg-lime/10 border-lime/40',
  };

  return (
    <div
      className={`flex items-center gap-2 px-3.5 py-3 rounded-2xl border backdrop-blur-sm ${colorMap[color]}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color === 'cyan' ? 'bg-cyan/20' : color === 'magenta' ? 'bg-magenta/20' : 'bg-lime/20'}`}>
        <span className={`text-base ${color === 'cyan' ? 'text-cyan' : color === 'magenta' ? 'text-magenta' : 'text-lime'}`}>
          {icon}
        </span>
      </div>
      <div>
        <p className={`text-xl font-black ${color === 'cyan' ? 'text-cyan' : color === 'magenta' ? 'text-magenta' : 'text-lime'}`}>
          {value}
        </p>
        <p className="text-xs font-semibold text-text-secondary dark:text-text-tertiary whitespace-nowrap">
          {label}
        </p>
      </div>
    </div>
  );
};
