# 🎓 Guia da banca — Bebidas Maruim (landing + CRM)

Roteiro para apresentar e auditar o projeto **tim-tim por tim-tim**: o que o
RFC pediu, onde está no código, como provar que funciona e o que mudou (e por quê).

- **Site no ar:** https://main.d16jiora0fzatk.amplifyapp.com
- **Painel (CRM):** https://main.d16jiora0fzatk.amplifyapp.com/crm/login
- **Código:** GitHub `ederd3v/projet_tcc` (branch `main` = o que está no ar)

---

## 1. Roteiro de apresentação (≈15 min)

1. **O problema** (RFC 2–3): vendas só pelo WhatsApp, sem site e sem histórico de clientes.
2. **A solução em 1 frase:** vitrine pública + CRM do dono, no mesmo sistema e no mesmo banco.
3. **Demonstração ao vivo:**
   1. Abrir o site no celular → escolher um licor → **Pedir no WhatsApp** → confirmar.
   2. Abrir o painel → o pedido aparece na coluna **Novo** como "Ainda não identificado".
   3. Tentar arrastar para **Confirmado** → o sistema pede para **associar o cliente** (RF05).
   4. Associar o cliente → confirmar → abrir a ficha do cliente → **histórico** (RF06).
   5. Desligar um produto em **Produtos** → recarregar o site → ele sumiu (RF01/RF07).
4. **Arquitetura** (seção 3 deste guia) e **onde cada requisito está** (seção 4).
5. **Qualidade:** 161 testes automáticos rodando no deploy (registro em `RELATORIO-DE-TESTES.md`), TypeScript estrito, Lighthouse.
6. **Divergências do RFC** e a justificativa de cada uma (seção 6) — mostrar, não esconder.

---

## 2. Visão geral do código (onde está cada coisa)

```
src/app/(site)/      páginas públicas (home, licores, kombuchas, ice, sobre, login)
src/app/painel/      a página do CRM
src/app/api/         as APIs (pedido do site, estado do CRM, login)
src/painel/          TODA a lógica do CRM, em TypeScript
src/components/      os blocos do site (Hero, ProductCard, BotaoPedir…)
src/lib/             regras e utilitários usados por todos (regrasPedido, auth, whatsapp…)
src/middleware.ts    o "porteiro": bloqueia o CRM sem login
prisma/              banco: schema (4 tabelas), migrations, catálogo, seed e scripts SQL
public/              imagens e fontes (servidas pelo CDN)
```

Cada pasta tem um `README.md` explicando o conteúdo, e cada arquivo começa com
um bloco **📘 O QUE É / ⚙️ COMO FUNCIONA / 🎓 NA BANCA**.

---

## 3. Arquitetura (C4, como foi construído)

**Nível 1 — Contexto**
- **Visitante** → acessa o site (HTTPS) → clica em pedir → abre o **WhatsApp** do Jaisson (wa.me).
- **Dono (Jaisson)** → entra no painel com login → gerencia clientes, pedidos e catálogo.

**Nível 2 — Containers (na AWS)**

| Container | Tecnologia | Função |
|---|---|---|
| Aplicação web | **Next.js 15.5 + TypeScript**, no **AWS Amplify Hosting** (CDN CloudFront + HTTPS) | site (SSR) + painel + APIs, num só projeto |
| Banco de dados | **Amazon RDS PostgreSQL 18** (`maruim-db`, us-east-1) via **Prisma** | clientes, produtos, pedidos, itens |
| WhatsApp | link externo `wa.me` | canal de venda (o site só redireciona) |

**Fluxo principal (pedido pelo site):**
```
ProductCard → BotaoPedir (confirma quantidade)
   ├─ abre wa.me/5547992401430 com a mensagem pronta
   └─ POST /api/pedido-do-site {produtoId, quantidade}
          → preço lido do BANCO → INSERT Pedido(status "novo", origem "Site") + ItemPedido
                                     ↓
Painel: GET /api/crm/estado → o pedido aparece na coluna "Novo"
Dono associa cliente / muda etapa → PUT /api/crm/estado → valida regras → grava
```

**Deploy contínuo:** `git push` na `main` → Amplify roda **`npm ci` → `npm test` →
`prisma migrate deploy` → `next build`** → publica. Teste falhou = não publica.

---

## 4. RFC × código — conferência item por item

