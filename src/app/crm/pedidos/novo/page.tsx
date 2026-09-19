import { prisma } from "@/lib/prisma";
import { PedidoForm } from "./PedidoForm";

export const revalidate = 0;

export default async function NovoPedidoPage() {
  const [clientes, produtos] = await Promise.all([
    prisma.cliente.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
    prisma.produto.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, preco: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-maruim-amberLight">Novo pedido</h1>
      <PedidoForm clientes={clientes} produtos={produtos} />
    </div>
  );
}
