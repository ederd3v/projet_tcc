import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { criarCliente, removerCliente } from "./actions";

export const revalidate = 0;

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { criadoEm: "desc" },
    include: { _count: { select: { pedidos: true } } },
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl text-maruim-amberLight">Clientes</h1>
        <p className="text-sm text-maruim-muted">RF04 — cadastro manual após venda pelo WhatsApp.</p>
      </div>

      <form action={criarCliente} className="grid gap-3 rounded-xl border border-maruim-amber/20 bg-maruim-bgAlt p-6 sm:grid-cols-3">
        <input name="nome" placeholder="Nome" required className="rounded-md border border-maruim-amber/30 bg-maruim-bg px-3 py-2 text-maruim-cream" />
        <input name="telefone" placeholder="Telefone" required className="rounded-md border border-maruim-amber/30 bg-maruim-bg px-3 py-2 text-maruim-cream" />
        <input name="email" placeholder="E-mail (opcional)" className="rounded-md border border-maruim-amber/30 bg-maruim-bg px-3 py-2 text-maruim-cream" />
        <button type="submit" className="sm:col-span-3 rounded-full bg-maruim-amber px-4 py-2 text-maruim-bg">
          Adicionar cliente
        </button>
      </form>

      <table className="w-full text-left text-sm">
        <thead className="text-maruim-muted">
          <tr>
            <th className="pb-2">Nome</th>
            <th className="pb-2">Telefone</th>
            <th className="pb-2">Pedidos</th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody className="text-maruim-cream">
          {clientes.map((c) => (
            <tr key={c.id} className="border-t border-maruim-amber/10">
              <td className="py-2">
                <Link href={`/crm/clientes/${c.id}`} className="hover:text-maruim-amberLight">
                  {c.nome}
                </Link>
              </td>
              <td className="py-2">{c.telefone}</td>
              <td className="py-2">{c._count.pedidos}</td>
              <td className="py-2 text-right">
                <form
                  action={async () => {
                    "use server";
                    await removerCliente(c.id);
                  }}
                >
                  <button type="submit" className="text-xs text-red-400 hover:underline">
                    Remover
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {clientes.length === 0 && <p className="text-maruim-muted">Nenhum cliente cadastrado ainda.</p>}
    </div>
  );
}
