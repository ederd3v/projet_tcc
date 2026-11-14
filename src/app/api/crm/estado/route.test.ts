// Testes da API do CRM (banco simulado): leitura no formato do painel e as
// regras do RF05 conferidas no servidor antes de gravar.
import { beforeEach, describe, expect, it, vi } from "vitest";

const tx = {
  produto: { updateMany: vi.fn() },
  pedido: { findMany: vi.fn().mockResolvedValue([]), deleteMany: vi.fn(), createMany: vi.fn() },
  itemPedido: { deleteMany: vi.fn(), createMany: vi.fn() },
  cliente: { deleteMany: vi.fn(), createMany: vi.fn() },
};
const transacao = vi.fn(async (fn: (t: typeof tx) => Promise<void>) => fn(tx));
const db = {
  produto: { findMany: vi.fn() },
  cliente: { findMany: vi.fn() },
  pedido: { findMany: vi.fn() },
  $transaction: (fn: (t: typeof tx) => Promise<void>) => transacao(fn),
};
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.spyOn(console, "error").mockImplementation(() => {});
const { GET, PUT } = await import("./route");

const enviar = (corpo: unknown) =>
  PUT(new Request("http://localhost/api/crm/estado", { method: "PUT", body: JSON.stringify(corpo), headers: { "Content-Type": "application/json" } }));

const cliente = { id: "c1", nome: "Ana", tel: "47999990000" };
const item = { pid: "p1", q: 1, preco: 40 };
const pedido = (extra: object) => ({ id: "o1", data: "2026-11-01T10:00:00.000Z", clienteId: "c1", status: "novo", origem: "Instagram", itens: [item], ...extra });

beforeEach(() => {
  transacao.mockClear();
  Object.values(tx).forEach((m) => Object.values(m).forEach((f) => (f as ReturnType<typeof vi.fn>).mockClear()));
});

describe("GET /api/crm/estado", () => {
  it("devolve produtos, clientes e pedidos no formato do painel", async () => {
    db.produto.findMany.mockResolvedValue([{ id: "p1", nome: "Licor de Figo", categoria: "licor", preco: 40, fotoUrl: "/products/licor-figo.png", ativo: true, estoque: 5 }]);
    db.cliente.findMany.mockResolvedValue([{ id: "c1", nome: "Ana", telefone: "47999990000", bairro: null, notas: null, criadoEm: new Date("2026-01-01") }]);
    db.pedido.findMany.mockResolvedValue([{ id: "o1", clienteId: "c1", data: new Date("2026-11-01"), status: "entregue", origem: "Site", pagamento: null, observacao: null, itens: [{ produtoId: "p1", quantidade: 2, precoUnit: 40 }] }]);
    const e = await (await GET()).json();
    expect(e.produtos[0]).toMatchObject({ id: "p1", cat: "licor", img: "/products/licor-figo.png" });
    expect(e.clientes[0]).toMatchObject({ tel: "47999990000", bairro: "", notas: "" });
    expect(e.pedidos[0]).toMatchObject({ num: 1001, itens: [{ pid: "p1", q: 2, preco: 40 }] });
    expect(e.carregadoEm).toBeTruthy();
  });
});

describe("PUT /api/crm/estado — regras do RF05 no servidor", () => {
  it("grava estado válido (dentro de uma transação)", async () => {
    const r = await enviar({ clientes: [cliente], pedidos: [pedido({})], produtos: [] });
    expect(r.status).toBe(200);
    expect(transacao).toHaveBeenCalledOnce();
    expect(tx.pedido.createMany.mock.calls[0][0].data[0].total).toBe(40);
  });
  it("recusa pedido do site 'confirmado' sem cliente — e não grava nada", async () => {
    const r = await enviar({ clientes: [cliente], pedidos: [pedido({ clienteId: null, origem: "Site", status: "confirmado" })] });
    expect(r.status).toBe(400);
    expect((await r.json()).erro).toMatch(/Associe um cliente/);
    expect(transacao).not.toHaveBeenCalled();
  });
  it("aceita pedido do site 'novo' sem cliente", async () => {
    const r = await enviar({ clientes: [cliente], pedidos: [pedido({ clienteId: null, origem: "Site" })] });
    expect(r.status).toBe(200);
  });
  it("recusa pedido de cliente que não existe", async () => {
    const r = await enviar({ clientes: [cliente], pedidos: [pedido({ clienteId: "fantasma" })] });
    expect(r.status).toBe(400);
  });
  it("recusa pedido sem itens", async () => {
    const r = await enviar({ clientes: [cliente], pedidos: [pedido({ itens: [] })] });
    expect(r.status).toBe(400);
  });
  it("status desconhecido é gravado como 'novo' (não some do quadro)", async () => {
    await enviar({ clientes: [cliente], pedidos: [pedido({ status: "pago" })] });
    expect(tx.pedido.createMany.mock.calls[0][0].data[0].status).toBe("novo");
  });
  it("corpo malformado (pedido sem a lista de itens) responde 400, não 500", async () => {
    const r = await enviar({ clientes: [cliente], pedidos: [{ id: "x", clienteId: "c1", status: "novo" }] });
    expect(r.status).toBe(400);
    expect(transacao).not.toHaveBeenCalled();
  });
  it("corpo que não é JSON responde 400", async () => {
    const r = await PUT(new Request("http://localhost/api/crm/estado", { method: "PUT", body: "{quebrado" }));
    expect(r.status).toBe(400);
  });
  it("erro do banco vira 500 com mensagem curta", async () => {
    transacao.mockRejectedValueOnce(new Error("\nInvalid prisma call\nForeign key constraint failed"));
    const r = await enviar({ clientes: [cliente], pedidos: [pedido({})] });
    expect(r.status).toBe(500);
    expect((await r.json()).erro).toMatch(/Foreign key/);
  });
});
