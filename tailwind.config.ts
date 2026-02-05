import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
      },
      keyframes: {
        'ai-glow': {
          '0%, 100%': {
            boxShadow: '0 0 8px rgba(168, 85, 247, 0.4), 0 0 20px rgba(168, 85, 247, 0.15)',
          },
          '50%': {
            boxShadow: '0 0 16px rgba(168, 85, 247, 0.6), 0 0 40px rgba(168, 85, 247, 0.25)',
          },
        },
        'ai-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'ai-border-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'ai-glow': 'ai-glow 2s ease-in-out infinite',
        'ai-shimmer': 'ai-shimmer 3s linear infinite',
        'ai-border-glow': 'ai-border-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
