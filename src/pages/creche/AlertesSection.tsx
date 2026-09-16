import React from 'react';
import { IoWarning, IoCheckmarkCircle, IoAdd } from 'react-icons/io5';
import { GlassCard } from '@/components/GlassCard';
import { mockData } from '@/data/mockData';

const alerteIcons: Record<string, string> = {
  doudou_oublie: '🧸',
  stock_couches: '🍼',
  stock_lait: '🥛',
  medicament_oublie: '💊',
  autre: '⚠️',
};

export const AlertesSection: React.FC = () => {
  const alertes = mockData.alertesQuotidien;

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-extrabold text-text dark:text-text-inverse">
          Alertes du quotidien
        </h3>
        <button className="w-8 h-8 rounded-full bg-magenta/10 flex items-center justify-center hover:bg-magenta/20 transition-colors">
          <IoAdd className="text-magenta" size={20} />
        </button>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {alertes.map((alerte) => {
          const enfant = mockData.enfants.find(e => e._id === alerte.enfant_id);
          return (
            <div
              key={alerte._id}
              className={`p-3 rounded-xl border ${
                alerte.resolue
                  ? 'bg-lime/10 border-lime/30'
                  : 'bg-magenta/10 border-magenta/30'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-2xl">{alerteIcons[alerte.type] || '⚠️'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-text dark:text-text-inverse">
                      {enfant?.prenom} {enfant?.nom}
                    </span>
                    {alerte.resolue ? (
                      <IoCheckmarkCircle className="text-lime" size={14} />
                    ) : (
                      <IoWarning className="text-magenta" size={14} />
                    )}
                  </div>
                  <p className="text-xs text-text-secondary dark:text-text-tertiary leading-relaxed">
                    {alerte.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick add templates */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs font-bold text-text-secondary dark:text-text-tertiary mb-2">
          Raccourcis :
        </p>
        <div className="flex flex-wrap gap-2">
          <button className="px-2 py-1 rounded-pill bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-text-secondary dark:text-text-tertiary hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            🧸 Doudou oublié
          </button>
          <button className="px-2 py-1 rounded-pill bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-text-secondary dark:text-text-tertiary hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            🍼 Stock bas
          </button>
        </div>
      </div>
    </GlassCard>
  );
};
