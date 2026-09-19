"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ProdutoSchema = z.object({
  nome: z.string().min(2),
  descricao: z.string().min(2),
  preco: z.coerce.number().positive(),
  fotoUrl: z.string().min(1),
  categoria: z.enum(["licor", "kombucha", "ice"]),
  volumeMl: z.coerce.number().int().positive(),
});

// RF07: dono adiciona/edita/remove produtos.
export async function criarProduto(formData: FormData) {
  const parsed = ProdutoSchema.parse({
    nome: formData.get("nome"),
    descricao: formData.get("descricao"),
    preco: formData.get("preco"),
    fotoUrl: formData.get("fotoUrl"),
    categoria: formData.get("categoria"),
    volumeMl: formData.get("volumeMl"),
  });
  await prisma.produto.create({ data: parsed });
  revalidatePath("/crm/produtos");
  revalidatePath("/");
}

export async function alternarAtivo(id: string, ativo: boolean) {
  await prisma.produto.update({ where: { id }, data: { ativo } });
  revalidatePath("/crm/produtos");
  revalidatePath("/");
}

export async function removerProduto(id: string) {
  await prisma.produto.delete({ where: { id } });
  revalidatePath("/crm/produtos");
  revalidatePath("/");
}
