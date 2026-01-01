import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import { PluginAPI } from 'tailwindcss/types/config';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/containers/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-yellow': '#FED630',
        'brand-brown-stroke': '#CE7310',
        'subtitle-cream': '#FFF9DC',
        'form-bg': '#FDF6D5',
        'input-bg': '#FFF9DC',
        'placeholder-brown': '#A1887F',
        'input-border': '#F9E0A4',
        'icon-red-bg': '#EF5350',
        'icon-teal-bg': '#26A69A',
        'icon-orange-bg': '#F9A825',
        'icon-green-bg': '#8BC34A',
      },
      fontFamily: {
        sans: ['"Baloo 2"', 'cursive', 'sans-serif'],
        comic: ['"Comic Neue"', 'cursive', 'sans-serif'],
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translateX(-1px)' },
          '20%, 80%': { transform: 'translateX(2px)' },
          '30%, 50%, 70%': { transform: 'translateX(-4px)' },
          '40%, 60%': { transform: 'translateX(4px)' },
        },
        'jump-in': {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        confetti: {
          '0%': {
            transform: 'translateY(0) rotate(0deg)',
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(100vh) rotate(720deg)',
            opacity: '0',
          },
        },
        'bounce-in': {
          '0%': {
            transform: 'scale(0)',
            opacity: '0',
          },
          '50%': {
            transform: 'scale(1.1)',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        // 'jump-in': {
        //   '0%': {
        //     transform: 'translateY(-30px) scale(0.8)',
        //     opacity: '0'
        //   },
        //   '50%': {
        //     transform: 'translateY(5px) scale(1.05)',
        //   },
        //   '100%': {
        //     transform: 'translateY(0) scale(1)',
        //     opacity: '1'
        //   }
        // },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        shake: 'shake 0.5s ease-in-out',
        'jump-in': 'jump-in 0.3s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s both',
        confetti: 'confetti 5s linear infinite',
        'bounce-in': 'bounce-in 0.6s ease-out',
        // 'jump-in': 'jump-in 0.4s ease-out',
        float: 'float 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
      },
      dropShadow: {
        comic: '4px 4px 0px rgba(0, 0, 0, 0.75)',
        'comic-sm': '2px 2px 0px rgba(0, 0, 0, 0.75)',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities, theme }: PluginAPI) {
      const textStrokeUtilities = {
        '.text-stroke-sm': {
          '-webkit-text-stroke': `2px ${theme('colors.brand-brown-stroke')}`,
          'paint-order': 'stroke fill',
        },
        '.text-stroke': {
          '-webkit-text-stroke': `3px ${theme('colors.brand-brown-stroke')}`,
          'paint-order': 'stroke fill',
        },
        '.text-stroke-base': {
          '-webkit-text-stroke': `4px ${theme('colors.brand-brown-stroke')}`,
          'paint-order': 'stroke fill',
        },
        '.text-stroke-md': {
          '-webkit-text-stroke': `6px ${theme('colors.brand-brown-stroke')}`,
          'paint-order': 'stroke fill',
        },
      };
      addUtilities(textStrokeUtilities);
    }),
  ],
};

export default config;
