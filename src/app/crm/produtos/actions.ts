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

// Edição rápida de preço e estoque, direto no card — é como a tela de
// Produtos do protótipo funciona: o dono digita e sai do campo, sem
// formulário nem botão de salvar.
const PrecoSchema = z.coerce.number().min(0).max(100000);
const EstoqueSchema = z.coerce.number().int().min(0).max(100000);

export async function editarPreco(id: string, preco: number) {
  const valor = Math.round(PrecoSchema.parse(preco) * 100) / 100;
  await prisma.produto.update({ where: { id }, data: { preco: valor } });
  revalidatePath("/crm/produtos");
  revalidatePath("/");
  return valor;
}

export async function editarEstoque(id: string, estoque: number) {
  const valor = EstoqueSchema.parse(estoque);
  await prisma.produto.update({ where: { id }, data: { estoque: valor } });
  revalidatePath("/crm/produtos");
  return valor;
}

// Marca/desmarca o produto como destaque da home e define o selo mostrado
// no card grande (RF07 — quem escolhe o destaque é o dono, não o código).
export async function alternarDestaque(id: string, destaque: boolean, selo?: string | null) {
  await prisma.produto.update({
    where: { id },
    data: { destaque, selo: destaque ? (selo?.trim() || "Destaque") : null },
  });
  revalidatePath("/crm/produtos");
  revalidatePath("/");
}
