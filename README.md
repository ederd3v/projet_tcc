# Maruim Webapp — Landing + CRM (Next.js/AWS, conforme RFC)

Implementação do RFC do TCC ([`TCC - CRM bebidas.md`](../zerek/TCC%20-%20CRM%20bebidas/TCC%20-%20CRM%20bebidas.md),
seções 5–10): **um projeto Next.js só**, landing pública + painel CRM, conforme
6.2 ("Aplicação Web: Next.js 14 + TypeScript... mesmo projeto"). Substitui o
protótipo TanStack/Cloudflare que estava publicado na Lovable
(`~/Desktop/maruim-site`) — aquele fica só como referência de conteúdo/design.

## Por que Next.js/AWS e não o TanStack/Cloudflare

O RFC v2 já está **finalizado para entrega** (26/06/2026, ver nota do TCC) com
a stack Next.js 14 + AWS (RDS/S3/Cognito/Amplify), decidida depois do professor
vetar Supabase e Vercel (17/06/2026). Como o documento já foi fechado nesse
formato, o código passa a seguir o RFC — é o caminho descrito como opção A no
roteiro (`Próximos passos — Maruim.md`, seção 1) e evita que o sistema entregue
contradiga o próprio RFC na banca.

## O que está implementado e testado localmente

| RFC | Item | Status |
|---|---|---|
| RF01/RF02 | Landing (6 rotas, catálogo, botão WhatsApp por produto) | ✅ |
| RF03 | Login do dono | ✅ (fallback local; Cognito real precisa do User Pool — ver abaixo) |
| RF04 | CRUD de clientes | ✅ |
| RF05 | Registro de pedido (cliente + itens, ≥1 item) | ✅ |
| RF06 | Histórico de pedidos por cliente | ✅ |
| RF07 | CRUD de produtos + campo `ativo` | ✅ (upload S3 real precisa do bucket — ver abaixo) |
| RF08 | Responsivo | ✅ (Tailwind, testar em 360px antes da entrega) |
| 6.4 | 4 entidades (Cliente/Produto/Pedido/ItemPedido) | ✅ Prisma schema |

Catálogo real semeado (22 produtos, dados conferidos no `HANDOFF.md` do
espelho local): 11 licores, 7 kombuchas, 4 ices.

**Bugs do site publicado (ver `HANDOFF.md`) já corrigidos aqui, de raiz:**
- Fontes quebradas → `next/font/google` (Special Elite, Playfair Display, DM
  Sans autohospedadas no build; sem URL externa que possa expirar).
- WhatsApp abrindo em branco → mensagem sempre construída a partir do produto.
- Telefone do rodapé saindo do site → `target="_blank"`.
- `<button type="submit">` fora de `<form>` → não existe mais essa estrutura.
- Instagram sem destino → link só aparece se `NEXT_PUBLIC_INSTAGRAM_URL`
  estiver definida (ainda não temos o @ real, não inventamos).

## Rodando local

```bash
npm install
cp .env.example .env       # preencher DATABASE_URL com a string do PostgreSQL
npx prisma generate
npx prisma migrate deploy  # aplica as migrações
npm run prisma:seed        # popula os 22 produtos reais
npm run dev
```

> O banco é **PostgreSQL** (hoje Neon; em produção, Amazon RDS). Não há mais
> SQLite: a hospedagem serverless tem disco efêmero e somente leitura, então
> banco em arquivo não sobrevive ao deploy.

| Endereço | O que é |
|---|---|
| http://localhost:3000 | landing, pública |
| http://localhost:3000/painel | o CRM — exige login |
| http://localhost:3000/crm/login | entrar |

### Login no painel (antes do Cognito existir)

`.env` de exemplo já tem `OWNER_EMAIL=jaisson@maruim.com.br`. Gere uma senha:

```bash
node -e "console.log(require('bcryptjs').hashSync('SUA_SENHA', 10))"
```

Cole o resultado em `OWNER_PASSWORD_HASH`, **escapando os `$`** com `\$`
(o Next.js expande `$VAR` dentro do `.env` e um hash bcrypt começa com
`$2a$10$...` — sem o escape ele é interpretado como variável e a senha nunca
bate. Isso me custou uma hora de depuração; está documentado no `.env.example`).

