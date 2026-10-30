-- Pedido vindo da landing não tem cliente até o dono confirmar no WhatsApp.
ALTER TABLE "Pedido" DROP CONSTRAINT "Pedido_clienteId_fkey";
ALTER TABLE "Pedido" ALTER COLUMN "clienteId" DROP NOT NULL;
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_clienteId_fkey"
  FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
