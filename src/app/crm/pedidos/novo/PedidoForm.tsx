"use client";

import { useMemo, useState } from "react";
import { criarPedido } from "../actions";

type Cliente = { id: string; nome: string };
type Produto = { id: string; nome: string; preco: number };

type Item = { produtoId: string; quantidade: number };

export function PedidoForm({ clientes, produtos }: { clientes: Cliente[]; produtos: Produto[] }) {
  const [clienteId, setClienteId] = useState(clientes[0]?.id ?? "");
  const [observacao, setObservacao] = useState("");
  const [itens, setItens] = useState<Item[]>([{ produtoId: produtos[0]?.id ?? "", quantidade: 1 }]);

  const precoPorId = useMemo(() => new Map(produtos.map((p) => [p.id, p.preco])), [produtos]);
  const total = itens.reduce((soma, i) => soma + i.quantidade * (precoPorId.get(i.produtoId) ?? 0), 0);

  function atualizarItem(index: number, campo: keyof Item, valor: string) {
    setItens((prev) =>
      prev.map((it, i) =>
        i === index ? { ...it, [campo]: campo === "quantidade" ? Number(valor) : valor } : it
      )
    );
  }

  return (
    <form action={criarPedido} className="space-y-6 rounded-xl border border-maruim-amber/20 bg-maruim-bgAlt p-6">
      <div>
        <label className="text-sm text-maruim-cream">Cliente</label>
        <select
          name="clienteId"
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          className="mt-1 w-full rounded-md border border-maruim-amber/30 bg-maruim-bg px-3 py-2 text-maruim-cream"
        >
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        {clientes.length === 0 && (
          <p className="mt-1 text-xs text-amber-400">Cadastre um cliente antes de registrar um pedido.</p>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-sm text-maruim-cream">Itens</p>
        {itens.map((item, i) => (
          <div key={i} className="flex gap-3">
            <select
              value={item.produtoId}
              onChange={(e) => atualizarItem(i, "produtoId", e.target.value)}
              className="flex-1 rounded-md border border-maruim-amber/30 bg-maruim-bg px-3 py-2 text-sm text-maruim-cream"
            >
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} — {p.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={item.quantidade}
              onChange={(e) => atualizarItem(i, "quantidade", e.target.value)}
              className="w-20 rounded-md border border-maruim-amber/30 bg-maruim-bg px-3 py-2 text-sm text-maruim-cream"
            />
            <button
              type="button"
              onClick={() => setItens((prev) => prev.filter((_, idx) => idx !== i))}
              disabled={itens.length === 1}
              className="text-xs text-red-400 disabled:opacity-30"
            >
              Remover
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setItens((prev) => [...prev, { produtoId: produtos[0]?.id ?? "", quantidade: 1 }])}
          className="text-sm text-maruim-amberLight hover:underline"
        >
          + Adicionar item
        </button>
      </div>

      <div>
        <label className="text-sm text-maruim-cream">Observação (opcional)</label>
        <textarea
          name="observacao"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          className="mt-1 w-full rounded-md border border-maruim-amber/30 bg-maruim-bg px-3 py-2 text-maruim-cream"
        />
      </div>

      <input type="hidden" name="itensJson" value={JSON.stringify(itens)} />

      <div className="flex items-center justify-between">
        <p className="text-maruim-amberLight">
          Total: {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
        <button
          type="submit"
          disabled={clientes.length === 0 || produtos.length === 0}
          className="rounded-full bg-maruim-amber px-6 py-2 text-maruim-bg disabled:opacity-40"
        >
          Registrar pedido
        </button>
      </div>
    </form>
  );
}
