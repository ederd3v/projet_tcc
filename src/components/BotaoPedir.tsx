"use client";

import { useState } from "react";
import { whatsappLinkForProduct } from "@/lib/whatsapp";

type Props = {
  produtoId: string;
  nome: string;
  preco: number;
};

/**
 * Botão de pedido da vitrine.
 *
 * Antes de abrir o WhatsApp, avisa o painel de que alguém quis este produto —
 * o pedido aparece na coluna "Novo" do quadro, com origem "Site". É o que
 * liga a landing ao CRM: sem isso, o dono só descobre o interesse quando a
 * mensagem chega, e nunca fica sabendo de quem olhou e não escreveu.
 *
 * O registro é um "melhor esforço": se a rede falhar, o WhatsApp abre do
 * mesmo jeito. Perder um registro é chato; impedir uma venda é pior.
 */
export function BotaoPedir({ produtoId, nome, preco }: Props) {
  const [enviando, setEnviando] = useState(false);
  const destino = whatsappLinkForProduct(nome, preco);

  async function registrarEAbrir(e: React.MouseEvent<HTMLAnchorElement>) {
    // Abre numa aba nova assim que possível: navegadores bloqueiam janela
    // aberta depois de um await, porque perde o vínculo com o clique.
    e.preventDefault();
    const aba = window.open("about:blank", "_blank", "noopener,noreferrer");
    setEnviando(true);

    try {
      await fetch("/api/pedido-do-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produtoId, quantidade: 1 }),
        keepalive: true, // sobrevive à troca de página
      });
    } catch {
      // segue para o WhatsApp de qualquer forma
    } finally {
      setEnviando(false);
      if (aba) aba.location.href = destino;
      else window.location.href = destino;
    }
  }

  return (
    <a
      href={destino}
      onClick={registrarEAbrir}
      target="_blank"
      rel="noopener noreferrer"
      aria-busy={enviando}
      className="rounded-sm bg-maruim-amber px-4 py-2 text-[12px] font-medium uppercase tracking-[0.1em] text-maruim-bg transition-colors hover:bg-maruim-cream"
    >
      {enviando ? "Abrindo…" : "Pedir no WhatsApp"}
    </a>
  );
}
