-- O default era "PENDENTE", valor que o quadro do painel não conhece: um
-- pedido criado sem status explícito não cairia em coluna nenhuma.
ALTER TABLE "Pedido" ALTER COLUMN "status" SET DEFAULT 'novo';
