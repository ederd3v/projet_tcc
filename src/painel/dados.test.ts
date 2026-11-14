// Testes da camada de DADOS do painel (API simulada com um fetch falso).
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Estado } from "./tipos";

const respostas: { metodo: string; corpo?: Estado }[] = [];
let estadoDoServidor: Estado;

function fixture(): Estado {
  return {
    versao: 3,
    produtos: [
      { id: "p1", nome: "Licor de Figo", cat: "licor", preco: 40, img: "/products/licor-figo.png", ativo: true, estoque: 10 },
      { id: "p2", nome: "Ice Limão", cat: "ice", preco: 7.5, img: "licor-antigo.jpg", ativo: true, estoque: 1 },
    ],
    clientes: [
      { id: "c1", nome: "Ana", tel: "47999990000", bairro: "Centro", notas: "" },
      { id: "c2", nome: "Bruno", tel: "47988880000", bairro: "", notas: "" },
    ],
    pedidos: [
      { id: "o1", num: 1001, data: "2026-11-01T10:00:00.000Z", clienteId: "c1", itens: [{ pid: "p1", q: 2, preco: 40 }], origem: "Instagram", pagamento: "Pix", status: "entregue", obs: "" },
      { id: "o2", num: 1002, data: "2026-11-02T10:00:00.000Z", clienteId: "c1", itens: [{ pid: "p2", q: 1, preco: 7.5 }], origem: "Site", pagamento: "Pix", status: "novo", obs: "" },
      { id: "o3", num: 1003, data: "2026-11-03T10:00:00.000Z", clienteId: null, itens: [{ pid: "p1", q: 1, preco: 40 }], origem: "Site", pagamento: "Pix", status: "novo", obs: "" },
    ],
  };
}

async function carregarModulo() {
  vi.resetModules();
  respostas.length = 0;
  estadoDoServidor = fixture();
  vi.stubGlobal("fetch", vi.fn(async (_url: string, init?: RequestInit) => {
    const metodo = init?.method ?? "GET";
    if (metodo === "PUT") { respostas.push({ metodo, corpo: JSON.parse(String(init?.body)) }); return new Response('{"ok":true}', { status: 200 }); }
    respostas.push({ metodo });
    return new Response(JSON.stringify(estadoDoServidor), { status: 200 });
  }));
  const D = await import("./dados");
  await D.carregar();
  return D;
}

let D: Awaited<ReturnType<typeof carregarModulo>>;
beforeEach(async () => { D = await carregarModulo(); });

describe("carregar", () => {
  it("traz o estado do banco e corrige caminho antigo de foto", () => {
    expect(D.estado.clientes).toHaveLength(2);
    expect(D.produto("p1")?.img).toBe("/products/licor-figo.png"); // absoluto: mantém
    expect(D.produto("p2")?.img).toBe("/painel/assets/img/licor-antigo.jpg"); // relativo antigo: reancora
  });
});

describe("pedidos", () => {
  it("totalPedido soma os itens", () => {
    expect(D.totalPedido(D.pedido("o1")!)).toBe(80);
  });
  it("novo pedido recebe o próximo número, status 'novo', baixa o estoque e salva no banco", async () => {
    const novo = D.salvarPedido({ clienteId: "c2", itens: [{ pid: "p1", q: 3, preco: 40 }], origem: "WhatsApp direto", pagamento: "Pix", obs: "" });
    expect(novo.num).toBe(1004);
    expect(novo.status).toBe("novo");
    expect(D.produto("p1")?.estoque).toBe(7);
    await vi.waitFor(() => expect(respostas.filter((r) => r.metodo === "PUT")).toHaveLength(1));
  });
  it("estoque nunca fica negativo", () => {
    D.salvarPedido({ clienteId: "c2", itens: [{ pid: "p2", q: 5, preco: 7.5 }], origem: "Site", pagamento: "Pix", obs: "" });
    expect(D.produto("p2")?.estoque).toBe(0);
  });
  it("editar pedido não cria outro nem mexe no número", () => {
    const antes = D.estado.pedidos.length;
    const editado = D.salvarPedido({ id: "o1", clienteId: "c1", itens: [{ pid: "p1", q: 1, preco: 40 }], origem: "Instagram", pagamento: "Dinheiro", obs: "ok" });
    expect(D.estado.pedidos).toHaveLength(antes);
    expect(editado.num).toBe(1001);
    expect(editado.pagamento).toBe("Dinheiro");
  });
  it("excluirPedido remove só aquele", () => {
    D.excluirPedido("o2");
    expect(D.estado.pedidos.map((o) => o.id)).toEqual(["o1", "o3"]);
  });
});

describe("clientes (RF04)", () => {
  it("cadastra cliente novo com id e data", () => {
    const c = D.salvarCliente({ nome: "Carla", tel: "47977770000", bairro: "", notas: "" });
    expect(c.id).toMatch(/^c/);
    expect(c.criado).toBeTruthy();
    expect(D.estado.clientes).toHaveLength(3);
  });
  it("edita cliente existente sem duplicar", () => {
    D.salvarCliente({ id: "c2", nome: "Bruno Souza", tel: "47988880000", bairro: "Glória", notas: "" });
    expect(D.estado.clientes).toHaveLength(2);
    expect(D.cliente("c2")?.nome).toBe("Bruno Souza");
  });
  it("excluirCliente remove o cliente e os pedidos dele (os do site sem dono ficam)", () => {
    expect(D.pedidosDoCliente("c1")).toHaveLength(2);
    D.excluirCliente("c1");
    expect(D.cliente("c1")).toBeUndefined();
    expect(D.estado.pedidos.map((o) => o.id)).toEqual(["o3"]);
  });
  it("limparClientes mantém só os pedidos do site sem cliente", () => {
    D.limparClientes();
    expect(D.estado.clientes).toHaveLength(0);
    expect(D.estado.pedidos.every((o) => o.clienteId === null)).toBe(true);
  });
  it("cliente(null) não quebra (pedido do site)", () => {
    expect(D.cliente(null)).toBeUndefined();
  });
});

describe("salvar", () => {
  it("cliques em sequência não geram fila: no máximo 1 envio extra", async () => {
    void D.salvar(); void D.salvar(); void D.salvar();
    await vi.waitFor(() => expect(respostas.filter((r) => r.metodo === "PUT").length).toBe(2));
    await new Promise((r) => setTimeout(r, 20));
    expect(respostas.filter((r) => r.metodo === "PUT").length).toBe(2);
  });
  it("erro do banco chega ao aviso da tela", async () => {
    const avisos: string[] = [];
    D.aoFalharSalvar((e) => avisos.push(e.message));
    vi.stubGlobal("fetch", vi.fn(async () => new Response('{"erro":"Pedido x: inválido"}', { status: 400 })));
    await D.salvar();
    expect(avisos).toEqual(["Pedido x: inválido"]);
  });
  it("embaralhar gera dados de exemplo válidos para as regras do RF05", async () => {
    const { validarPedido } = await import("@/lib/regrasPedido");
    D.embaralhar();
    const ids = new Set(D.estado.clientes.map((c) => c.id));
    expect(D.estado.pedidos.length).toBeGreaterThan(100);
    expect(D.estado.pedidos.every((o) => validarPedido(o, ids) === null)).toBe(true);
  });
});
