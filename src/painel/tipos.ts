//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: Os TIPOS do painel: como é um produto, um cliente, um pedido.
//  ⚙️  COMO FUNCIONA: Só descreve formatos (não executa nada). O TypeScript usa
//      isto para avisar, ainda no editor, se algum código usar um campo errado.
//  🎓 NA BANCA: É o "contrato" entre a tela e a API /api/crm/estado — RNF04.
//  ──────────────────────────────────────────────────────────────────────

import type { StatusPedido } from "@/lib/status";

export type Categoria = "licor" | "kombucha" | "ice";

export type Produto = {
  id: string;
  nome: string;
  cat: Categoria;
  preco: number;
  img: string;
  ativo: boolean;
  estoque: number;
};

export type Cliente = {
  id: string;
  nome: string;
  tel: string; // só dígitos, com DDD
  bairro: string;
  notas: string;
  criado?: string; // ISO
};

/** Uma linha do pedido: qual produto, quantos e por quanto foi vendido. */
export type ItemPedido = {
  pid: string;
  q: number;
  preco: number; // preço unitário no momento da venda
};

export type { StatusPedido };

export type Pedido = {
  id: string;
  num: number;
  data: string; // ISO
  clienteId: string | null; // null = pedido que veio do site, ainda sem cliente
  itens: ItemPedido[];
  origem: string;
  pagamento: string;
  status: StatusPedido;
  obs: string;
};

/** Tudo o que o painel tem em memória (é o que a API devolve e recebe). */
export type Estado = {
  versao: number;
  carregadoEm?: string;
  produtos: Produto[];
  clientes: Cliente[];
  pedidos: Pedido[];
};
