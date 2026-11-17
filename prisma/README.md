# 📁 prisma — o BANCO DE DADOS (estrutura e catálogo)

O Prisma é o ORM: a ponte entre o TypeScript e o PostgreSQL.

```
prisma/
├── schema.prisma     📐 as 4 tabelas: Cliente, Produto, Pedido, ItemPedido (RFC 6.4)
├── migrations/       🕓 o histórico de mudanças no banco, em SQL
│   ├── 0_init                 cria as 4 tabelas
│   ├── 1_campos_do_crm        bairro, notas, estoque, origem, pagamento…
│   ├── 2_pedido_sem_cliente   pedido do site pode nascer sem cliente
│   └── 3_status_padrao        status começa em "novo"
├── catalogo.ts       🍾 os 22 produtos reais (nome, foto, preço)
├── catalogo.test.ts  ✅ confere que toda foto e toda nota existem
└── seed.ts           🌱 cadastra o catálogo no banco (⚠️ APAGA os dados antes)
```

## Os dois bancos

| | Produção | Teste |
|---|---|---|
| Onde | **Amazon RDS (AWS)**, usado pelo site no ar | PostgreSQL portátil deste PC (pasta `maruim-postgres`, porta 5433) |
| Dados | reais (pedidos do Jaisson) | inventados ("Embaralhar dados") |
| Estrutura | igual: o deploy roda `prisma migrate deploy` | igual: `npx prisma migrate deploy` |
| Ver no VS Code | SQLTools → "☁️ AWS — banco de PRODUÇÃO" | SQLTools → "🧪 Banco de TESTE" |

**Nunca rode o `seed` no banco de produção:** ele apaga todos os pedidos.

**Na banca:** as migrations são versionadas no Git. Qualquer pessoa
recria o banco idêntico do zero, e o deploy aplica sozinho só o que falta.
