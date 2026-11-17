// Testes do "porteiro": quais endereços exigem login (RNF03).
import { describe, expect, it, vi } from "vitest";

vi.mock("next-auth/middleware", () => ({ withAuth: (o: unknown) => o }));
const mod = await import("./middleware");
const opcoes = mod.default as unknown as { callbacks: { authorized: (a: { token: unknown; req: { nextUrl: { pathname: string } } }) => boolean } };
const autorizado = (pathname: string, token: unknown) => opcoes.callbacks.authorized({ token, req: { nextUrl: { pathname } } });

describe("middleware de login", () => {
  it("protege o painel, a área /crm e a API do CRM", () => {
    expect(mod.config.matcher).toEqual(expect.arrayContaining(["/painel", "/painel/:path*", "/crm/:path*", "/api/crm/:path*"]));
  });
  it("NÃO protege a API pública do pedido do site", () => {
    expect(mod.config.matcher.some((m: string) => m.startsWith("/api/pedido"))).toBe(false);
  });
  it("sem sessão: bloqueia o painel", () => {
    expect(autorizado("/painel", null)).toBe(false);
    expect(autorizado("/api/crm/estado", null)).toBe(false);
  });
  it("com sessão: libera", () => {
    expect(autorizado("/painel", { sub: "owner" })).toBe(true);
  });
  it("a própria tela de login fica liberada (senão seria um laço)", () => {
    expect(autorizado("/crm/login", null)).toBe(true);
  });
});
