import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { STATUS_INICIAL } from "@/lib/status";

export const dynamic = "force-dynamic";

/**
 * Registra a intenção de compra nascida na landing.
 *
 * Quando o visitante clica em "Pedir no WhatsApp", o pedido é criado aqui com
 * status "novo" e origem "Site", e aparece na primeira coluna do quadro do
 * painel. Fica **sem cliente**: quem clicou é anônimo até a conversa no
 * WhatsApp acontecer. O dono associa o cliente ao confirmar.
 *
 * Isto não automatiza o WhatsApp — não há como ler a conversa dele. O que se
 * ganha é saber o que foi clicado, quando, e por qual produto: é o dado que
 * alimenta o gráfico "De onde vêm os pedidos" e o que o RFC (seção 5) chama
 * de registro manual, só que com o primeiro passo já preenchido.
 *
 * Rota pública de propósito — é o visitante do site que a chama. Por isso o
 * corpo é validado e nada além do produto e da quantidade é aceito.
 */

const Entrada = z.object({
  produtoId: z.string().min(1).max(64),
  quantidade: z.coerce.number().int().min(1).max(50).default(1),
});

export async function POST(req: Request) {
  try {
    const { produtoId, quantidade } = Entrada.parse(await req.json());

    // O preço vem do banco, nunca do cliente: aceitar preço enviado pelo
    // navegador deixaria qualquer um registrar um pedido de R$ 0,01.
    const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
    if (!produto || !produto.ativo) {
      return NextResponse.json({ ok: false, erro: "produto indisponível" }, { status: 404 });
    }

    const pedido = await prisma.pedido.create({
      data: {
        status: STATUS_INICIAL,
        origem: "Site",
        total: produto.preco * quantidade,
        observacao: "Aberto pelo site, aguardando contato no WhatsApp",
        itens: { create: [{ produtoId: produto.id, quantidade, precoUnit: produto.preco }] },
      },
    });

    return NextResponse.json({ ok: true, pedidoId: pedido.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message.trim().split("\n").filter(Boolean).slice(-1)[0] : "erro";
    console.error("[POST /api/pedido-do-site]", msg);
    return NextResponse.json({ ok: false, erro: "não foi possível registrar" }, { status: 400 });
  }
}
