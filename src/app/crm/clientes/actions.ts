"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ClienteSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  telefone: z.string().min(8, "Telefone inválido"),
  email: z.string().email().optional().or(z.literal("")),
});

// RF04: dono cadastra/edita/remove clientes manualmente.
export async function criarCliente(formData: FormData) {
  const parsed = ClienteSchema.parse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    email: formData.get("email") || "",
  });
  await prisma.cliente.create({
    data: { ...parsed, email: parsed.email || null },
  });
  revalidatePath("/crm/clientes");
}

export async function editarCliente(id: string, formData: FormData) {
  const parsed = ClienteSchema.parse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    email: formData.get("email") || "",
  });
  await prisma.cliente.update({
    where: { id },
    data: { ...parsed, email: parsed.email || null },
  });
  revalidatePath("/crm/clientes");
}

export async function removerCliente(id: string) {
  await prisma.cliente.delete({ where: { id } });
  revalidatePath("/crm/clientes");
}
