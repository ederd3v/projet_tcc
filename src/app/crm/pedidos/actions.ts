"use server";

import { prisma } from "@/lib/prisma";
import { STATUS_PEDIDO, type StatusPedido } from "@/lib/status";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const ItemSchema = z.object({
  produtoId: z.string().min(1),
  quantidade: z.coerce.number().int().positive(),
});

const PedidoSchema = z.object({
  clienteId: z.string().min(1),
  observacao: z.string().optional(),
  itens: z.array(ItemSchema).min(1, "Pedido precisa de pelo menos 1 item"), // RFC 10.4: RF05 só salva com ≥1 item
});

// RF05: dono registra pedido vinculado a um cliente existente, com itens e data.
export async function criarPedido(formData: FormData) {
  const raw = {
    clienteId: formData.get("clienteId"),
    observacao: formData.get("observacao") || undefined,
    itens: JSON.parse((formData.get("itensJson") as string) || "[]"),
  };
  const parsed = PedidoSchema.parse(raw);

  const produtos = await prisma.produto.findMany({
    where: { id: { in: parsed.itens.map((i) => i.produtoId) } },
  });
  const precoPorId = new Map(produtos.map((p) => [p.id, p.preco]));

  const itensComPreco = parsed.itens.map((i) => ({
    produtoId: i.produtoId,
    quantidade: i.quantidade,
    precoUnit: precoPorId.get(i.produtoId) ?? 0,
  }));
  const total = itensComPreco.reduce((soma, i) => soma + i.quantidade * i.precoUnit, 0);

  await prisma.pedido.create({
    data: {
      clienteId: parsed.clienteId,
      observacao: parsed.observacao,
      total,
      itens: { create: itensComPreco },
    },
  });

  revalidatePath("/crm/pedidos");
  redirect("/crm/pedidos");
}

export async function atualizarStatus(id: string, status: StatusPedido) {
  if (!STATUS_PEDIDO.includes(status)) throw new Error("Status inválido");
  await prisma.pedido.update({ where: { id }, data: { status } });
  revalidatePath("/crm/pedidos");
}
