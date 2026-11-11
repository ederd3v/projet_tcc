"use client";

import Image from "next/image";
import { useState } from "react";
import { notasDaFoto } from "@/lib/notas";

type Props = {
  fotoUrl: string;
  nome: string;
  sizes: string;
  selo?: string | null;
};

// Quadro 4:5 da foto com as notas de degustação por cima, no espírito da
// vitrine de perfumes (a foto some e aparece a pirâmide olfativa). Com mouse,
// as notas entram no hover; no toque, pelo botão "Notas" no canto.
// A vitrine usa a versão JPG leve da foto (gerada ao lado do PNG em
// /public/products): o otimizador do Next processa em ~0,15 s em vez de ~1,5 s,
// e as fotos não ficam em branco ao rolar a home. O PNG segue sendo o fotoUrl
// do banco (CRM), então nada muda lá.
export const fotoLeve = (url: string) => url.replace(/^(\/products\/.+)\.png$/i, "$1.jpg");

export function FotoComNotas({ fotoUrl, nome, sizes, selo }: Props) {
  const notas = notasDaFoto(fotoUrl);
  const [aberto, setAberto] = useState(false);
  const [carregou, setCarregou] = useState(false);

  const visivel = aberto
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-3 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100";
  const fotoEfeito = aberto
    ? "scale-110 opacity-25 blur-[2px]"
    : "[@media(hover:hover)]:group-hover:scale-110 [@media(hover:hover)]:group-hover:opacity-25 [@media(hover:hover)]:group-hover:blur-[2px]";

  return (
    <div className="relative aspect-[4/5] overflow-hidden border border-maruim-line bg-black transition-colors group-hover:border-maruim-amber/40">
      {/* brilho suave enquanto a foto chega */}
      {!carregou && <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-neutral-900 to-black" />}
      <div className={`absolute inset-0 transition-opacity duration-700 ${carregou ? "opacity-100" : "opacity-0"}`}>
        <Image
          src={fotoLeve(fotoUrl)}
          alt={nome}
          fill
          sizes={sizes}
          quality={85}
          onLoad={() => setCarregou(true)}
          className={`object-cover transition-all duration-700 ease-out ${fotoEfeito}`}
        />
      </div>

      {selo && (
        <span className="absolute left-3 top-3 z-10 bg-black/60 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[oklch(80%_0.12_75)] backdrop-blur-sm">
          {selo}
        </span>
      )}

      {notas && (
        <>
          <div
            className={`pointer-events-none absolute inset-0 flex flex-col justify-center gap-4 p-5 text-left transition-all duration-500 ease-out md:p-6 ${visivel}`}
          >
            {[
              ["Sabor", notas.sabor],
              ["Combina com", notas.combina],
              ["Sirva", notas.servir],
            ].map(([rotulo, texto]) => (
              <div key={rotulo}>
                <p className="text-[9px] uppercase tracking-[0.25em] text-[oklch(78%_0.13_72)]">{rotulo}</p>
                <p className="mt-1 font-serif text-[15px] leading-snug text-[oklch(95%_0.02_85)] md:text-base">
                  {texto}
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAberto((v) => !v);
            }}
            aria-expanded={aberto}
            className="absolute bottom-3 right-3 z-10 rounded-full border border-white/25 bg-black/55 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm [@media(hover:hover)]:hidden"
          >
            {aberto ? "Foto" : "Notas"}
          </button>
        </>
      )}
    </div>
  );
}
