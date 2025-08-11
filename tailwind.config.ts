import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'desktop-bg': "url('/images/(Desktop) Eksplorasi.png')",
        'mobile-bg': "url('/images/(Mobile) Eksplorasi.png')",
      },
      colors: {
        // Warna dari desain baru
        'brand-yellow': '#FED630',
        'brand-brown-stroke': '#CE7310',
        'subtitle-cream': '#FFF9DC',
        'form-bg': '#FDF6D5',
        'input-bg': '#FFF9DC',
        'placeholder-brown': '#A1887F',
        'input-border': '#F9E0A4',

        // Warna untuk Ikon
        'icon-orange-bg': '#F9A825',
        'icon-green-bg': '#8BC34A',
        'icon-red-bg': '#EF5350',
        'icon-teal-bg': '#26A69A',
      },
      fontFamily: {
        // Mengganti font default dengan Baloo 2
        sans: ['"Baloo 2"', 'cursive'],
      },
    },
  },
  plugins: [],
};

export default config;
