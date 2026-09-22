"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { whatsappLinkForProduct } from "@/lib/whatsapp";

type Props = {
  produtoId: string;
  nome: string;
  preco: number;
  fotoUrl?: string;
  volumeMl?: number;
};

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Botão de pedido da vitrine, com etapa de confirmação.
 *
 * Antes o clique abria o WhatsApp direto e já registrava o pedido. Isso
 * inflava a contagem: quem clicou sem querer virava pedido. Agora existe uma
 * confirmação no meio — o registro só acontece quando a pessoa confirma, e aí
 * o número no painel passa a significar intenção de verdade.
 *
 * De quebra, dá para escolher a quantidade antes de ir para a conversa, e a
 * mensagem chega no WhatsApp já com o total certo.
 */
export function BotaoPedir({ produtoId, nome, preco, fotoUrl, volumeMl }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [qtd, setQtd] = useState(1);
  const [enviando, setEnviando] = useState(false);

  const total = preco * qtd;

  // Escape e clique fora fecham — <dialog> cuida do foco e do fundo sozinho.
  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    const fechar = () => setQtd(1);
    d.addEventListener("close", fechar);
    return () => d.removeEventListener("close", fechar);
  }, []);

  function abrir() {
    dialogo.current?.showModal();
  }

  async function confirmar() {
    // A aba precisa ser aberta dentro do gesto do clique: se vier depois do
    // await, o navegador bloqueia por achar que é popup.
    const aba = window.open("about:blank", "_blank", "noopener,noreferrer");
    setEnviando(true);

    const mensagem = whatsappLinkForProduct(`${qtd}× ${nome}`, total);

    try {
      await fetch("/api/pedido-do-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produtoId, quantidade: qtd }),
        keepalive: true,
      });
    } catch {
      // Perder o registro é chato; impedir a venda é pior. Segue para a conversa.
    } finally {
      setEnviando(false);
      dialogo.current?.close();
      if (aba) aba.location.href = mensagem;
      else window.location.href = mensagem;
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="rounded-sm bg-maruim-amber px-4 py-2 text-[12px] font-medium uppercase tracking-[0.1em] text-maruim-bg transition-colors hover:bg-maruim-cream"
      >
        Pedir no WhatsApp
      </button>

      <dialog
        ref={dialogo}
        onClick={(e) => {
          // clique no fundo (fora do conteúdo) fecha
          if (e.target === dialogo.current) dialogo.current?.close();
        }}
        className="w-[min(92vw,420px)] rounded-xl border border-maruim-line bg-maruim-card p-0 text-maruim-cream backdrop:bg-black/70"
      >
        <div className="p-6">
          <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-maruim-amber">
            <span className="h-px w-6 bg-maruim-amber" />
            Confirmar pedido
          </p>

          <div className="mt-5 flex gap-4">
            {fotoUrl && (
              <div className="relative h-24 w-24 flex-none overflow-hidden rounded-lg bg-black">
                <Image src={fotoUrl} alt={nome} fill className="object-contain p-1" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-display text-xl leading-tight">{nome}</p>
              {volumeMl && <p className="mt-1 text-xs text-maruim-muted">{volumeMl}ml</p>}
              <p className="mt-2 text-sm text-maruim-muted">{brl(preco)} cada</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-maruim-muted">Quantidade</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Diminuir"
                onClick={() => setQtd((q) => Math.max(1, q - 1))}
                disabled={qtd <= 1}
                className="h-9 w-9 rounded-full border border-maruim-line text-lg leading-none text-maruim-cream disabled:opacity-40"
              >
                −
              </button>
              <span aria-live="polite" className="w-8 text-center font-serif text-xl tabular-nums">
                {qtd}
              </span>
              <button
                type="button"
                aria-label="Aumentar"
                onClick={() => setQtd((q) => Math.min(50, q + 1))}
                className="h-9 w-9 rounded-full border border-maruim-line text-lg leading-none text-maruim-cream"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-baseline justify-between border-t border-maruim-line pt-5">
            <span className="text-sm text-maruim-muted">Total</span>
            <span className="font-serif text-3xl text-maruim-amber tabular-nums">{brl(total)}</span>
          </div>

          <button
            type="button"
            onClick={confirmar}
            disabled={enviando}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-sm bg-[#25D366] px-5 py-3.5 text-[13px] font-medium uppercase tracking-[0.1em] text-[#0b1f14] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {enviando ? "Abrindo…" : "Confirmar no WhatsApp"}
          </button>

          <p className="mt-3 text-center text-[11px] leading-relaxed text-maruim-muted">
            Você será levado à conversa com a mensagem pronta.
            <br />O pedido é fechado por lá — pagamento e entrega combinados no chat.
          </p>

          <button
            type="button"
            onClick={() => dialogo.current?.close()}
            className="mt-3 w-full text-center text-xs text-maruim-muted underline-offset-4 hover:text-maruim-cream hover:underline"
          >
            Cancelar
          </button>
        </div>
      </dialog>
    </>
  );
}
