//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: As REGRAS DE NEGÓCIO do pedido, num lugar só.
//  ⚙️  COMO FUNCIONA: Funções puras (recebem dados, devolvem resposta, não mexem
//      em tela nem banco). O painel usa para avisar o dono na hora, e a API usa
//      de novo antes de gravar — quem burlar a tela é barrado no servidor.
//  🎓 NA BANCA: RF05 — "pedido só salva com cliente existente + ao menos 1 item".
//      Por serem puras, são as primeiras cobertas pelos testes unitários.
//  ──────────────────────────────────────────────────────────────────────

/** Formato mínimo que as regras precisam (serve para o painel e para a API). */
export type PedidoParaValidar = {
  clienteId: string | null;
  status: string;
  origem?: string;
  itens: { pid: string; q: number; preco: number }[];
};

/**
 * Etapas em que um pedido do SITE pode ficar sem cliente.
 *
 * O cliente pede pelo botão do site sem se cadastrar, então o pedido nasce
 * "novo" e sem dono. Antes de confirmar, o Jaisson precisa dizer quem é
 * (associar o cliente). Cancelar continua livre: é como se descarta um pedido
 * que nunca virou venda.
 */
export const ETAPAS_SEM_CLIENTE = ["novo", "cancelado"] as const;

export function podeFicarSemCliente(status: string): boolean {
  return (ETAPAS_SEM_CLIENTE as readonly string[]).includes(status);
}

export function totalDoPedido(itens: PedidoParaValidar["itens"]): number {
  return itens.reduce((soma, it) => soma + it.q * it.preco, 0);
}

/**
 * Confere um pedido. Devolve `null` se está tudo certo, ou a mensagem de erro
 * (em português, pronta para mostrar ao dono).
 *
 * @param idsClientes ids dos clientes que existem — para não gravar um pedido
 *                    apontando para cliente apagado (o banco recusaria).
 */
export function validarPedido(o: PedidoParaValidar, idsClientes: Set<string>): string | null {
  if (!o.itens.length) return "O pedido precisa de pelo menos um item.";
  if (o.itens.some((it) => !it.pid)) return "Há um item sem produto escolhido.";
  if (o.itens.some((it) => !Number.isInteger(it.q) || it.q < 1)) return "Quantidade inválida em um dos itens.";
  if (o.itens.some((it) => !(it.preco >= 0))) return "Preço inválido em um dos itens.";

  if (o.clienteId) {
    if (!idsClientes.has(o.clienteId)) return "O cliente deste pedido não existe mais.";
    return null;
  }
  // Sem cliente: só pedido do site, e só enquanto não foi confirmado.
  if (o.origem !== "Site") return "Escolha o cliente do pedido.";
  if (!podeFicarSemCliente(o.status)) return "Associe um cliente antes de confirmar este pedido do site.";
  return null;
}
