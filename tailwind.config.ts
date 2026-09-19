import type { Config } from "tailwindcss";

// Paleta portada do site publicado (assets/custom.css do espelho local em
// ~/Desktop/maruim-site) — halo âmbar sobre fundo escuro, tipografia artesanal.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        maruim: {
          bg: "#141110",
          bgAlt: "#1c1815",
          amber: "#d98c3f",
          amberLight: "#f0b25e",
          cream: "#f4ead9",
          muted: "#9b8f80",
        },
      },
      fontFamily: {
        display: ["var(--font-special-elite)", "serif"], // rótulos / títulos artesanais
        serif: ["var(--font-playfair)", "serif"], // headings
        sans: ["var(--font-dm-sans)", "sans-serif"], // corpo de texto
      },
    },
  },
  plugins: [],
};

export default config;
