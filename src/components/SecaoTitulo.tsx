import type { ReactNode } from "react";

type Props = {
  /** Olho-de-boi acima do título: "Simples assim", "O que dizem"… */
  eyebrow: string;
  /** Parte do título em cor normal. */
  titulo: string;
  /** Palavra destacada, renderizada em itálico serifado âmbar. */
  destaque: string;
  /** Linha de apoio abaixo do título. */
  apoio?: ReactNode;
  /** Centralizado (Como pedir, Contato) ou alinhado à esquerda (Depoimentos). */
  centralizado?: boolean;
};

// Cabeçalho de seção do site publicado: filete + olho-de-boi, título na fonte
// de máquina de escrever com uma palavra em itálico serifado âmbar.
export function SecaoTitulo({ eyebrow, titulo, destaque, apoio, centralizado }: Props) {
  return (
    <div className={`mb-14 ${centralizado ? "text-center" : ""}`}>
      <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-maruim-amber">
        <span className="h-px w-6 bg-maruim-amber" />
        <span className={centralizado ? "mx-auto" : undefined}>{eyebrow}</span>
      </p>
      <h2 className="mt-4 font-display text-4xl leading-[1.05] text-maruim-cream md:text-5xl">
        {titulo} <em className="font-serif italic text-maruim-amber">{destaque}</em>
      </h2>
      {apoio && (
        <p className={`mt-4 max-w-md text-sm text-maruim-muted ${centralizado ? "mx-auto" : ""}`}>
          {apoio}
        </p>
      )}
    </div>
  );
}
