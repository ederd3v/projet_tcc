-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "notas" TEXT;

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "origem" TEXT NOT NULL DEFAULT 'WhatsApp direto',
ADD COLUMN     "pagamento" TEXT;

-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "estoque" INTEGER NOT NULL DEFAULT 0;

