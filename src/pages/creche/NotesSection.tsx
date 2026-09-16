import React, { useState } from 'react';
import { IoLockClosed, IoGlobe, IoAdd } from 'react-icons/io5';
import { GlassCard } from '@/components/GlassCard';
import { mockData } from '@/data/mockData';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const NotesSection: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'interne' | 'globale'>('all');
  const notes = mockData.notesInternes;

  const filteredNotes = filter === 'all' ? notes : notes.filter(n => n.visibilite === filter);

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-extrabold text-text dark:text-text-inverse">
          Notes & Observations
        </h3>
        <button className="w-8 h-8 rounded-full bg-cyan/10 flex items-center justify-center hover:bg-cyan/20 transition-colors">
          <IoAdd className="text-cyan" size={20} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-pill text-xs font-bold transition-colors ${
            filter === 'all'
              ? 'bg-cyan text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-text-tertiary'
          }`}
        >
          Toutes
        </button>
        <button
          onClick={() => setFilter('interne')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-pill text-xs font-bold transition-colors ${
            filter === 'interne'
              ? 'bg-cyan text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-text-tertiary'
          }`}
        >
          <IoLockClosed size={12} />
          <span>Internes</span>
        </button>
        <button
          onClick={() => setFilter('globale')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-pill text-xs font-bold transition-colors ${
            filter === 'globale'
              ? 'bg-cyan text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-text-tertiary'
          }`}
        >
          <IoGlobe size={12} />
          <span>Globales</span>
        </button>
      </div>

      {/* Notes list */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {filteredNotes.map((note) => {
          const enfant = mockData.enfants.find(e => e._id === note.enfant_id);
          return (
            <div
              key={note._id}
              className="p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text dark:text-text-inverse">
                    {enfant?.prenom} {enfant?.nom}
                  </span>
                  {note.visibilite === 'interne' ? (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan/20 text-cyan">
                      <IoLockClosed size={10} />
                      <span className="text-[10px] font-black">INTERNE</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-lime/20 text-lime">
                      <IoGlobe size={10} />
                      <span className="text-[10px] font-black">GLOBALE</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-text-tertiary">
                  {format(new Date(note.date), 'dd MMM', { locale: fr })}
                </span>
              </div>
              <p className="text-xs text-text-secondary dark:text-text-tertiary leading-relaxed">
                {note.texte}
              </p>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};
