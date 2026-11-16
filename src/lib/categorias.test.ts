// Testes das 3 linhas de produto (usadas no menu, na home e no rodapé).
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATEGORIAS } from "./categorias";

describe("linhas de produto", () => {
  it("são exatamente licor, kombucha e ice (o mesmo campo 'categoria' do banco)", () => {
    expect(CATEGORIAS.map((c) => c.categoria)).toEqual(["licor", "kombucha", "ice"]);
  });
  it("cada linha aponta para uma página que existe (sem link quebrado no menu)", () => {
    for (const c of CATEGORIAS) {
      const pagina = path.resolve(__dirname, "../app/(site)", c.href.slice(1), "page.tsx");
      expect(existsSync(pagina), c.href).toBe(true);
    }
  });
  it("título e destaque combinam (a palavra em destaque está no título)", () => {
    for (const c of CATEGORIAS) expect(c.titulo).toContain(c.destaque);
  });
});
