import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusSelect } from "./StatusSelect";

export const revalidate = 0;

export default async function PedidosPage() {
  const pedidos = await prisma.pedido.findMany({
    orderBy: { data: "desc" },
    include: { cliente: true, itens: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-maruim-amberLight">Pedidos</h1>
          <p className="text-sm text-maruim-muted">RF05/RF06 — registro manual, vinculado a um cliente.</p>
        </div>
        <Link href="/crm/pedidos/novo" className="rounded-full bg-maruim-amber px-4 py-2 text-sm text-maruim-bg">
          Novo pedido
        </Link>
      </div>

      <table className="w-full text-left text-sm">
        <thead className="text-maruim-muted">
          <tr>
            <th className="pb-2">Data</th>
            <th className="pb-2">Cliente</th>
            <th className="pb-2">Itens</th>
            <th className="pb-2">Total</th>
            <th className="pb-2">Status</th>
          </tr>
        </thead>
        <tbody className="text-maruim-cream">
          {pedidos.map((p) => (
            <tr key={p.id} className="border-t border-maruim-amber/10">
              <td className="py-2">{p.data.toLocaleDateString("pt-BR")}</td>
              <td className="py-2">
                <Link href={`/crm/clientes/${p.cliente.id}`} className="hover:text-maruim-amberLight">
                  {p.cliente.nome}
                </Link>
              </td>
              <td className="py-2">{p.itens.reduce((n, i) => n + i.quantidade, 0)} un.</td>
              <td className="py-2">{p.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
              <td className="py-2">
                <StatusSelect pedidoId={p.id} status={p.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pedidos.length === 0 && <p className="text-maruim-muted">Nenhum pedido registrado ainda.</p>}
    </div>
  );
}