Legenda: ✅ atende · ⚠️ atende com diferença (ver seção 6) · ❌ não feito

### 4.1 Requisitos funcionais (RFC 10.2)

| ID | Requisito | Status | Onde está | Como provar |
|---|---|---|---|---|
| RF01 | Catálogo com nome, descrição, foto e preço (só ativos) | ✅ | `src/components/CategoryPage.tsx` (filtra `ativo: true`), `ProductCard.tsx` | desligar um produto no painel e recarregar o site |
| RF02 | Botão por produto abre o WhatsApp com mensagem pronta | ✅ | `src/components/BotaoPedir.tsx`, `src/lib/whatsapp.ts` | `whatsapp.test.ts`; 22/22 botões testados no ar (10/11) |
| RF03 | CRM exige login do dono (Cognito) | ⚠️ | `src/lib/auth.ts` (NextAuth + bcrypt; Cognito já previsto), `src/middleware.ts` | `auth.test.ts`, `middleware.test.ts`; abrir /painel sem login → volta ao login |
| RF04 | Cadastrar, editar e remover clientes | ✅ | `src/painel/telas.ts`: `formCliente`, `detalheCliente` → **Excluir cliente** | `dados.test.ts` ("excluirCliente…") |
| RF05 | Pedido vinculado a cliente, com ≥1 item | ✅ | `src/lib/regrasPedido.ts` (painel **e** API), `telas.ts: formPedido/mudarStatus` | `regrasPedido.test.ts` (20 casos), `crm/estado/route.test.ts` |
| RF06 | Histórico de pedidos de cada cliente | ✅ | `src/painel/telas.ts: detalheCliente` (mais recente primeiro, com total) | abrir um cliente no painel |
| RF07 | Adicionar/editar/remover produtos, com foto no S3 | ⚠️ | `src/painel/telas.ts: renderProdutos` (ligar/desligar, preço, estoque) | painel → Produtos. **Falta:** criar/remover produto e upload no S3 |
| RF08 | Responsivo (celular) | ✅ | Tailwind no site; `src/painel/painel.css` (media queries) | testado em 360–375 px (site e painel) |

### 4.2 Requisitos não funcionais (RFC 10.3)

| ID | Requisito | Status | Evidência |
|---|---|---|---|
| RNF01 | Funciona no celular | ✅ | ver RF08 |
| RNF02 | Landing < 2 s no 4G | ⚠️ | Lighthouse celular **87** (meta > 80 ✅); LCP 2,7–3,3 s no 4G **lento simulado** (FCP 0,9–1,7 s) |
| RNF03 | CRM só com autenticação | ✅ | `middleware.ts` protege `/painel`, `/crm/*` e `/api/crm/*`; teste `middleware.test.ts` |
| RNF04 | Código em TypeScript | ✅ | 100% TS (nenhum `.js`), `strict`, `tsc --noEmit` = **0 erros** |

### 4.3 Casos de uso (RFC 7)

| UC | Caso | Status | Onde |
|---|---|---|---|
| UC01 | Visualizar catálogo | ✅ | `/`, `/licores`, `/kombuchas`, `/ice` |
| UC02 | Contatar via WhatsApp | ✅ | `BotaoPedir.tsx` (+ registra o pedido no CRM — além do RFC) |
| UC03 | Autenticar-se | ⚠️ | `/crm/login` (login próprio; Cognito previsto) |
| UC04 | Gerenciar produtos | ⚠️ | painel → Produtos (sem criar/remover e sem upload) |
| UC05 | Gerenciar clientes | ✅ | painel → Clientes |
| UC06 | Registrar pedido | ✅ | painel → Novo pedido / quadro de Pedidos |
| UC07 | Consultar histórico | ✅ | painel → Clientes → ficha |

### 4.4 Tecnologias (RFC 8)

| Camada | RFC | Construído | Status |
|---|---|---|---|
| Framework | Next.js 14 + TS | **Next.js 15.5** + React 19 + TS | ⚠️ (atualização de segurança) |
| Estilo | Tailwind | Tailwind (site) + CSS próprio (painel) | ✅ |
| Banco | PostgreSQL no RDS | **RDS PostgreSQL 18.3** (db.t4g.micro) | ✅ |
| ORM | Prisma | Prisma 5 + 4 migrations versionadas | ✅ |
| Autenticação | Cognito | NextAuth + bcrypt (Cognito pronto no código) | ⚠️ |
| Fotos | S3 | `public/products`, servido pelo CDN do Amplify | ⚠️ |
| CDN / HTTPS | CloudFront | CloudFront do Amplify Hosting | ✅ |
| Hospedagem | Amplify | Amplify Hosting com deploy contínuo do GitHub | ✅ |

