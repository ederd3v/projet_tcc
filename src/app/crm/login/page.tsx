"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

// RF03: login do dono. Em produção usa o Cognito (botão dedicado); o
// formulário de e-mail/senha abaixo é o fallback local pra testar o CRM
// antes do User Pool existir (ver src/lib/auth.ts).
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/painel";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const hasCognito = process.env.NEXT_PUBLIC_HAS_COGNITO === "true";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    const res = await signIn("owner-fallback", {
      email,
      password,
      redirect: false,
    });
    setCarregando(false);
    if (res?.error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }
    router.push(callbackUrl);
  }

  return (
    <main className="halo-bg flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-maruim-amber/20 bg-maruim-bgAlt p-8">
        <h1 className="font-display text-2xl text-maruim-amberLight">Painel Maruim</h1>
        <p className="mt-1 text-sm text-maruim-muted">Login do dono</p>

        {hasCognito && (
          <button
            type="button"
            onClick={() => signIn("cognito", { callbackUrl })}
            className="mt-6 w-full rounded-full bg-maruim-amber px-4 py-2 text-maruim-bg"
          >
            Entrar com Cognito
          </button>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-maruim-cream">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-maruim-amber/30 bg-maruim-bg px-3 py-2 text-maruim-cream"
            />
          </div>
          <div>
            <label className="text-sm text-maruim-cream">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-maruim-amber/30 bg-maruim-bg px-3 py-2 text-maruim-cream"
            />
          </div>
          {erro && <p className="text-sm text-red-400">{erro}</p>}
          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-full border border-maruim-amber px-4 py-2 text-maruim-amberLight disabled:opacity-50"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
