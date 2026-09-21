import type { Config } from "tailwindcss";

// Paleta e animações portadas do site publicado, lidas do CSS compilado do
// espelho local (~/Desktop/maruim-site/assets/styles-Dt4F0Y_e.css).
//
// Os valores são os mesmos `oklch` do original, não aproximações em hex: o
// objetivo aqui é fidelidade ao que o cliente já aprovou, então vale copiar a
// definição em vez de reinterpretar a cor.
// O sufixo `/ <alpha-value>` é obrigatório: sem ele o Tailwind não consegue
// aplicar modificadores de opacidade (bg-maruim-amber/30, text-maruim-cream/[0.02])
// sobre cores declaradas em oklch, e a marca d'água do rodapé sai opaca.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        maruim: {
          bg: "oklch(13% 0.012 70 / <alpha-value>)", // --background
          dark: "oklch(16% 0.018 75 / <alpha-value>)", // --dark, painel do hero
          card: "oklch(20% 0.022 75 / <alpha-value>)", // --card
          amber: "oklch(72% 0.14 70 / <alpha-value>)", // --primary
          cream: "oklch(93% 0.03 85 / <alpha-value>)", // --cream / --foreground
          muted: "oklch(62% 0.05 75 / <alpha-value>)", // --muted-foreground / --muted2
          line: "oklch(85% 0.12 85 / 0.12)", // --border
        },
        // aliases mantidos para não quebrar telas já escritas (CRM, /sobre…)
        "maruim-bgAlt": "oklch(16% 0.018 75 / <alpha-value>)",
        "maruim-amberLight": "oklch(80% 0.11 78 / <alpha-value>)",
      },
      fontFamily: {
        // Special Elite — a "máquina de escrever" da marca: wordmark e títulos
        display: ["var(--font-special-elite)", "Courier New", "monospace"],
        // Playfair — números das estatísticas e itálicos de apoio
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(.2,.7,.3,1) both",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 38s linear infinite",
        "spin-slow": "spin-slow 24s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
