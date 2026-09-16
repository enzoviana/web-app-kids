import React from 'react';

interface AppBackgroundProps {
  children: React.ReactNode;
}

export const AppBackground: React.FC<AppBackgroundProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-surface-light dark:bg-surface-dark overflow-hidden">
      {/* Neon blobs (cyan / magenta / lime) */}
      <div className="pointer-events-none absolute inset-0">
        {/* Cyan blob - top left */}
        <div
          className="absolute -top-20 -left-16 w-64 h-64 rounded-full opacity-10 dark:opacity-16"
          style={{
            background: 'radial-gradient(circle, rgba(0,153,255,1) 0%, rgba(248,250,252,0) 70%)',
          }}
        />

        {/* Magenta blob - top right */}
        <div
          className="absolute top-32 -right-20 w-80 h-80 rounded-full opacity-9 dark:opacity-16"
          style={{
            background: 'radial-gradient(circle, rgba(255,0,122,1) 0%, rgba(248,250,252,0) 70%)',
          }}
        />

        {/* Lime blob - bottom left */}
        <div
          className="absolute -bottom-16 -left-10 w-72 h-72 rounded-full opacity-10 dark:opacity-14"
          style={{
            background: 'radial-gradient(circle, rgba(139,195,74,1) 0%, rgba(248,250,252,0) 70%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
