// Valores válidos de Pedido.status. Modelado como enum no RFC (6.4); aqui é
// string simples porque o SQLite de dev não suporta enum nativo do Prisma —
// em produção (postgresql) esses valores podem voltar a ser um `enum
// StatusPedido` no schema sem mudar nada além do datasource.
export const STATUS_PEDIDO = ["PENDENTE", "CONFIRMADO", "ENTREGUE", "CANCELADO"] as const;
export type StatusPedido = (typeof STATUS_PEDIDO)[number];
