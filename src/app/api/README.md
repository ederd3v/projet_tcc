# 📁 src/app/api — as APIs (o "back-end")

São endereços que recebem e devolvem **dados em JSON**, não telas. Todas
falam com o banco PostgreSQL (Amazon RDS) usando o Prisma.

| Endereço | Quem chama | O que faz | Protegida? |
|---|---|---|---|
| `POST /api/pedido-do-site` | o botão "Pedir no WhatsApp" do site | registra o pedido como "novo", origem "Site". **O preço vem do banco**, nunca do navegador | ❌ pública (é o visitante que chama), mas valida tudo |
| `GET /api/crm/estado` | o painel, ao abrir | devolve produtos, clientes e pedidos | ✅ exige login |
| `PUT /api/crm/estado` | o painel, a cada alteração | grava o que o dono mudou e **confere as regras do RF05** antes | ✅ exige login |
| `/api/auth/...` | a tela de login | login e logout (NextAuth) | — |

Cada `route.ts` tem ao lado um `route.test.ts` com os testes automáticos
(o banco é simulado: os testes rodam sem PostgreSQL).

**Na banca:** a API pública aceita só *qual produto* e *quantos*. Preço,
status e origem são decididos no servidor, por isso ninguém consegue
registrar um pedido de R$ 0,01 pelo navegador.
