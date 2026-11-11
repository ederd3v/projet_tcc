import { prisma } from "@/lib/prisma";

// Produto com mais unidades nos pedidos do CRM (cancelados não contam). Vira o
// selo "★ Mais pedido" nos cards do site. Só aparece a partir de MINIMO
// unidades, para um pedido de teste solto não eleger ninguém.
const MINIMO = 3;

export async function maisPedidoId(): Promise<string | null> {
  const [top] = await prisma.itemPedido.groupBy({
    by: ["produtoId"],
    where: { pedido: { status: { not: "cancelado" } } },
    _sum: { quantidade: true },
    orderBy: { _sum: { quantidade: "desc" } },
    take: 1,
  });
  return top && (top._sum.quantidade ?? 0) >= MINIMO ? top.produtoId : null;
}
