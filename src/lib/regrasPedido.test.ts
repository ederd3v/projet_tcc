// Testes das regras do pedido (RF05) — as mesmas usadas no painel e na API.
import { describe, expect, it } from "vitest";
import { podeFicarSemCliente, totalDoPedido, validarPedido, type PedidoParaValidar } from "./regrasPedido";

const clientes = new Set(["c1", "c2"]);
const item = { pid: "p1", q: 2, preco: 30 };
const base: PedidoParaValidar = { clienteId: "c1", status: "novo", origem: "WhatsApp direto", itens: [item] };

describe("validarPedido — pedido com cliente", () => {
  it("aceita pedido completo de cliente existente", () => {
    expect(validarPedido(base, clientes)).toBeNull();
  });
  it("aceita qualquer etapa quando há cliente", () => {
    for (const status of ["novo", "confirmado", "rota", "entregue", "cancelado"]) {
      expect(validarPedido({ ...base, status }, clientes)).toBeNull();
    }
  });
  it("recusa cliente que não existe mais (o banco recusaria pela chave estrangeira)", () => {
    expect(validarPedido({ ...base, clienteId: "apagado" }, clientes)).toMatch(/não existe/);
  });
});

describe("validarPedido — itens", () => {
  it("recusa pedido sem itens", () => {
    expect(validarPedido({ ...base, itens: [] }, clientes)).toMatch(/pelo menos um item/);
  });
  it("recusa item sem produto", () => {
    expect(validarPedido({ ...base, itens: [{ ...item, pid: "" }] }, clientes)).toMatch(/sem produto/);
  });
  it.each([0, -1, 1.5, Number.NaN])("recusa quantidade inválida (%s)", (q) => {
    expect(validarPedido({ ...base, itens: [{ ...item, q }] }, clientes)).toMatch(/Quantidade/);
  });
  it.each([-0.01, Number.NaN])("recusa preço inválido (%s)", (preco) => {
    expect(validarPedido({ ...base, itens: [{ ...item, preco }] }, clientes)).toMatch(/Preço/);
  });
  it("aceita preço zero (brinde)", () => {
    expect(validarPedido({ ...base, itens: [{ ...item, preco: 0 }] }, clientes)).toBeNull();
  });
});

describe("validarPedido — pedido do site sem cliente", () => {
  const doSite: PedidoParaValidar = { ...base, clienteId: null, origem: "Site" };
  it("aceita enquanto está 'novo'", () => {
    expect(validarPedido(doSite, clientes)).toBeNull();
  });
  it("aceita 'cancelado' (descartar um pedido que não virou venda)", () => {
    expect(validarPedido({ ...doSite, status: "cancelado" }, clientes)).toBeNull();
  });
  it.each(["confirmado", "rota", "entregue"])("recusa '%s' sem cliente associado", (status) => {
    expect(validarPedido({ ...doSite, status }, clientes)).toMatch(/Associe um cliente/);
  });
  it("recusa pedido sem cliente que NÃO veio do site", () => {
    expect(validarPedido({ ...doSite, origem: "Instagram" }, clientes)).toMatch(/Escolha o cliente/);
  });
});

describe("auxiliares", () => {
  it("podeFicarSemCliente só para novo e cancelado", () => {
    expect(podeFicarSemCliente("novo")).toBe(true);
    expect(podeFicarSemCliente("cancelado")).toBe(true);
    expect(podeFicarSemCliente("confirmado")).toBe(false);
  });
  it("totalDoPedido soma quantidade × preço", () => {
    expect(totalDoPedido([{ pid: "a", q: 2, preco: 30 }, { pid: "b", q: 3, preco: 7.5 }])).toBe(82.5);
    expect(totalDoPedido([])).toBe(0);
  });
});
