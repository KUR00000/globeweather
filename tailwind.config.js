/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hud-cyan': '#00d4ff',
        'hud-cyan-dark': '#1a5a6a',
        'hud-bg': '#0a1a24',
        'hud-bg-dark': '#001725',
        'hud-text': '#a0f0ff',
        'hud-text-light': '#c8f4ff',
        'hud-text-dim': '#3a6878',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-scale': 'pulse-scale 1.5s ease-in-out infinite',
        'dash': 'dash 2s linear infinite',
        'shimmer': 'shimmer 1.5s linear infinite',
      },
      keyframes: {
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.4)' },
        },
        'dash': {
          '0%': { 'stroke-dashoffset': '0' },
          '100%': { 'stroke-dashoffset': '-16' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: '200px 0' },
        },
      },
    },
  },
  plugins: [],
}