## O que falta — só dá pra fazer com a conta AWS

Não tenho como provisionar isso sem credenciais AWS (é conta de vocês,
outward-facing, custo real mesmo que dentro do Free Tier). Passo a passo:

### 1. RDS (PostgreSQL) — RFC 6.2/8
```bash
aws rds create-db-instance \
  --db-instance-identifier maruim-db \
  --db-instance-class db.t4g.micro \
  --engine postgres \
  --master-username maruim_admin \
  --master-user-password "SENHA_FORTE_AQUI" \
  --allocated-storage 20 \
  --publicly-accessible false
```
Depois: `DATABASE_URL` no `.env`/Amplify vira a connection string do RDS, e
**trocar `provider = "sqlite"` para `provider = "postgresql"`** em
`prisma/schema.prisma` (única mudança de schema necessária, comentada no
próprio arquivo). Rodar `npx prisma migrate dev --name init` uma vez contra o
RDS pra gerar o histórico de migrations (precisa de rede até o RDS — bastion,
VPN, ou temporariamente `publicly-accessible=true` só pra essa etapa).

### 2. S3 (fotos de produto) — RFC 6.2/9
```bash
aws s3 mb s3://maruim-produtos --region us-east-1
```
Preencher `S3_BUCKET_NAME` e `AWS_REGION`/`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`
no `.env`. O upload (`src/app/api/upload/route.ts`) já está pronto — gera URL
presignada e o browser manda o arquivo direto pro S3.

### 3. Cognito (login do dono) — RFC 6.2/9
```bash
aws cognito-idp create-user-pool --pool-name maruim-owner-pool
aws cognito-idp create-user-pool-client --user-pool-id <ID> \
  --client-name maruim-webapp --generate-secret \
  --allowed-o-auth-flows code --allowed-o-auth-scopes openid email \
  --callback-urls https://SEU_DOMINIO/api/auth/callback/cognito
```
Preencher `COGNITO_CLIENT_ID`, `COGNITO_CLIENT_SECRET`, `COGNITO_ISSUER`
(`https://cognito-idp.<region>.amazonaws.com/<user-pool-id>`) e
`NEXT_PUBLIC_HAS_COGNITO=true` — `src/lib/auth.ts` já troca pro Cognito
automaticamente quando essas 3 vars existem, sem mexer em código.

### 4. Amplify Hosting — RFC 6.2/8
Console AWS → Amplify → **Host a web app** → conectar ao repositório GitHub
deste projeto → ele detecta o `amplify.yml` já commitado aqui → preencher as
env vars acima na configuração do app → deploy.

> Se preferir, rode os passos 1–4 você mesmo com `aws configure` feito nesta
> máquina (credenciais nunca precisam aparecer no chat) e eu conduzo o resto
> por aqui com os comandos da AWS CLI.

## Integração landing ↔ painel

**Um projeto só, um banco só** — é o container único que o RFC descreve em 6.2.

```
público                          privado (middleware exige sessão)
/                landing         /painel       o CRM (HTML em public/painel)
/licores …                       /api/crm/*    a API dele
      │                                │
      │ "Pedir" → confirma             │ preço, estoque, catálogo
      │ POST /api/pedido-do-site       │ PUT /api/crm/estado
      ▼                                ▼
      └────────── PostgreSQL ──────────┘
```

Os dois sentidos funcionam e foram verificados:

- **painel → landing**: desligar um produto o remove do site e derruba o
  contador do hero.
- **landing → painel**: confirmar um pedido no site o cria na coluna "Novo",
  com origem "Site".

O painel é HTML/CSS/JS puro em `public/painel`. Ele fala com o banco só pelo
`/api/crm/estado`, que entrega e recebe o estado inteiro no formato que as
telas já usavam — por isso nenhuma delas precisou ser reescrita ao sair do
`localStorage`.

## Pendências que sobraram

- [ ] Provisionar RDS/S3/Cognito/Amplify (seção acima — depende da conta AWS).
- [ ] Confirmar o @ do Instagram com o Jaisson (`NEXT_PUBLIC_INSTAGRAM_URL`).
- [ ] Rótulos de produto com texto de IA deformado — mesma pendência do
      espelho local, não é código deste projeto.
- [ ] Domínio próprio (Amplify permite custom domain depois do deploy).
