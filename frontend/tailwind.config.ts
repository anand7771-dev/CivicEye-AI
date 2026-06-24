import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        civic: {
          bg: '#040D21',
          surface: '#0A1628',
          card: '#0F1F3D',
          border: '#1A2F55',
          blue: '#1E6FFF',
          'blue-light': '#4D8FFF',
          emerald: '#10B981',
          'emerald-dark': '#059669',
          amber: '#F59E0B',
          red: '#EF4444',
          'red-dark': '#DC2626',
          purple: '#8B5CF6',
          cyan: '#06B6D4',
          text: '#E2E8F0',
          'text-muted': '#94A3B8',
          'text-dim': '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse at top left, #1E3A8A22 0%, transparent 50%), radial-gradient(ellipse at bottom right, #10B98122 0%, transparent 50%)',
        'card-gradient': 'linear-gradient(135deg, #0F1F3D 0%, #0A1628 100%)',
        'glow-blue': 'radial-gradient(circle, #1E6FFF33 0%, transparent 70%)',
        'glow-emerald': 'radial-gradient(circle, #10B98133 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-blue': '0 0 30px #1E6FFF33, 0 0 60px #1E6FFF11',
        'glow-emerald': '0 0 30px #10B98133, 0 0 60px #10B98111',
        'glow-red': '0 0 30px #EF444433, 0 0 60px #EF444411',
        'card': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px #1E6FFF33' },
          '100%': { boxShadow: '0 0 40px #1E6FFF66, 0 0 80px #1E6FFF22' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
