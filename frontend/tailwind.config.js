/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f0ff',
          100: '#e0e0ff',
          200: '#c4c4ff',
          300: '#a0a0ff',
          400: '#7c7cff',
          500: '#6C63FF',
          600: '#5a52e0',
          700: '#4a43c2',
          800: '#3d379e',
          900: '#322d7a',
        },
        dark: {
          50: '#f0f0f5',
          100: '#d1d1e0',
          200: '#a3a3c0',
          300: '#7575a0',
          400: '#474780',
          500: '#1a1a2e',
          600: '#151527',
          700: '#10101f',
          800: '#0b0b17',
          900: '#06060f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        scaleIn: { '0%': { transform: 'scale(0.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 20px rgba(108,99,255,0.2)' }, '50%': { boxShadow: '0 0 40px rgba(108,99,255,0.4)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
