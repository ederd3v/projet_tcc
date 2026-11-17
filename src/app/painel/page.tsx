//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: A página /painel — a tela do CRM do Jaisson.
//  ⚙️  COMO FUNCIONA: Coloca o esqueleto do painel (src/painel/estrutura.ts) na
//      tela e, assim que ele aparece, chama iniciarPainel() (src/painel/nucleo.ts),
//      que busca os dados no banco e desenha tudo.
//  🎓 NA BANCA: Só chega aqui quem passou pelo middleware (login). Toda a
//      lógica do CRM está em src/painel/, em TypeScript (RNF04).
//  ──────────────────────────────────────────────────────────────────────
"use client";

import { useEffect } from "react";
import { ESTRUTURA_PAINEL } from "@/painel/estrutura";
import { iniciarPainel } from "@/painel/nucleo";

export default function PainelPage() {
  useEffect(() => {
    void iniciarPainel();
  }, []);

  // O HTML é nosso (fixo, sem dado de usuário), por isso pode ir direto.
  // Os dados entram depois, sempre escapados (função esc em util.ts).
  return <div dangerouslySetInnerHTML={{ __html: ESTRUTURA_PAINEL }} />;
}
