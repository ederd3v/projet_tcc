import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function CrmDashboard() {
  const [clientes, produtos, pedidos] = await Promise.all([
    prisma.cliente.count(),
    prisma.produto.count({ where: { ativo: true } }),
    prisma.pedido.count(),
  ]);

  const cards = [
    { label: "Clientes cadastrados", value: clientes, href: "/crm/clientes" },
    { label: "Produtos ativos", value: produtos, href: "/crm/produtos" },
    { label: "Pedidos registrados", value: pedidos, href: "/crm/pedidos" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-maruim-amberLight">Dashboard</h1>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border border-maruim-amber/20 bg-maruim-bgAlt p-6 hover:border-maruim-amber/50"
          >
            <p className="text-3xl text-maruim-cream">{c.value}</p>
            <p className="mt-1 text-sm text-maruim-muted">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
