"use client";

import { useEffect, useState } from "react";

// Alterna entre o tema escuro (padrão da marca) e o claro, como na vitrine da
// loja de perfumes. A escolha fica no navegador; o script em layout.tsx aplica
// o tema salvo antes da página pintar, para não piscar.
export function BotaoTema({ className = "" }: { className?: string }) {
  const [claro, setClaro] = useState(false);

  useEffect(() => {
    setClaro(document.documentElement.dataset.theme === "light");
  }, []);

  const alternar = () => {
    const novo = claro ? "dark" : "light";
    document.documentElement.dataset.theme = novo;
    try {
      localStorage.setItem("maruim-tema", novo);
    } catch {
      /* sem armazenamento: vale só nesta visita */
    }
    setClaro(!claro);
  };

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={claro ? "Mudar para o modo escuro" : "Mudar para o modo claro"}
      title={claro ? "Modo escuro" : "Modo claro"}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-maruim-line text-maruim-muted transition-colors hover:border-maruim-amber/50 hover:text-maruim-amber ${className}`}
    >
      {claro ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  );
}
