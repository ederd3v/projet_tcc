// Testes de integridade do CATÁLOGO: todo produto tem foto, nota de sabor e
// preço — pega foto quebrada ou produto esquecido ANTES de ir para o ar.
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ices, kombuchas, licores, PRECO_ICE, PRECO_KOMBUCHA } from "./catalogo";
import { notasDaFoto } from "../src/lib/notas";

const todos = [...licores, ...kombuchas, ...ices];
const pasta = path.resolve(__dirname, "../public/products");

describe("catálogo", () => {
  it("tem 22 produtos: 11 licores, 7 kombuchas, 4 ices", () => {
    expect(licores).toHaveLength(11);
    expect(kombuchas).toHaveLength(7);
    expect(ices).toHaveLength(4);
  });
  it("nomes e fotos não se repetem", () => {
    expect(new Set(todos.map((p) => p.nome)).size).toBe(todos.length);
    expect(new Set(todos.map((p) => p.foto)).size).toBe(todos.length);
  });
  it("todo licor tem preço positivo; kombucha e ice têm preço de linha", () => {
    for (const l of licores) expect(l.preco, l.nome).toBeGreaterThan(0);
    expect(PRECO_KOMBUCHA).toBeGreaterThan(0);
    expect(PRECO_ICE).toBeGreaterThan(0);
  });
  it.each(todos.map((p) => [p.nome, p.foto]))("%s tem a foto .png (banco) e a .jpg leve (vitrine)", (_nome, foto) => {
    expect(existsSync(path.join(pasta, `${foto}.png`)), `${foto}.png`).toBe(true);
    expect(existsSync(path.join(pasta, `${foto}.jpg`)), `${foto}.jpg`).toBe(true);
  });
  it.each(todos.map((p) => [p.nome, p.foto]))("%s tem notas de sabor", (_nome, foto) => {
    const n = notasDaFoto(`/products/${foto}.png`);
    expect(n).not.toBeNull();
    expect(n?.sabor.length).toBeGreaterThan(3);
  });
});

describe("notasDaFoto", () => {
  it("funciona com .png, .jpg e caminho completo", () => {
    expect(notasDaFoto("/products/licor-figo.jpg")).toEqual(notasDaFoto("/products/licor-figo.png"));
  });
  it("produto sem nota devolve null (não quebra a tela)", () => {
    expect(notasDaFoto("/products/inexistente.png")).toBeNull();
  });
});
