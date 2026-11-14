// Testes da API pública que registra o pedido feito no site (banco simulado).
import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();
const create = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: { produto: { findUnique: (...a: unknown[]) => findUnique(...a) }, pedido: { create: (...a: unknown[]) => create(...a) } },
}));
vi.spyOn(console, "error").mockImplementation(() => {});
const { POST } = await import("./route");

const pedir = (corpo: unknown) =>
  POST(new Request("http://localhost/api/pedido-do-site", { method: "POST", body: JSON.stringify(corpo), headers: { "Content-Type": "application/json" } }));

beforeEach(() => {
  findUnique.mockReset().mockResolvedValue({ id: "figo", preco: 40, ativo: true });
  create.mockReset().mockResolvedValue({ id: "novo-pedido" });
});

describe("POST /api/pedido-do-site", () => {
  it("registra o pedido como 'novo', origem 'Site', sem cliente", async () => {
    const r = await pedir({ produtoId: "figo", quantidade: 2 });
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: true, pedidoId: "novo-pedido" });
    const data = create.mock.calls[0][0].data;
    expect(data.status).toBe("novo");
    expect(data.origem).toBe("Site");
    expect(data.clienteId).toBeUndefined();
  });
  it("usa o PREÇO DO BANCO, ignorando preço enviado pelo navegador", async () => {
    await pedir({ produtoId: "figo", quantidade: 3, preco: 0.01, total: 0.03 });
    const data = create.mock.calls[0][0].data;
    expect(data.total).toBe(120);
    expect(data.itens.create[0].precoUnit).toBe(40);
  });
  it("quantidade padrão é 1", async () => {
    await pedir({ produtoId: "figo" });
    expect(create.mock.calls[0][0].data.itens.create[0].quantidade).toBe(1);
  });
  it.each([0, -2, 51, 1.5, "abc"])("recusa quantidade inválida (%s)", async (quantidade) => {
    const r = await pedir({ produtoId: "figo", quantidade });
    expect(r.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });
  it("recusa sem produto", async () => {
    expect((await pedir({})).status).toBe(400);
  });
  it("produto desligado no CRM não pode ser pedido (404)", async () => {
    findUnique.mockResolvedValue({ id: "figo", preco: 40, ativo: false });
    expect((await pedir({ produtoId: "figo" })).status).toBe(404);
    expect(create).not.toHaveBeenCalled();
  });
  it("produto inexistente: 404", async () => {
    findUnique.mockResolvedValue(null);
    expect((await pedir({ produtoId: "nao-existe" })).status).toBe(404);
  });
  it("corpo que não é JSON: 400 (não derruba o servidor)", async () => {
    const r = await POST(new Request("http://localhost/api/pedido-do-site", { method: "POST", body: "isso não é json" }));
    expect(r.status).toBe(400);
  });
});
