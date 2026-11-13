//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: Rotas do NextAuth (login, logout, sessão).
//  ⚙️  COMO FUNCIONA: Só conecta o NextAuth à configuração que está em src/lib/auth.ts.
//  🎓 NA BANCA: Biblioteca pronta e testada para autenticação, em vez de criar login do zero.
//  ──────────────────────────────────────────────────────────────────────
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
