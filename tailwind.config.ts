import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        nsc: {
          bg: 'var(--bg)',
          surface: 'var(--surface)',
          surface2: 'var(--surface2)',
          surface3: 'var(--surface3)',
          border: 'var(--border)',
          text: 'var(--text)',
          muted: 'var(--muted)',
          blue: 'var(--blue)',
          'blue-dim': 'var(--blue-dim)',
          amber: 'var(--amber)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--font-serif)', ...defaultTheme.fontFamily.serif],
      },
      borderRadius: {
        'nsc-sm': 'var(--radius-sm)',
        'nsc-md': 'var(--radius-md)',
        'nsc-lg': 'var(--radius-lg)',
        'nsc-pill': 'var(--radius-pill)',
      },
      spacing: {
        'space-1': 'var(--space-1)',
        'space-2': 'var(--space-2)',
        'space-3': 'var(--space-3)',
        'space-4': 'var(--space-4)',
        'space-5': 'var(--space-5)',
        'space-6': 'var(--space-6)',
        'space-7': 'var(--space-7)',
      },
      boxShadow: {
        'nsc-soft': 'var(--shadow-soft)',
        'nsc-glow': 'var(--shadow-glow)',
      },
      backgroundImage: {
        'nsc-hero': 'var(--grad-blue)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
      },
      transitionTimingFunction: {
        soft: 'var(--easing-soft)',
      },
    },
  },
  plugins: [],
};

export default config;
