// Testes do LOGIN do dono (RF03): senha certa entra, errada não, e o hash
// bcrypt é conferido — a senha nunca é comparada em texto.
import bcrypt from "bcryptjs";
import { afterEach, describe, expect, it, vi } from "vitest";

const SENHA = "senha-de-teste-123";
const HASH = bcrypt.hashSync(SENHA, 4); // custo baixo: só para o teste ser rápido

type Autorizar = (c: Record<string, string> | undefined) => Promise<unknown>;

async function carregar(env: Record<string, string>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  const { authOptions } = await import("./auth");
  // No NextAuth v4 o id personalizado ("owner-fallback") fica em provider.options.
  type ComOpcoes = { id: string; options?: { id?: string; authorize: Autorizar } };
  const lista = authOptions.providers as unknown as ComOpcoes[];
  const p = lista.find((x) => x.options?.id === "owner-fallback" || x.id === "owner-fallback");
  if (!p?.options) throw new Error("provedor owner-fallback não encontrado");
  return { authOptions, autorizar: p.options.authorize };
}
afterEach(() => vi.unstubAllEnvs());

const ENV = { OWNER_EMAIL: "jaisson@maruim.com.br", OWNER_PASSWORD_HASH: HASH, COGNITO_CLIENT_ID: "", COGNITO_CLIENT_SECRET: "", COGNITO_ISSUER: "" };

describe("login do dono (fallback local)", () => {
  it("e-mail e senha certos: entra como dono", async () => {
    const { autorizar } = await carregar(ENV);
    expect(await autorizar({ email: "jaisson@maruim.com.br", password: SENHA })).toMatchObject({ id: "owner", email: "jaisson@maruim.com.br" });
  });
  it("senha errada: não entra", async () => {
    const { autorizar } = await carregar(ENV);
    expect(await autorizar({ email: "jaisson@maruim.com.br", password: "errada" })).toBeNull();
  });
  it("e-mail de outra pessoa: não entra (mesmo com a senha certa)", async () => {
    const { autorizar } = await carregar(ENV);
    expect(await autorizar({ email: "intruso@x.com", password: SENHA })).toBeNull();
  });
  it("e-mail com maiúsculas ou espaços (digitado no celular) também entra", async () => {
    const { autorizar } = await carregar(ENV);
    expect(await autorizar({ email: "  Jaisson@Maruim.com.br ", password: SENHA })).not.toBeNull();
  });
  it("campos vazios: não entra", async () => {
    const { autorizar } = await carregar(ENV);
    expect(await autorizar({ email: "", password: "" })).toBeNull();
    expect(await autorizar(undefined)).toBeNull();
  });
  it("servidor sem senha configurada: ninguém entra (falha fechada)", async () => {
    const { autorizar } = await carregar({ ...ENV, OWNER_PASSWORD_HASH: "" });
    expect(await autorizar({ email: "jaisson@maruim.com.br", password: SENHA })).toBeNull();
  });
});

describe("configuração", () => {
  it("sessão em JWT e tela de login própria", async () => {
    const { authOptions } = await carregar(ENV);
    expect(authOptions.session?.strategy).toBe("jwt");
    expect(authOptions.pages?.signIn).toBe("/crm/login");
  });
  it("com o Cognito configurado, o login local é desligado", async () => {
    const { authOptions, autorizar } = await carregar({ ...ENV, COGNITO_CLIENT_ID: "id", COGNITO_CLIENT_SECRET: "s", COGNITO_ISSUER: "https://cognito-idp.us-east-1.amazonaws.com/x" });
    expect(authOptions.providers.some((p) => p.id === "cognito")).toBe(true);
    expect(await autorizar({ email: "jaisson@maruim.com.br", password: SENHA })).toBeNull();
  });
});
