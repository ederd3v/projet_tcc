# Maruim — landing page + CRM

TCC: sistema web da **Bebidas Maruim** (licores, kombuchas e ice artesanais),
do dono Jaisson. Um projeto só, com duas partes que usam o mesmo banco:

- **Landing page** (pública): mostra o catálogo e manda o cliente para o
  WhatsApp com a mensagem do pedido pronta.
- **CRM** (com login): o dono acompanha pedidos, clientes, produtos e vendas.

Stack (RFC, seção 6.2): **Next.js + TypeScript + Tailwind**, **PostgreSQL**
com **Prisma**, login com **NextAuth**, hospedagem **AWS Amplify + RDS**.

**No ar:** https://main.d16jiora0fzatk.amplifyapp.com (painel em `/crm/login`).
Cada `git push` na `main` publica sozinho em ~5 minutos.

> 📘 **Para estudar o código:** todo arquivo principal começa com um bloco
> "O QUE É / COMO FUNCIONA / NA BANCA". Comece por `src/app/page.tsx` (home),
> `src/components/BotaoPedir.tsx` (pedido) e `src/middleware.ts` (login).

> O RFC fala em Next.js 14. O projeto roda **Next.js 15.5 + React 19** desde
> 06/11/2026, porque a versão 14 parou de receber correções de segurança. A
> arquitetura é a mesma.

---

## Como o projeto está organizado

```
src/
  app/                    páginas e rotas da API (cada pasta = uma URL)
    page.tsx              /            home da landing
    licores/ kombuchas/   /licores …   uma página por linha de produto
    ice/ sobre/           /sobre traz a história e o contato (/contato redireciona)
    crm/login/            /crm/login   tela de login do dono
    api/
      pedido-do-site/     POST: o site registra um pedido no banco
      crm/estado/         GET/PUT: o CRM lê e salva os dados
      auth/               login (NextAuth)
  components/             pedaços da landing (Header, Hero, ProductCard…)
  lib/                    código compartilhado
    prisma.ts             conexão com o banco
    auth.ts               regra de login
    categorias.ts         as 3 linhas de produto (licor, kombucha, ice)
    status.ts             etapas do pedido (novo → entregue)
    whatsapp.ts           monta o link do WhatsApp
    notas.ts              notas de sabor que aparecem ao passar o mouse na foto
    maisPedido.ts         calcula o selo "★ Mais pedido" a partir dos pedidos do CRM
  middleware.ts           bloqueia /painel e /api/crm sem login
  painel/index.html       o HTML do CRM (servido pela rota app/painel, só com login)

public/
  painel/assets/          CSS e JavaScript puro do CRM
  products/               fotos dos produtos

prisma/
  schema.prisma           as 4 tabelas: Cliente, Produto, Pedido, ItemPedido
  migrations/             histórico de mudanças no banco
  seed.ts                 cadastra os 22 produtos reais
```

## Como funciona

```
 Landing (pública)                    CRM (precisa de login)
 /, /licores, /kombuchas…             /painel
        │                                   │
        │ cliente confirma o pedido         │ dono edita pedidos,
        │ POST /api/pedido-do-site          │ clientes e produtos
        │                                   │ PUT /api/crm/estado
        ▼                                   ▼
        └────────────── PostgreSQL ─────────┘
```

### Os dois bancos (e por que existem)

| Banco | Onde | Para quê | Dados |
|---|---|---|---|
| **Produção** | Amazon RDS (AWS), usado pelo site no ar | o Jaisson e os clientes de verdade | **reais** |
| **Teste** | PostgreSQL portátil no computador (`maruim-postgres`, porta 5433) | testar mudanças antes de publicar | **inventados** (botão "Embaralhar dados") |

Os dois têm **a mesma estrutura**: as tabelas saem de `prisma/migrations/`, e o
deploy roda `prisma migrate deploy` no RDS a cada publicação. Só os dados são
diferentes, de propósito: assim um teste nunca bagunça pedido de cliente real.

1. O visitante escolhe um produto e clica em **Pedir no WhatsApp**.
2. Uma janela confirma a quantidade. Ao confirmar, abre o WhatsApp com a
   mensagem pronta e o pedido é gravado no banco, com o preço tirado do
   banco, nunca do navegador.
3. O pedido aparece no CRM, na coluna **Novo**, com a origem "Site".
4. Se o dono desliga um produto no CRM, ele some da landing.

## Requisitos do RFC

| RFC | O quê | Onde está |
|---|---|---|
| RF01/RF02 | Catálogo e botão de WhatsApp por produto | `src/app`, `src/components/BotaoPedir.tsx` |
| RF03 | Login do dono | `src/lib/auth.ts`, `src/middleware.ts` |
| RF04 | Cadastro de clientes | CRM → Clientes |
| RF05 | Registro de pedidos | CRM → Pedidos (quadro) |
| RF06 | Histórico de pedidos por cliente | CRM → Clientes → abrir cliente |
| RF07 | Cadastro de produtos (ligar/desligar) | CRM → Produtos |
| RF08 | Responsivo | Tailwind na landing, CSS com media queries no CRM |

---

## Rodando no computador

Precisa de Node.js 22 e do banco de teste rodando (pasta `maruim-postgres`:
`npm start`). No VS Code, a área de trabalho "Maruim (TCC)" faz tudo pela
tarefa **▶ Rodar tudo**.

```bash
npm install
cp .env.example .env     # preencher DATABASE_URL e o login (ver abaixo)
npx prisma migrate deploy
npx prisma db seed       # cadastra os 22 produtos
npm run dev
```

| Endereço | O que é |
|---|---|
| http://localhost:3000 | landing |
| http://localhost:3000/painel | CRM (pede login) |

**Senha do dono:** gere o hash com
`node -e "console.log(require('bcryptjs').hashSync('SUA_SENHA', 10))"` e cole
em `OWNER_PASSWORD_HASH` no `.env`, trocando cada `$` por `\$` (o Next.js lê
`$` dentro do `.env` como variável).

## Como foi publicado na AWS (já feito em 10/11/2026)

1. **Banco:** criar um Amazon RDS PostgreSQL (`db.t4g.micro`, com acesso
   público, SSL e backup). A URL vai com `?sslmode=require`. Depois rodar o
   seed uma vez: `DATABASE_URL="..." npx prisma db seed`.
2. **Site:** no console do AWS Amplify, conectar este repositório (branch
   `main`). O `amplify.yml` já faz o build e aplica as migrações.
3. **Variáveis no Amplify:** `DATABASE_URL`, `NEXTAUTH_SECRET`,
   `NEXTAUTH_URL` (a URL que o Amplify gerar), `OWNER_EMAIL`,
   `OWNER_PASSWORD_HASH`, `NEXT_PUBLIC_WHATSAPP_NUMBER`.

O login pelo Amazon Cognito já está previsto em `src/lib/auth.ts`: basta
preencher `COGNITO_CLIENT_ID`, `COGNITO_CLIENT_SECRET` e `COGNITO_ISSUER`.

## Pendências

- [x] Publicar na AWS (RDS + Amplify), em 10/11/2026.
- [x] Fotos padronizadas dos 22 produtos, em 11/11/2026.
- [ ] Confirmar com o Jaisson as notas de sabor (`src/lib/notas.ts`) e a marca das kombuchas.
- [ ] @ do Instagram (o link só aparece quando `NEXT_PUBLIC_INSTAGRAM_URL`
      estiver preenchida).
- [ ] Envio de foto de produto pelo CRM (hoje as fotos ficam em
      `public/products`).
