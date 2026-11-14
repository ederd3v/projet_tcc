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
    layout.tsx            moldura raiz (html, fontes, tema)
    (site)/               SITE PÚBLICO — o "(site)" não aparece na URL
      layout.tsx          carrega o CSS do site (Tailwind)
      page.tsx            /            home da landing
      licores/ kombuchas/ ice/          uma página por linha de produto
      sobre/              /sobre       história + contato (/contato redireciona)
      crm/login/          /crm/login   tela de login do dono
    painel/               /painel      o CRM (só com login)
      layout.tsx          carrega o CSS do painel
      page.tsx            põe o HTML do painel na tela e chama iniciarPainel()
    api/
      pedido-do-site/     POST: o site registra um pedido no banco
      crm/estado/         GET/PUT: o CRM lê e salva os dados (valida as regras)
      auth/               login (NextAuth)
  painel/                 TODA A LÓGICA DO CRM, em TypeScript
    tipos.ts              formato de Produto, Cliente, Pedido, Estado
    dados.ts              conversa com a API e guarda o estado em memória
    nucleo.ts             menu, período, janelas e a Visão geral
    telas.ts              Pedidos, Clientes, Produtos, Origem e formulários
    graficos.ts           gráficos em SVG (sem biblioteca)
    util.ts               formatar dinheiro/data/telefone, escapar HTML
    estrutura.ts          o esqueleto HTML do painel
    painel.css            o visual do painel
  components/             pedaços do site (Header, Hero, ProductCard…)
  lib/                    código compartilhado (site + painel + API)
    prisma.ts             conexão com o banco
    auth.ts               regra de login
    regrasPedido.ts       regras do pedido (RF05) usadas no painel E na API
    categorias.ts         as 3 linhas de produto (licor, kombucha, ice)
    status.ts             etapas do pedido (novo → entregue)
    whatsapp.ts           monta o link do WhatsApp
    notas.ts              notas de sabor que aparecem ao passar o mouse na foto
    maisPedido.ts         calcula o selo "★ Mais pedido" a partir dos pedidos do CRM
  middleware.ts           bloqueia /painel e /api/crm sem login

public/
  painel/assets/          fontes e fotos usadas pelo painel
  products/               fotos dos produtos
  brand/                  logo e selo da Maruim

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
| RF04 | Clientes: cadastrar, editar e remover | CRM → Clientes (`src/painel/telas.ts`: formCliente, detalheCliente → Excluir) |
| RF05 | Pedido com cliente + itens | CRM → Pedidos; regras em `src/lib/regrasPedido.ts`, conferidas no painel e na API |
| RF06 | Histórico de pedidos por cliente | CRM → Clientes → abrir cliente |
| RF07 | Cadastro de produtos (ligar/desligar) | CRM → Produtos |
| RF08 | Responsivo | Tailwind na landing, CSS com media queries no CRM (`src/painel/painel.css`) |

---

## Testes automáticos

```bash
npm test                 # roda todos os testes (Vitest)
npm run test:cobertura   # mostra quanto do código os testes exercitam (abre coverage/index.html)
```

São 149 testes em 12 arquivos, cada um ao lado do código que testa (`*.test.ts`):

| O que é testado | Arquivo |
|---|---|
| Regras do pedido (RF05): cliente, itens, pedido do site | `src/lib/regrasPedido.test.ts` |
| Login do dono (RF03): senha certa/errada, hash bcrypt, Cognito | `src/lib/auth.test.ts` |
| Porteiro: o que exige login (RNF03) | `src/middleware.test.ts` |
| Link do WhatsApp (RF02): número e mensagem | `src/lib/whatsapp.test.ts` |
| API do pedido do site: preço do banco, quantidade, produto desligado | `src/app/api/pedido-do-site/route.test.ts` |
| API do CRM: leitura e regras conferidas no servidor | `src/app/api/crm/estado/route.test.ts` |
| Dados do painel: pedidos, clientes (RF04), estoque, salvamento | `src/painel/dados.test.ts` |
| Gráficos do painel | `src/painel/graficos.test.ts` |
| Utilitários: XSS, telefone, datas | `src/painel/util.test.ts` |
| Catálogo: as 22 fotos e notas existem | `prisma/catalogo.test.ts` |
| Etapas do pedido, "mais pedido" | `src/lib/status.test.ts`, `src/lib/maisPedido.test.ts` |

O banco é **simulado** nos testes (não precisa de PostgreSQL rodando) e o
**deploy roda os testes antes do build** (`amplify.yml`): se algum falhar, a
versão nova não vai para o ar.

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
