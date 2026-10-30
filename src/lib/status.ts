// Etapas do pedido, na ordem em que aparecem no quadro do painel.
//
// Os valores precisam casar com `STATUS` em public/painel/assets/js/data.js:
// é por esse identificador que o painel decide em qual coluna o pedido cai.
// Um valor fora desta lista some do quadro sem erro nenhum — por isso existe
// aqui, para validar antes de gravar.
//
// Modelado como enum no RFC (6.4). Aqui é string porque o painel envia o
// estado inteiro em JSON; a validação faz o papel do enum.
export const STATUS_PEDIDO = ["novo", "confirmado", "rota", "entregue", "cancelado"] as const;

export type StatusPedido = (typeof STATUS_PEDIDO)[number];

/** Etapa de um pedido recém-criado, inclusive os vindos da landing. */
export const STATUS_INICIAL: StatusPedido = "novo";

export function ehStatusValido(v: unknown): v is StatusPedido {
  return typeof v === "string" && (STATUS_PEDIDO as readonly string[]).includes(v);
}
