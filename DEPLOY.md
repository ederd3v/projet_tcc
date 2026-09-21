# Deploy — teste na Vercel, depois AWS

> ⚠️ **A Vercel aqui é só teste temporário.** O professor vetou Supabase e
> Vercel na sessão de 17/06/2026, e é por isso que o RFC descreve AWS. Não
> coloque a URL `.vercel.app` no RFC nem no report da N1, e apague o projeto
> da Vercel assim que o teste terminar. A hospedagem de verdade é a da
> seção 8 do RFC: **AWS Amplify + RDS PostgreSQL**.

---

## O bloqueio: o banco

Em desenvolvimento o projeto usa **SQLite** (`prisma/dev.db`). Isso não
funciona em nenhuma hospedagem serverless — o disco é somente leitura e
descartado a cada requisição, e o arquivo `.db` nem vai para o repositório
(está no `.gitignore`). Sem banco externo, o CRM não grava nada.

Então antes de qualquer deploy é preciso um **PostgreSQL hospedado**.

### Opção para o teste

**Neon** (neon.tech) — PostgreSQL gerenciado, plano gratuito, sem cartão.
Criar conta e um projeto leva uns 2 minutos e devolve uma string de conexão
no formato:

```
postgresql://usuario:senha@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

> Não é Supabase, então não esbarra no veto. E como já é PostgreSQL, o mesmo
> schema vai servir depois no Amazon RDS sem mudar nada.

**Essa string tem senha dentro. Não cole em chat nem commite.** Ela vai em
dois lugares: no `.env` local (que já está no `.gitignore`) e no painel de
variáveis da Vercel.

---

## Passo a passo

### 1. Criar o banco

Criar o projeto no Neon e copiar a connection string.

### 2. Trocar o provider do Prisma

Em `prisma/schema.prisma`:

```diff
 datasource db {
-  provider = "sqlite" // produção: "postgresql" (Amazon RDS, RFC 6.2/8)
+  provider = "postgresql" // RFC 6.2/8
   url      = env("DATABASE_URL")
 }
```

E no `.env`, trocar `DATABASE_URL="file:./dev.db"` pela string do Neon.

> A migração inicial já está pronta em `prisma/migrations/0_init/`, gerada
> para PostgreSQL. Não precisa rodar `migrate dev`.

### 3. Aplicar e popular

```bash
npx prisma migrate deploy && npm run prisma:seed
```

### 4. Variáveis na Vercel

No painel do projeto → Settings → Environment Variables:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | a string do Neon |
| `NEXTAUTH_SECRET` | gerar com `openssl rand -base64 32` |
| `NEXTAUTH_URL` | a URL que a Vercel der (`https://....vercel.app`) |
| `OWNER_EMAIL` | o mesmo do `.env` local |
| `OWNER_PASSWORD_HASH` | o mesmo do `.env` local |
| `WHATSAPP_NUMBER` | `5547992401430` |

As de Cognito, AWS e S3 ficam vazias — sem elas o login cai no fallback
local e o upload de foto fica desabilitado, que é o comportamento esperado
nesta fase.

> `NEXTAUTH_URL` é circular: só se sabe a URL depois do primeiro deploy.
> Faz o deploy, pega a URL, preenche a variável e faz redeploy.

### 5. Subir

```bash
npx vercel
```

O comando pede login na primeira vez (navegador). O `build` do
`package.json` já roda `prisma generate && prisma migrate deploy` antes do
`next build`, então o banco é preparado sozinho.

---

## Depois do teste

1. Apagar o projeto na Vercel
2. Migrar para **AWS Amplify + RDS**, como diz a seção 8 do RFC
3. Trocar o `DATABASE_URL` pela string do RDS — o schema e as migrações são
   os mesmos, porque já estão em PostgreSQL

---

## Voltar para SQLite local

Se quiser desenvolver offline de novo: reverter o `provider` para `"sqlite"`,
apontar `DATABASE_URL` para `file:./dev.db` e usar `npm run db:push`. As
migrações em `prisma/migrations/` são de PostgreSQL e não se aplicam ao
SQLite — por isso o script `db:push` continua existindo.
