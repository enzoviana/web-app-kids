/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Kids'Med IA Design System
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // Brand Colors - Couleurs principales par rôle
        primary: {
          DEFAULT: '#4F46E5', // Fallback indigo
          foreground: '#FFFFFF',
        },

        // Cyan - Parent/Médecin (#0099FF)
        cyan: {
          DEFAULT: '#0099FF',
          50: '#E6F7FF',
          100: '#BAE7FF',
          200: '#91D5FF',
          300: '#69C0FF',
          400: '#40A9FF',
          500: '#0099FF',
          600: '#0080DD',
          700: '#0066BB',
          800: '#004D99',
          900: '#003377',
          foreground: '#FFFFFF',
        },

        // Lime - Crèche (#8BC34A)
        lime: {
          DEFAULT: '#8BC34A',
          50: '#F1F8E9',
          100: '#DCEDC8',
          200: '#C5E1A5',
          300: '#AED581',
          400: '#9CCC65',
          500: '#8BC34A',
          600: '#7CB342',
          700: '#689F38',
          800: '#558B2F',
          900: '#33691E',
          foreground: '#FFFFFF',
        },

        // Magenta - RSAI (#FF007A)
        magenta: {
          DEFAULT: '#FF007A',
          50: '#FFE6F2',
          100: '#FFBDDB',
          200: '#FF94C4',
          300: '#FF6BAD',
          400: '#FF4296',
          500: '#FF007A',
          600: '#E6006E',
          700: '#CC0062',
          800: '#B30056',
          900: '#99004A',
          foreground: '#FFFFFF',
        },

        // Secondary & Neutral
        secondary: {
          DEFAULT: '#64748B',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          foreground: '#FFFFFF',
        },

        // Success - Basé sur Lime
        success: {
          DEFAULT: '#8BC34A',
          50: '#F1F8E9',
          100: '#DCEDC8',
          500: '#8BC34A',
          600: '#7CB342',
          700: '#689F38',
          foreground: '#FFFFFF',
        },

        // Warning
        warning: {
          DEFAULT: '#FFB300',
          50: '#FFF8E1',
          100: '#FFECB3',
          500: '#FFB300',
          600: '#FFA000',
          700: '#FF8F00',
          foreground: '#FFFFFF',
        },

        // Error - Basé sur Magenta
        error: {
          DEFAULT: '#FF007A',
          50: '#FFE6F2',
          100: '#FFBDDB',
          500: '#FF007A',
          600: '#E6006E',
          700: '#CC0062',
          foreground: '#FFFFFF',
        },

        // Info - Basé sur Cyan
        info: {
          DEFAULT: '#0099FF',
          50: '#E6F7FF',
          500: '#0099FF',
          600: '#0080DD',
          foreground: '#FFFFFF',
        },

        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#64748B',
        },

        accent: {
          DEFAULT: '#F1F5F9',
          foreground: '#0F172A',
        },

        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A',
        },

        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A',
        },
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '16px',
        '2xl': '24px', // Design system pill radius
        '3xl': '32px',
      },

      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: [
          'Plus Jakarta Sans',
          'Inter',
          'sans-serif',
        ],
      },

      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em' }],
      },

      boxShadow: {
        'soft': '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px 0 rgb(0 0 0 / 0.04)',
        'soft-lg': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-hover': '0 4px 8px -2px rgb(0 0 0 / 0.08), 0 2px 6px -2px rgb(0 0 0 / 0.06)',
        // Glow effects pour les badges
        'glow-cyan': '0 0 20px rgba(0, 153, 255, 0.4)',
        'glow-lime': '0 0 20px rgba(139, 195, 74, 0.4)',
        'glow-magenta': '0 0 20px rgba(255, 0, 122, 0.4)',
      },

      animation: {
        'fade-in': 'fadeIn 0.2s ease-in',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },

      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
};
