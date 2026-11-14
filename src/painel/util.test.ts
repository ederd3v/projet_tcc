// @vitest-environment jsdom
// Testes das ferramentas do painel: formatação, telefone, proteção contra XSS.
import { describe, expect, it } from "vitest";
import { $, $$, $talvez, brl, curto, dd, esc, ini, iso, normalizarTelefone, pct, tel } from "./util";

describe("esc — proteção contra XSS", () => {
  it("transforma HTML em texto", () => {
    expect(esc('<script>alert("x")</script>')).toBe("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  });
  it("escapa aspas simples (usadas nos atributos do painel)", () => {
    expect(esc("D'Ávila")).toBe("D&#39;Ávila");
  });
  it("null e undefined viram texto vazio", () => {
    expect(esc(null)).toBe("");
    expect(esc(undefined)).toBe("");
  });
});

describe("telefone", () => {
  it("formata celular e fixo", () => {
    expect(tel("47999990000")).toBe("(47) 99999-0000");
    expect(tel("4733334444")).toBe("(47) 3333-4444");
  });
  it("normalizarTelefone guarda só DDD + número (sem o 55 do país)", () => {
    expect(normalizarTelefone("47 99999-0000")).toBe("47999990000");
    expect(normalizarTelefone("+55 (47) 99999-0000")).toBe("47999990000");
    expect(normalizarTelefone("5547999990000")).toBe("47999990000");
    expect(normalizarTelefone("554733334444")).toBe("4733334444");
  });
  it("normalizarTelefone não corta número que só começa com 55 por acaso", () => {
    expect(normalizarTelefone("55999990000")).toBe("55999990000"); // DDD 55 (RS), 11 dígitos
  });
});

describe("formatos", () => {
  it("dinheiro em reais", () => {
    expect(brl.format(82.5)).toMatch(/R\$\s?82,50/);
  });
  it("datas dd/mm e aaaa-mm-dd", () => {
    const d = new Date(2026, 10, 5); // 5 de novembro
    expect(dd(d)).toBe("05/11");
    expect(iso(d)).toBe("2026-11-05");
  });
  it("iniciais e nome curto", () => {
    expect(ini("Maria da Silva")).toBe("MS");
    expect(ini("  joão ")).toBe("J");
    expect(curto("Licor de Figo")).toBe("Figo");
    expect(curto("Kombucha Uva")).toBe("Uva");
    expect(curto("Ice Limão")).toBe("Limão");
  });
  it("variação percentual", () => {
    expect(pct(120, 100)).toBe(20);
    expect(pct(50, 100)).toBe(-50);
    expect(pct(5, 0)).toBe(100); // de zero para algo = +100%
    expect(pct(0, 0)).toBe(0);
  });
});

describe("achar elementos na tela", () => {
  it("$ acha, $talvez devolve null e $$ devolve lista", () => {
    document.body.innerHTML = '<p id="a" class="x"></p><p class="x"></p>';
    expect($("#a").id).toBe("a");
    expect($talvez("#nao-existe")).toBeNull();
    expect($$(".x")).toHaveLength(2);
  });
  it("$ dá erro claro se o HTML do painel mudar", () => {
    document.body.innerHTML = "";
    expect(() => $("#k-pedidos")).toThrow(/k-pedidos/);
  });
});
