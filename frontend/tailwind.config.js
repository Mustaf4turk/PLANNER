/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0f1e',
          card: '#111827',
          surface: '#1e293b',
          border: '#1f2937',
          hover: '#374151',
          muted: '#6b7280',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
        },
        accent: {
          purple: '#8b5cf6',
          pink: '#ec4899',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #2563eb, #7c3aed)',
        'gradient-card': 'linear-gradient(135deg, rgba(30,41,59,0.5), rgba(17,24,39,0.8))',
      },
      boxShadow: {
        'glow': '0 0 30px rgba(59, 130, 246, 0.15)',
        'glow-lg': '0 0 60px rgba(59, 130, 246, 0.2)',
        'card': '0 4px 30px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 12px 50px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
