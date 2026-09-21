"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { alternarAtivo, editarPreco, editarEstoque } from "./actions";

type Props = {
  id: string;
  nome: string;
  categoria: string;
  fotoUrl: string;
  preco: number;
  estoque: number;
  ativo: boolean;
  /** Unidades vendidas nos últimos 30 dias, calculado no servidor. */
  vendidos: number;
};

const ROTULO: Record<string, string> = { licor: "Licor", kombucha: "Kombucha", ice: "Ice" };
const ESTOQUE_BAIXO = 5;

// Card da tela de Produtos, no formato do protótipo: foto grande, interruptor
// de catálogo e os dois campos editáveis direto, sem botão de salvar — o
// valor vai para o banco quando o campo perde o foco.
export function CardProduto(p: Props) {
  const [ativo, setAtivo] = useState(p.ativo);
  const [preco, setPreco] = useState(String(p.preco));
  const [estoque, setEstoque] = useState(String(p.estoque));
  const [aviso, setAviso] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  const estoqueBaixo = Number(estoque) <= ESTOQUE_BAIXO;

  function toast(msg: string) {
    setAviso(msg);
    setTimeout(() => setAviso(null), 2600);
  }

  function trocarAtivo() {
    const novo = !ativo;
    setAtivo(novo); // otimista: a troca é reversível e barata
    iniciar(async () => {
      await alternarAtivo(p.id, novo);
      toast(novo ? "voltou ao catálogo" : "saiu do catálogo");
    });
  }

  function salvarPreco() {
    const v = Math.max(0, Number(preco) || 0);
    if (v === p.preco) return;
    iniciar(async () => {
      const salvo = await editarPreco(p.id, v);
      setPreco(String(salvo));
      toast(`preço: ${salvo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`);
    });
  }

  function salvarEstoque() {
    const v = Math.max(0, Math.round(Number(estoque) || 0));
    if (v === p.estoque) return;
    iniciar(async () => {
      const salvo = await editarEstoque(p.id, v);
      setEstoque(String(salvo));
      toast(`estoque: ${salvo}`);
    });
  }

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border border-maruim-line bg-maruim-card transition-opacity ${
        ativo ? "" : "opacity-60"
      }`}
    >
      <div className="relative aspect-[1.3/1] bg-black">
        <Image
          src={p.fotoUrl}
          alt={p.nome}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={`object-cover transition-opacity ${ativo ? "" : "opacity-35"}`}
        />
      </div>

      <div className="grid gap-2 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="font-display text-maruim-cream">{p.nome}</span>
          <button
            type="button"
            role="switch"
            aria-checked={ativo}
            aria-label={ativo ? "Tirar do catálogo" : "Voltar ao catálogo"}
            onClick={trocarAtivo}
            disabled={pendente}
            className={`h-6 w-11 flex-none rounded-full border transition-colors disabled:opacity-50 ${
              ativo ? "border-maruim-amber bg-maruim-amber" : "border-maruim-line bg-transparent"
            }`}
          >
            <span
              className={`block h-4 w-4 rounded-full bg-maruim-bg transition-transform ${
                ativo ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <p className="text-xs text-maruim-muted">
          {ROTULO[p.categoria] ?? p.categoria} · {p.vendidos} vendidos em 30 dias
        </p>

        <label className="flex items-center justify-between gap-3 text-xs text-maruim-muted">
          Preço (R$)
          <input
            type="number"
            min={0}
            step={0.5}
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            onBlur={salvarPreco}
            disabled={pendente}
            className="w-24 rounded-md border border-maruim-line bg-maruim-bg px-2 py-1 text-right font-sans text-sm text-maruim-cream tabular-nums disabled:opacity-50"
          />
        </label>

        <label className="flex items-center justify-between gap-3 text-xs text-maruim-muted">
          <span>
            Estoque
            {estoqueBaixo && <b className="ml-1 font-normal text-red-400">· baixo</b>}
          </span>
          <input
            type="number"
            min={0}
            step={1}
            value={estoque}
            onChange={(e) => setEstoque(e.target.value)}
            onBlur={salvarEstoque}
            disabled={pendente}
            className="w-24 rounded-md border border-maruim-line bg-maruim-bg px-2 py-1 text-right font-sans text-sm text-maruim-cream tabular-nums disabled:opacity-50"
          />
        </label>

        <p
          aria-live="polite"
          className={`h-4 text-[11px] text-maruim-amber transition-opacity ${aviso ? "opacity-100" : "opacity-0"}`}
        >
          {aviso}
        </p>
      </div>
    </article>
  );
}
