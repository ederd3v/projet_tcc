import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { editarCliente } from "../actions";

export const revalidate = 0;

// RF06: histórico de pedidos do cliente, ordem decrescente de data (RFC 10.4).
export default async function ClienteDetalhePage({ params }: { params: { id: string } }) {
  const cliente = await prisma.cliente.findUnique({
    where: { id: params.id },
    include: {
      pedidos: {
        orderBy: { data: "desc" },
        include: { itens: { include: { produto: true } } },
      },
    },
  });

  if (!cliente) notFound();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl text-maruim-amberLight">{cliente.nome}</h1>
        <p className="text-sm text-maruim-muted">Cadastrado em {cliente.criadoEm.toLocaleDateString("pt-BR")}</p>
      </div>

      <form
        action={async (formData: FormData) => {
          "use server";
          await editarCliente(cliente.id, formData);
        }}
        className="grid gap-3 rounded-xl border border-maruim-amber/20 bg-maruim-bgAlt p-6 sm:grid-cols-3"
      >
        <input name="nome" defaultValue={cliente.nome} className="rounded-md border border-maruim-amber/30 bg-maruim-bg px-3 py-2 text-maruim-cream" />
        <input name="telefone" defaultValue={cliente.telefone} className="rounded-md border border-maruim-amber/30 bg-maruim-bg px-3 py-2 text-maruim-cream" />
        <input name="email" defaultValue={cliente.email ?? ""} className="rounded-md border border-maruim-amber/30 bg-maruim-bg px-3 py-2 text-maruim-cream" />
        <button type="submit" className="sm:col-span-3 rounded-full border border-maruim-amber px-4 py-2 text-maruim-amberLight">
          Salvar alterações
        </button>
      </form>

      <div>
        <h2 className="font-serif text-xl text-maruim-amberLight">Histórico de pedidos</h2>
        {cliente.pedidos.length === 0 && <p className="mt-4 text-maruim-muted">Sem pedidos registrados.</p>}
        <div className="mt-4 space-y-4">
          {cliente.pedidos.map((p) => (
            <div key={p.id} className="rounded-xl border border-maruim-amber/20 bg-maruim-bgAlt p-4">
              <div className="flex items-center justify-between text-sm text-maruim-muted">
                <span>{p.data.toLocaleDateString("pt-BR")}</span>
                <span>{p.status}</span>
              </div>
              <ul className="mt-2 text-sm text-maruim-cream">
                {p.itens.map((i) => (
                  <li key={i.id}>
                    {i.quantidade}x {i.produto.nome} —{" "}
                    {(i.quantidade * i.precoUnit).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-right font-medium text-maruim-amberLight">
                Total: {p.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
