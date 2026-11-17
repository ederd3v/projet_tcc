// Testes do link do WhatsApp (RF02): número certo e mensagem sempre preenchida.
import { afterEach, describe, expect, it, vi } from "vitest";

// O número vem de uma variável de ambiente lida quando o arquivo carrega,
// por isso cada teste importa o módulo de novo.
async function carregar(numero?: string) {
  vi.resetModules();
  if (numero === undefined) vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
  else vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", numero);
  return import("./whatsapp");
}
afterEach(() => vi.unstubAllEnvs());

describe("whatsappLinkForProduct", () => {
  it("abre o wa.me do número configurado com a mensagem do produto", async () => {
    const { whatsappLinkForProduct } = await carregar("5547992401430");
    const link = whatsappLinkForProduct("Licor de Figo", 40);
    const url = new URL(link);
    expect(url.origin + url.pathname).toBe("https://wa.me/5547992401430");
    const texto = url.searchParams.get("text") ?? "";
    expect(texto).toContain("Licor de Figo");
    expect(texto).toMatch(/R\$\s?40,00/);
    expect(texto.length).toBeGreaterThan(10); // nunca em branco (bug do site antigo)
  });
  it("codifica acentos e & no texto (não quebra a URL)", async () => {
    const { whatsappLinkForProduct } = await carregar("5547992401430");
    const link = whatsappLinkForProduct("Kombucha Abacaxi & Hortelã", 11);
    expect(link).not.toContain(" ");
    expect(new URL(link).searchParams.get("text")).toContain("Kombucha Abacaxi & Hortelã");
  });
  it("sem variável configurada, usa o número fixo da Maruim", async () => {
    const { whatsappLinkGeneric } = await carregar();
    expect(whatsappLinkGeneric()).toContain("wa.me/5547992401430");
  });
});

describe("WHATSAPP_DISPLAY", () => {
  it("formata o número para exibir: (47) 9 9240-1430", async () => {
    const { WHATSAPP_DISPLAY } = await carregar("5547992401430");
    expect(WHATSAPP_DISPLAY).toBe("(47) 9 9240-1430");
  });
  it("número em formato inesperado aparece como veio (sem inventar)", async () => {
    const { WHATSAPP_DISPLAY } = await carregar("554733334444");
    expect(WHATSAPP_DISPLAY).toBe("554733334444");
  });
});
