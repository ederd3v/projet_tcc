//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: Ferramentas pequenas usadas por todo o painel.
//  ⚙️  COMO FUNCIONA: Formatar dinheiro, data e telefone; achar elementos na
//      tela ($ e $$); escapar texto antes de pôr no HTML (esc).
//  🎓 NA BANCA: `esc` evita XSS — nome de cliente com "<script>" vira texto,
//      não código. Tudo tipado: o editor sabe o que cada função recebe e devolve.
//  ──────────────────────────────────────────────────────────────────────

export const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const int = new Intl.NumberFormat("pt-BR");
export const SEM = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** Acha um elemento (ou dá erro claro se o HTML do painel mudou). */
export function $<T extends Element = HTMLElement>(seletor: string, raiz: ParentNode = document): T {
  const el = raiz.querySelector<T>(seletor);
  if (!el) throw new Error(`Painel: elemento "${seletor}" não encontrado`);
  return el;
}

/** Acha um elemento que pode não existir (devolve null em vez de erro). */
export function $talvez<T extends Element = HTMLElement>(seletor: string, raiz: ParentNode = document): T | null {
  return raiz.querySelector<T>(seletor);
}

/** Acha todos os elementos de um seletor, como lista normal. */
export function $$<T extends Element = HTMLElement>(seletor: string, raiz: ParentNode = document): T[] {
  return Array.from(raiz.querySelectorAll<T>(seletor));
}

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Troca caracteres especiais para o texto nunca virar HTML (proteção contra XSS). */
export function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

/** Iniciais do nome: "Maria da Silva" -> "MS". */
export function ini(nome: string): string {
  const p = nome.trim().split(/\s+/);
  return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

/** Nome curto para caber nos cards: "Licor de Figo" -> "Figo". */
export function curto(nome: string): string {
  return nome.replace(/^(Licor de|Kombucha|Ice) /, "");
}

/** Data no formato dd/mm. */
export function dd(d: Date): string {
  return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0");
}

/** Data no formato aaaa-mm-dd (o que o <input type="date"> usa). */
export function iso(d: Date): string {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

/** Telefone legível: "47999990000" -> "(47) 99999-0000". */
export function tel(t: string | null | undefined): string {
  const n = String(t ?? "").replace(/\D/g, "");
  if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return n;
}

/**
 * Telefone como é GUARDADO: só DDD + número, sem o 55 do país.
 * Os links do WhatsApp acrescentam "55" na frente; se o dono digitasse
 * "+55 47 99999-0000", o link virava wa.me/555547… e abria número errado
 * (achado pelos testes em util.test.ts).
 */
export function normalizarTelefone(t: string): string {
  const n = String(t ?? "").replace(/\D/g, "");
  // 12 ou 13 dígitos começando com 55 = número com o código do país.
  return (n.length === 12 || n.length === 13) && n.startsWith("55") ? n.slice(2) : n;
}

/** Variação percentual de a em relação a b (para os "+12%" dos cards). */
export function pct(a: number, b: number): number {
  return b ? Math.round((a / b - 1) * 100) : a ? 100 : 0;
}

/** Diferença em milissegundos entre duas datas (Date - Date em TypeScript). */
export function ms(a: Date, b: Date): number {
  return a.getTime() - b.getTime();
}

export const NOME_CATEGORIA_CURTO: Record<string, string> = { licor: "Licor", kombucha: "Kombucha", ice: "Ice" };
