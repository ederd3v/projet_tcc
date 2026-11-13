//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: Configuração do LOGIN (NextAuth).
//  ⚙️  COMO FUNCIONA: Compara e-mail e senha digitados com OWNER_EMAIL e o hash bcrypt de OWNER_PASSWORD_HASH (variáveis do Amplify). Já deixa o Cognito pronto para quando for criado.
//  🎓 NA BANCA: Senha nunca é guardada, só o hash. Trocar para Cognito não exige mudar código.
//  ──────────────────────────────────────────────────────────────────────
import type { NextAuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// RF03: painel CRM exige login do dono. RFC 6.2/9 especifica Amazon Cognito.
//
// Enquanto o User Pool não existe (ver README.md → "Publicando na AWS"), as vars
// COGNITO_* ficam vazias e o provider abaixo cai no fallback local — login
// por e-mail + hash bcrypt guardado em .env, só pra dar pra testar o CRUD
// localmente. Assim que o Cognito estiver provisionado, basta preencher as
// 3 vars e o app passa a usar o provider de produção sem mudar código.

const hasCognito =
  !!process.env.COGNITO_CLIENT_ID &&
  !!process.env.COGNITO_CLIENT_SECRET &&
  !!process.env.COGNITO_ISSUER;

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/crm/login" },
  providers: [
    ...(hasCognito
      ? [
          CognitoProvider({
            clientId: process.env.COGNITO_CLIENT_ID!,
            clientSecret: process.env.COGNITO_CLIENT_SECRET!,
            issuer: process.env.COGNITO_ISSUER!,
          }),
        ]
      : []),
    CredentialsProvider({
      id: "owner-fallback",
      name: "Dono (fallback local)",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (hasCognito) return null; // desabilita o fallback quando o Cognito real está configurado
        const ownerEmail = process.env.OWNER_EMAIL;
        const ownerHash = process.env.OWNER_PASSWORD_HASH;
        if (!ownerEmail || !ownerHash) return null;
        if (!credentials?.email || !credentials?.password) return null;
        if (credentials.email !== ownerEmail) return null;
        const valid = await bcrypt.compare(credentials.password, ownerHash);
        if (!valid) return null;
        return { id: "owner", email: ownerEmail, name: "Dono da Maruim" };
      },
    }),
  ],
};
