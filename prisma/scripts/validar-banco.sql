-- ──────────────────────────────────────────────────────────────────────
-- 📘 O QUE É: AUDITORIA do banco — só CONSULTAS (nenhuma linha é alterada).
-- ⚙️  COMO RODAR (VS Code → SQLTools): abra este arquivo, escolha a conexão
--     "☁️ AWS — banco de PRODUÇÃO" e rode cada bloco (selecione e Ctrl+E Ctrl+E).
-- 🎓 NA BANCA: prova que o banco na AWS tem a estrutura do RFC (6.4) e que os
--     dados estão íntegros (sem pedido órfão, sem item sem produto etc.).
-- ──────────────────────────────────────────────────────────────────────

-- 1) As tabelas existem (RFC 6.4: Cliente, Produto, Pedido, ItemPedido)
SELECT table_name AS tabela
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2) Migrações aplicadas pelo deploy (devem ser as 4 da pasta prisma/migrations)
SELECT migration_name, finished_at
FROM "_prisma_migrations"
ORDER BY finished_at;

-- 3) Quantos registros há em cada tabela
SELECT 'Produto' AS tabela, COUNT(*) FROM "Produto"
UNION ALL SELECT 'Cliente', COUNT(*) FROM "Cliente"
UNION ALL SELECT 'Pedido', COUNT(*) FROM "Pedido"
UNION ALL SELECT 'ItemPedido', COUNT(*) FROM "ItemPedido";

-- 4) Catálogo: 22 produtos (11 licores, 7 kombuchas, 4 ices) e preços por linha
SELECT categoria, COUNT(*) AS produtos, MIN(preco) AS menor, MAX(preco) AS maior,
       SUM(CASE WHEN ativo THEN 1 ELSE 0 END) AS ativos_no_site
FROM "Produto"
GROUP BY categoria
ORDER BY categoria;

-- 5) Pedidos por etapa e origem (site sem cliente só pode estar em novo/cancelado — RF05)
SELECT status, origem, COUNT(*) AS pedidos,
       SUM(CASE WHEN "clienteId" IS NULL THEN 1 ELSE 0 END) AS sem_cliente
FROM "Pedido"
GROUP BY status, origem
ORDER BY status, origem;

-- 6) INTEGRIDADE — cada consulta abaixo deve voltar 0
SELECT 'pedido sem itens' AS problema, COUNT(*) FROM "Pedido" p
  WHERE NOT EXISTS (SELECT 1 FROM "ItemPedido" i WHERE i."pedidoId" = p.id)
UNION ALL
SELECT 'pedido sem cliente fora de novo/cancelado', COUNT(*) FROM "Pedido"
  WHERE "clienteId" IS NULL AND status NOT IN ('novo', 'cancelado')
UNION ALL
SELECT 'total do pedido diferente da soma dos itens', COUNT(*) FROM "Pedido" p
  WHERE ABS(p.total - (SELECT COALESCE(SUM(i.quantidade * i."precoUnit"), 0) FROM "ItemPedido" i WHERE i."pedidoId" = p.id)) > 0.01
UNION ALL
SELECT 'item com quantidade < 1', COUNT(*) FROM "ItemPedido" WHERE quantidade < 1
UNION ALL
SELECT 'status fora da lista', COUNT(*) FROM "Pedido"
  WHERE status NOT IN ('novo', 'confirmado', 'rota', 'entregue', 'cancelado');

-- 7) Histórico de um cliente (RF06): os 5 clientes que mais compraram
SELECT c.nome, COUNT(p.id) AS pedidos, ROUND(SUM(p.total)::numeric, 2) AS total_gasto, MAX(p.data) AS ultimo_pedido
FROM "Cliente" c
JOIN "Pedido" p ON p."clienteId" = c.id AND p.status <> 'cancelado'
GROUP BY c.nome
ORDER BY total_gasto DESC
LIMIT 5;