### 4.5 Modelo de dados (RFC 6.4)

| Entidade | RFC | No banco (`prisma/schema.prisma`) |
|---|---|---|
| Cliente | id, nome, telefone, email, criado_em | ✅ + `bairro`, `notas` |
| Produto | id, nome, descricao, preco, foto_url, ativo | ✅ + `categoria`, `volumeMl`, `estoque`, `selo`, `destaque` |
| Pedido | id, cliente_id, data, status, observacao, total | ✅ + `origem`, `pagamento`; `clienteId` opcional (pedido do site) |
| ItemPedido | id, pedido_id, produto_id, quantidade, preco_unit | ✅ (o preço da venda fica gravado: mudar o catálogo não altera o histórico) |

Prova no banco da AWS: rode `prisma/scripts/validar-banco.sql` (VS Code → SQLTools).

**Banco de produção auditado em 16/11/2026** (`validar-banco.sql` rodado no RDS pelo CloudShell):
4 tabelas + as 4 migrações aplicadas · 22 produtos · **0 problemas** nas 5 checagens de integridade.
A primeira rodada achou **1 pedido do site "confirmado" sem cliente** (criado antes da regra do RF05),
que travaria o painel — foi corrigido para "novo" antes de qualquer outra mudança, com snapshot do banco feito antes.

**O banco no console da AWS (conferido em 16/11/2026):** `maruim-db` · **Disponível** ·
PostgreSQL **18.3** · db.t4g.micro (2 vCPU, 1 GB) · 20 GiB gp2 · us-east-1b · Multi-AZ: não ·
banco `maruim`, usuário `maruim` · security group `maruim-rds` (porta 5432) · backup automático
habilitado · upgrade automático de versões menores habilitado · criado em 10/11/2026.

### 4.6 Segurança (RFC 9)

| Item do RFC | Status | Como está |
|---|---|---|
| CRM protegido por Cognito | ⚠️ | login próprio: senha só como **hash bcrypt**, sessão JWT, e-mail normalizado |
| RDS em sub-rede privada | ⚠️ | RDS **público** (o Amplify SSR não roda dentro da VPC), compensado com **SSL obrigatório**, senha aleatória de 40 caracteres e security group só na porta 5432 |
| Credenciais por IAM/variáveis | ✅ | segredos só em variáveis do Amplify; nenhuma credencial no navegador nem no Git |
| HTTPS em tudo | ✅ | Amplify/CloudFront |
| Backups do RDS | ⚠️ | backup automático **habilitado** (retenção de 1 dia, janela 07:38–08:08 UTC); restauração para qualquer ponto das últimas 24 h |
| Criptografia do disco do RDS | ⚠️ | **não habilitada** (só pode ser ligada criando o banco de novo a partir de um snapshot criptografado) |
| Proteção contra exclusão | ⚠️ | **desabilitada** (recomendado ligar em Modificar → Proteção contra exclusão) |
| Não guarda dado de pagamento | ✅ | só o nome da forma (Pix/Dinheiro/Cartão) |
| Extra | ✅ | `esc()` contra XSS no painel; preço do pedido do site sempre do banco; API valida tudo com Zod; regras do RF05 conferidas no servidor |

### 4.7 Métricas de sucesso (RFC 11)

| KPI | Meta | Medido | Status |
|---|---|---|---|
| Landing publicada | domínio próprio | URL pública do Amplify; domínio adiado (custo) | ⚠️ |
| Fluxo WhatsApp | mensagem correta em todos | 22/22 produtos | ✅ |
| CRM operacional | dono usa sem ajuda | login em produção ok; falta o Jaisson usar sozinho | ⏳ |
| Performance mobile | < 2 s / Lighthouse > 80 | Lighthouse **87**, acessibilidade **100**, SEO 100 | ✅ / ⚠️ LCP |
| Código tipado | 100% TS sem erros | 100% TS, 0 erros, 161 testes | ✅ |

---

## 5. Qualidade e testes

