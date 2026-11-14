//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: API do CRM: o painel lê e salva TUDO por aqui.
//  ⚙️  COMO FUNCIONA: GET devolve produtos, clientes e pedidos do banco; PUT grava o que o dono editou no painel. Protegida pelo middleware (exige login).
//  🎓 NA BANCA: É a ponte painel <-> banco: o painel é só a tela, quem guarda os dados é o PostgreSQL.
//  ──────────────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ehStatusValido, STATUS_INICIAL } from "@/lib/status";
import { totalDoPedido, validarPedido } from "@/lib/regrasPedido";

export const dynamic = "force-dynamic";

/**
 * Estado completo do CRM, no formato que o painel já usa.
 *
 * O painel nasceu guardando tudo no localStorage e lê `M.estado` inteiro em
 * memória. Em vez de reescrever as cinco telas, esta rota entrega o mesmo
 * formato — só que montado a partir do banco. O painel continua igual; o que
 * muda é de onde os dados vêm.
 *
 * O preço do item fica gravado em `precoUnit` no momento da venda: se o dono
 * mudar o preço do produto depois, o histórico não se altera.
 */

// O painel é servido pelo próprio webapp (rota /painel), então painel e API
// dividem a mesma origem: o cookie de sessão acompanha as chamadas sozinho e
// não há CORS envolvido. O acesso é barrado pelo middleware, que cobre
// /painel e /api/crm/* — proteger só a tela deixaria os dados saindo pela API.

export async function GET() {
  // Marcado antes da consulta: um pedido que chegue durante ela conta como
  // "depois", e o PUT abaixo não o apaga.
  const carregadoEm = new Date();
  const [produtos, clientes, pedidos] = await Promise.all([
    prisma.produto.findMany({ orderBy: { criadoEm: "asc" } }),
    prisma.cliente.findMany({ orderBy: { criadoEm: "asc" } }),
    prisma.pedido.findMany({ orderBy: { data: "asc" }, include: { itens: true } }),
  ]);

  const estado = {
    versao: 3,
    // O painel guarda isto junto com o resto e devolve no PUT.
    carregadoEm: carregadoEm.toISOString(),
    produtos: produtos.map((p) => ({
      id: p.id,
      nome: p.nome,
      cat: p.categoria,
      preco: p.preco,
      img: p.fotoUrl,
      ativo: p.ativo,
      estoque: p.estoque,
    })),
    clientes: clientes.map((c) => ({
      id: c.id,
      nome: c.nome,
      tel: c.telefone,
      bairro: c.bairro ?? "",
      notas: c.notas ?? "",
      criado: c.criadoEm.toISOString(),
    })),
    pedidos: pedidos.map((o, i) => ({
      id: o.id,
      num: 1000 + i + 1,
      data: o.data.toISOString(),
      clienteId: o.clienteId,
      itens: o.itens.map((it) => ({ pid: it.produtoId, q: it.quantidade, preco: it.precoUnit })),
      origem: o.origem,
      pagamento: o.pagamento ?? "Pix",
      status: o.status,
      obs: o.observacao ?? "",
    })),
  };

  return NextResponse.json(estado);
}

type EstadoRecebido = {
  carregadoEm?: string;
  produtos?: { id: string; preco?: number; ativo?: boolean; estoque?: number }[];
  clientes?: { id: string; nome: string; tel?: string; bairro?: string; notas?: string }[];
  pedidos?: {
    id: string;
    data: string;
    clienteId: string | null; // null = pedido que veio do site
    status: string;
    origem?: string;
    pagamento?: string;
    obs?: string;
    itens: { pid: string; q: number; preco: number }[];
  }[];
};

