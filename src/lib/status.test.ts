// Testes das etapas do pedido (a coluna do quadro depende delas).
import { describe, expect, it } from "vitest";
import { ehStatusValido, STATUS_INICIAL, STATUS_PEDIDO } from "./status";

describe("status do pedido", () => {
  it("tem as 5 etapas do quadro, na ordem", () => {
    expect(STATUS_PEDIDO).toEqual(["novo", "confirmado", "rota", "entregue", "cancelado"]);
  });
  it("pedido novo começa em 'novo'", () => {
    expect(STATUS_INICIAL).toBe("novo");
  });
  it("reconhece só valores da lista", () => {
    expect(ehStatusValido("entregue")).toBe(true);
    expect(ehStatusValido("Entregue")).toBe(false); // maiúscula não vale
    expect(ehStatusValido("pago")).toBe(false);
    expect(ehStatusValido(3)).toBe(false);
    expect(ehStatusValido(null)).toBe(false);
  });
});
