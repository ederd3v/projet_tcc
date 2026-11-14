// Testes do selo "★ Mais pedido" (banco simulado: não precisa de PostgreSQL).
import { beforeEach, describe, expect, it, vi } from "vitest";

const groupBy = vi.fn();
vi.mock("@/lib/prisma", () => ({ prisma: { itemPedido: { groupBy: (...a: unknown[]) => groupBy(...a) } } }));
const { maisPedidoId } = await import("./maisPedido");

beforeEach(() => groupBy.mockReset());

describe("maisPedidoId", () => {
  it("devolve o produto campeão quando tem 3+ unidades", async () => {
    groupBy.mockResolvedValue([{ produtoId: "figo", _sum: { quantidade: 7 } }]);
    expect(await maisPedidoId()).toBe("figo");
  });
  it("não elege ninguém com menos de 3 unidades (pedido de teste solto)", async () => {
    groupBy.mockResolvedValue([{ produtoId: "figo", _sum: { quantidade: 2 } }]);
    expect(await maisPedidoId()).toBeNull();
  });
  it("banco sem pedidos: sem selo", async () => {
    groupBy.mockResolvedValue([]);
    expect(await maisPedidoId()).toBeNull();
  });
  it("ignora pedidos cancelados na consulta", async () => {
    groupBy.mockResolvedValue([]);
    await maisPedidoId();
    expect(groupBy.mock.calls[0][0].where).toEqual({ pedido: { status: { not: "cancelado" } } });
  });
});
