//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: Layout do PAINEL (CRM) em /painel.
//  ⚙️  COMO FUNCIONA: Define o título da aba e carrega o CSS próprio do painel
//      (src/painel/painel.css). O login é exigido antes, pelo middleware.
//  🎓 NA BANCA: O painel tem visual de "aplicativo" (menu lateral, cards),
//      diferente do site — por isso CSS separado.
//  ──────────────────────────────────────────────────────────────────────
import type { Metadata } from "next";
import "@/painel/painel.css";

export const metadata: Metadata = {
  title: "Maruim · Gestão",
  robots: { index: false, follow: false }, // área privada: não aparece no Google
};

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