- **161 testes automáticos** (Vitest) em 13 arquivos `*.test.ts`, ao lado do código — todos passando.
  Rodar: `npm test` · VS Code → Terminal → Executar Tarefa → **🧪 Rodar testes** · aba **Testes** (ícone de frasco).
- **Registro para a auditoria:** `RELATORIO-DE-TESTES.md` lista cada teste, o requisito do RFC que ele
  cobre e a cobertura por arquivo (gerado por `npm run test:relatorio`, com data e hora).
- **Cobertura:** regras de negócio, login, WhatsApp e APIs entre 92% e 100%; a interface do
  painel (`nucleo.ts`, `telas.ts`) é coberta pelo teste de ponta a ponta no navegador.
- O **deploy roda os testes antes do build**: se um falhar, a versão nova não vai para o ar.
- **Bugs que os testes acharam e foram corrigidos:** API do CRM quebrando com dado
  malformado (500 → 400); telefone com +55 gerando link errado; login recusando
  e-mail com letra maiúscula.
- **Revisão por pares (squad, PR #5):** o colega achou mais 2 bugs: "Limpar/Resetar"
  podiam apagar pedidos do site que chegaram com o painel aberto, e um produto
  inexistente no pedido virava erro 500 (agora 400). Os dois foram corrigidos com
  8 testes novos, que falham no código antigo.
- **Teste de ponta a ponta** (Chrome automatizado): login → 5 telas → regra do
  pedido do site → excluir cliente → visão de celular.

---

## 6. Divergências do RFC — e a justificativa

| O que mudou | Por quê | Como seria o "100% RFC" |
|---|---|---|
| Next.js 15.5 em vez de 14 | a linha 14 tinha falha crítica de segurança (execução remota no otimizador de imagens) e não recebe mais correções | — (atualizar é a decisão certa) |
| Login próprio em vez de Cognito | o login com hash bcrypt + JWT cumpre o RF03/RNF03 sem custo extra; o código já troca para o Cognito ao preencher 3 variáveis | criar o User Pool e preencher `COGNITO_*` no Amplify |
| Fotos no CDN do Amplify em vez do S3 | o catálogo é fixo hoje; o Amplify já entrega pelo CloudFront | bucket S3 + tela de upload no painel (RF07) |
| RDS público (com SSL) | o Amplify Hosting (SSR) não acessa recursos dentro de VPC privada | RDS Proxy/VPC com outro tipo de hospedagem (ex.: ECS/Fargate — "evolução futura" do próprio RFC) |
| Pedido nasce pelo site, sem cliente | **além do RFC**: o clique no site já vira pedido "novo"; o dono só associa o cliente | — (melhoria) |
| Domínio próprio adiado | custo; o roteiro está pronto (Registro.br → Route 53 → Amplify) | registrar `bebidasmaruim.com.br` |

---

## 7. Perguntas prováveis da banca

**"Como garantem que ninguém altera o preço pelo navegador?"**
A API do site recebe só *qual produto* e *quantos*; o preço é lido do banco
(`src/app/api/pedido-do-site/route.ts`) — há teste para isso.

**"Como foi feita a troca de preços para o final ,90?"**
Com o script versionado `prisma/scripts/2026-11-16-precos-final-90.sql`, em transação, depois de um
snapshot do banco; testado antes no banco local. Um teste (`prisma/catalogo.test.ts`) trava a regra.

**"O que acontece se mudar o preço de um produto?"**
Só o catálogo muda. Cada item de pedido guarda o preço da venda (`ItemPedido.precoUnit`),
então o histórico e os relatórios não se alteram.

**"Por que o CRM não está em React como o site?"**
Ele está em TypeScript, em módulos (`src/painel/`), sem framework, o que o deixa
leve (19,7 KB) e rápido no celular; o Next empacota e protege a página.

**"Onde ficam as senhas?"**
A do dono, só como hash bcrypt, em variável do Amplify. A do banco, em variável
do Amplify. Nada no Git, nada no navegador.

**"E se o banco cair?"**
O RDS tem backup automático; a estrutura é recriada do zero pelas migrations
(`prisma migrate deploy`) e o catálogo pelo `prisma/catalogo.ts`.

**"Como sabem que está funcionando?"**
161 testes rodando a cada deploy, Lighthouse medido no ar e o script
`prisma/scripts/validar-banco.sql` conferindo a integridade do banco na AWS.
