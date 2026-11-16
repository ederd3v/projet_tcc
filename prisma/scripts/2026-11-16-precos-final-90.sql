-- ──────────────────────────────────────────────────────────────────────
-- 📘 O QUE É: Troca a tabela de preços para o final ,90 (16/11/2026).
--     Licores: 30 → 29,90 · 35 → 34,90 · 40 → 39,90 · 50 → 49,90
--     Kombuchas: 11 → 10,90 · Ice: mantém R$ 7,50
-- ⚙️  COMO RODAR (VS Code → SQLTools): abra este arquivo, escolha a conexão
--     (☁️ AWS produção ou 🧪 teste) e clique em "Run on active connection".
--     Roda dentro de uma transação: ou muda tudo, ou não muda nada.
-- 🎓 NA BANCA: muda só o preço do CATÁLOGO. Os pedidos já feitos guardam o
--     preço da venda em "ItemPedido"."precoUnit" — o histórico NÃO muda.
-- ──────────────────────────────────────────────────────────────────────
BEGIN;

UPDATE "Produto" SET preco = 29.90 WHERE categoria = 'licor' AND preco = 30;
UPDATE "Produto" SET preco = 34.90 WHERE categoria = 'licor' AND preco = 35;
UPDATE "Produto" SET preco = 39.90 WHERE categoria = 'licor' AND preco = 40;
UPDATE "Produto" SET preco = 49.90 WHERE categoria = 'licor' AND preco = 50;
UPDATE "Produto" SET preco = 10.90 WHERE categoria = 'kombucha' AND preco = 11;

COMMIT;

-- Conferência: deve listar licores 29,90/34,90/39,90/49,90, kombuchas 10,90 e ice 7,50.
SELECT categoria, preco, COUNT(*) AS produtos, STRING_AGG(nome, ', ' ORDER BY nome) AS quais
FROM "Produto"
GROUP BY categoria, preco
ORDER BY categoria, preco;