export async function PUT(req: Request) {
  const corpo = (await req.json()) as EstadoRecebido;

  // RF05 no servidor: as mesmas regras do painel (src/lib/regrasPedido.ts).
  // Se alguém mandar um pedido inválido direto para a API, nada é gravado.
  const idsClientes = new Set((corpo.clientes ?? []).map((c) => c.id));
  for (const o of corpo.pedidos ?? []) {
    const problema = validarPedido(o, idsClientes);
    if (problema) {
      return NextResponse.json({ ok: false, erro: `Pedido ${o.id}: ${problema}` }, { status: 400 });
    }
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        // Produtos: o painel só altera preço, estoque e se está no catálogo.
        // Nome, foto e categoria continuam sendo do cadastro, não daqui.
        for (const p of corpo.produtos ?? []) {
          await tx.produto.updateMany({
            where: { id: p.id },
            data: {
              ...(p.preco !== undefined ? { preco: p.preco } : {}),
              ...(p.ativo !== undefined ? { ativo: p.ativo } : {}),
              ...(p.estoque !== undefined ? { estoque: p.estoque } : {}),
            },
          });
        }

        // Clientes e pedidos são substituídos por inteiro. É o que casa com o
        // painel, que manda sempre o estado completo — e mantém o banco como
        // espelho fiel do que está na tela, sem estado intermediário.
        //
        // Exceção: pedido do site que chegou depois que o painel carregou. O
        // painel ainda não o conhece, então ele não vem na lista. Sem isso, um
        // pedido feito com o painel aberto sumia no próximo salvamento
        // (achado ao corrigir a issue #3).
        const desde = corpo.carregadoEm ? new Date(corpo.carregadoEm) : null;
        const idsEnviados = (corpo.pedidos ?? []).map((o) => o.id);
        const chegaramDepois =
          desde && !isNaN(desde.getTime())
            ? await tx.pedido.findMany({
                where: { clienteId: null, data: { gt: desde }, id: { notIn: idsEnviados } },
                select: { id: true },
              })
            : [];
        const preservar = chegaramDepois.map((p) => p.id);
        await tx.itemPedido.deleteMany({ where: { pedidoId: { notIn: preservar } } });
        await tx.pedido.deleteMany({ where: { id: { notIn: preservar } } });

        // Inserção em lote, não um registro por vez. Com ~400 pedidos, criar
        // um a um são centenas de idas e voltas até o banco na nuvem — a
        // transação estourava o tempo. Em lote são três comandos.
        await tx.cliente.deleteMany({});
        if (corpo.clientes?.length) {
          await tx.cliente.createMany({
            data: corpo.clientes.map((c) => ({
              id: c.id,
              nome: c.nome,
              telefone: c.tel ?? "",
              bairro: c.bairro || null,
              notas: c.notas || null,
            })),
          });
        }

        // Todos já passaram por validarPedido acima: cliente existe (ou é
        // pedido do site ainda "novo"/"cancelado") e há pelo menos um item.
        const validos = corpo.pedidos ?? [];

        if (validos.length) {
          await tx.pedido.createMany({
            data: validos.map((o) => ({
              id: o.id,
              clienteId: o.clienteId || null,
              data: new Date(o.data),
              status: ehStatusValido(o.status) ? o.status : STATUS_INICIAL,
              origem: o.origem ?? "WhatsApp direto",
              pagamento: o.pagamento ?? null,
              observacao: o.obs || null,
              total: totalDoPedido(o.itens),
            })),
          });

          const itens = validos.flatMap((o) =>
            o.itens.map((it) => ({
              pedidoId: o.id,
              produtoId: it.pid,
              quantidade: it.q,
              precoUnit: it.preco,
            }))
          );
          if (itens.length) await tx.itemPedido.createMany({ data: itens });
        }
      },
      { timeout: 120_000, maxWait: 20_000 }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    // Mensagens do Prisma começam com quebra de linha e trazem o detalhe útil
    // no fim — cortar pela primeira linha devolvia string vazia.
    const bruto = e instanceof Error ? e.message.trim() : String(e);
    const msg = bruto.split("\n").filter(Boolean).slice(-2).join(" · ").slice(0, 300);
    console.error("[PUT /api/crm/estado]", bruto);
    return NextResponse.json({ ok: false, erro: msg || "erro ao salvar" }, { status: 500 });
  }
}
