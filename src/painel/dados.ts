//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: Os DADOS do painel (CRM): produtos, clientes e pedidos.
//  ⚙️  COMO FUNCIONA: Ao abrir, busca tudo em GET /api/crm/estado; a cada
//      alteração, salva com PUT na mesma API. É o único arquivo do painel que
//      conversa com o servidor — as telas só leem e alteram `estado`.
//  🎓 NA BANCA: Separação de responsabilidades: dados aqui, telas em telas.ts,
//      gráficos em graficos.ts. Também gera os "dados de exemplo" da demonstração.
//  ──────────────────────────────────────────────────────────────────────
import type { Categoria, Cliente, Estado, ItemPedido, Pedido, Produto, StatusPedido } from "./tipos";
import { STATUS_PEDIDO } from "@/lib/status";

const API = "/api/crm/estado"; // mesma origem: o painel é servido pelo próprio site
const PASTA_IMG = "/painel/assets/img/";

/* Catálogo real (usado só se o banco ainda estiver vazio). Último número =
   "peso": a chance de o sabor aparecer nos pedidos de exemplo. */
const CATALOGO: [string, string, Categoria, number, string, number][] = [
  ["jabuticaba", "Licor de Jabuticaba", "licor", 35, "render-jabuticaba", 9], ["butia", "Licor de Butiá", "licor", 35, "render-butia", 7],
  ["cafe", "Licor de Café", "licor", 40, "render-cafe", 8], ["morango", "Licor de Morango", "licor", 40, "render-morango", 6],
  ["figo", "Licor de Figo", "licor", 40, "render-figo", 3], ["ameixa", "Licor de Ameixa", "licor", 50, "render-ameixa", 3],
  ["anis", "Licor de Anis Estrelado", "licor", 30, "render-anis", 2], ["banana", "Licor de Banana", "licor", 30, "render-banana", 4],
  ["canela", "Licor de Canela", "licor", 30, "render-canela", 4], ["maracuja", "Licor de Maracujá", "licor", 30, "render-maracuja", 5],
  ["abacaxi", "Licor de Abacaxi", "licor", 30, "render-abacaxi", 3],
  ["k-abacaxi", "Kombucha Abacaxi e Hortelã", "kombucha", 11, "kombucha-abacaxi", 5], ["k-gengibre", "Kombucha Gengibre, Limão e Mel", "kombucha", 11, "kombucha-gengibre", 6],
  ["k-maracuja", "Kombucha Maracujá e Cardamomo", "kombucha", 11, "kombucha-maracuja", 3], ["k-morango", "Kombucha Morango e Hibisco", "kombucha", 11, "kombucha-morango", 5],
  ["k-pink", "Kombucha Pink Lemonade", "kombucha", 11, "kombucha-pinklemonade", 4], ["k-uva", "Kombucha Uva", "kombucha", 11, "kombucha-uva", 3],
  ["k-uvabranca", "Kombucha Uva Branca", "kombucha", 11, "kombucha-uvabranca", 2],
  ["i-limao", "Ice Limão", "ice", 7.5, "ice-limao", 6], ["i-abacaxi", "Ice Abacaxi", "ice", 7.5, "ice-abacaxi", 4],
  ["i-melancia", "Ice Melancia", "ice", 7.5, "ice-melancia", 5], ["i-maracuja", "Ice Maracujá", "ice", 7.5, "ice-maracuja", 3],
];

const NOMES = ["Mariana Kraus", "Rafael Schmitt", "Juliana Beck", "Carlos Hoffmann", "Patrícia Lenz", "Bruno Voigt", "Fernanda Rocha",
  "Diego Martins", "Aline Weber", "Gustavo Pereira", "Camila Fischer", "Rodrigo Silva", "Letícia Koch", "André Souza", "Bianca Schulz",
  "Thiago Lima", "Renata Zimmer", "Marcelo Costa", "Larissa Braun", "Eduardo Nunes", "Priscila Wolf", "Fábio Ramos", "Tatiane Hass",
  "Leandro Alves", "Vanessa Klein", "Paulo Werner", "Débora Santos", "Rogério Mayer", "Simone Vieira", "Henrique Borba",
  "Cristiane Moser", "Lucas Pacheco", "Daniela Stein", "Márcio Teixeira", "Gabriela Ritter", "Sérgio Duarte"];
const BAIRROS = ["América", "Anita Garibaldi", "Atiradores", "Bom Retiro", "Boa Vista", "Centro", "Costa e Silva", "Glória", "Iririú", "Saguaçu", "Santo Antônio", "Floresta"];

export const CATEGORIAS: Record<Categoria, string> = { licor: "Licores", kombucha: "Kombuchas", ice: "Ice" };
export const ORIGENS = ["Site", "WhatsApp direto", "Instagram", "Indicação"];
const NOMES_STATUS: Record<StatusPedido, string> = {
  novo: "Novo", confirmado: "Confirmado", rota: "Saiu para entrega", entregue: "Entregue", cancelado: "Cancelado",
};
/** Etapas do pedido na ordem do quadro (os ids vêm de src/lib/status.ts). */
export const STATUS = STATUS_PEDIDO.map((id) => ({ id, nome: NOMES_STATUS[id] }));
export const PAGAMENTOS = ["Pix", "Dinheiro", "Cartão"];

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ------------------------------------------------------------------
   Dados de exemplo (botão "Embaralhar dados"): 75 dias de movimento.
   Gerador com semente — a mesma semente sempre gera os mesmos números.
   ------------------------------------------------------------------ */
type ProdutoComPeso = Produto & { _peso: number };
type ClienteGerado = Cliente & { _fiel: boolean; _fav: ProdutoComPeso };

function gerarExemplo(sementeInicial?: number): Estado {
  let seed = sementeInicial || 20140916;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  function pick<T>(lista: T[], peso: (x: T) => number): T {
    const t = lista.reduce((s, x) => s + peso(x), 0);
    let r = rnd() * t;
    for (const x of lista) { r -= peso(x); if (r <= 0) return x; }
    return lista[lista.length - 1];
  }

  /* O catálogo vive no banco: os produtos vêm de lá, com os ids de lá.
     Inventar produtos aqui geraria pedidos apontando para ids que não existem
     (o banco recusaria por chave estrangeira). O CATALOGO local só entra se
     ainda não houver nada carregado. */
  const base: Produto[] = estado.produtos.length
    ? estado.produtos
    : CATALOGO.map(([id, nome, cat, preco, img]) => ({ id, nome, cat, preco, img: PASTA_IMG + img + ".jpg", ativo: true, estoque: 0 }));

  const pesos: Record<string, number> = {};
  CATALOGO.forEach((p) => { pesos[p[1]] = p[5]; });

  const produtos: ProdutoComPeso[] = base.map((p) => ({
    ...p, ativo: p.ativo !== false, estoque: 10 + Math.floor(rnd() * 40), _peso: pesos[p.nome] || 4,
  }));
  const hoje = new Date();
  const clientes: ClienteGerado[] = NOMES.map((nome, i) => {
    const tel = "4799" + String(1000000 + Math.floor(rnd() * 8999999)).slice(0, 7);
    const criado = new Date(hoje); criado.setDate(criado.getDate() - 80 - Math.floor(rnd() * 300));
    return { id: "c" + i, nome, tel, bairro: BAIRROS[Math.floor(rnd() * BAIRROS.length)], notas: "",
      criado: criado.toISOString(), _fiel: i < 14, _fav: pick(produtos, (p) => p._peso) };
  });

  const pedidos: Pedido[] = [];
  const inicio = new Date(hoje); inicio.setDate(inicio.getDate() - 75); inicio.setHours(0, 0, 0, 0);
  for (const d = new Date(inicio); d <= hoje; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 0) continue; // domingo fechado
    const idade = (hoje.getTime() - d.getTime()) / 864e5;
    const qtd = Math.floor(3.4 + (75 - idade) / 40 + rnd() * 4) + (d.getDay() === 6 ? 2 : 0);
    for (let k = 0; k < qtd; k++) {
      const c = pick(clientes, (x) => (x._fiel ? 4 : 1));
      const itens: ItemPedido[] = [];
      const n = 1 + Math.floor(rnd() * 3);
      for (let j = 0; j < n; j++) {
        const p = rnd() < 0.35 ? c._fav : pick(produtos, (x) => x._peso);
        const existente = itens.find((it) => it.pid === p.id);
        const q = p.cat === "licor" ? 1 + Math.floor(rnd() * 2) : 1 + Math.floor(rnd() * 3);
        if (existente) existente.q += q; else itens.push({ pid: p.id, q, preco: p.preco });
      }
      let data = new Date(d); data.setHours(9 + Math.floor(rnd() * 10), Math.floor(rnd() * 60), 0, 0);
      if (data > hoje) data = new Date(hoje.getTime() - (k + 1) * 7 * 6e4);
      const horas = (hoje.getTime() - data.getTime()) / 36e5;
      let status: StatusPedido;
      if (horas > 48) status = rnd() < 0.04 ? "cancelado" : "entregue";
      else if (horas > 20) status = rnd() < 0.5 ? "entregue" : "rota";
      else status = pick<StatusPedido>(["novo", "confirmado", "rota"], () => 1);
      const o = rnd();
      pedidos.push({ id: uid() + k, num: 0, data: data.toISOString(), clienteId: c.id, itens,
        origem: o < 0.5 ? "Site" : o < 0.78 ? "WhatsApp direto" : o < 0.94 ? "Instagram" : "Indicação",
        pagamento: PAGAMENTOS[Math.floor(rnd() * 3)], status, obs: "" });
    }
  }
  pedidos.sort((a, b) => (a.data < b.data ? -1 : 1));
  pedidos.forEach((p, i) => { p.num = 1001 + i; });
  return {
    versao: 2,
    produtos: produtos.map(({ _peso, ...p }) => p),
    clientes: clientes.map(({ _fiel, _fav, ...c }) => c),
    pedidos,
  };
}

/* O caminho da foto é reancorado na carga: caminho absoluto ("/products/...")
   vem do banco e é usado como está; caminho relativo é dado antigo, de quando
   as fotos ficavam numa pasta do painel. */
function normalizarImagens(dados: Estado): Estado {
  dados.produtos.forEach((p) => {
    if (p.img && p.img.charAt(0) !== "/" && p.img.indexOf("http") !== 0) p.img = PASTA_IMG + p.img.split("/").pop();
  });
  return dados;
}

/* ------------------------------------------------------------------
   Persistência: PostgreSQL, através da API do site.
   O estado vem do banco, então o dono vê o mesmo painel no celular e no
   computador, e o site e o CRM leem a mesma verdade.
   ------------------------------------------------------------------ */
export let estado: Estado = { versao: 3, produtos: [], clientes: [], pedidos: [] };
let salvando: Promise<void> | null = null;
let salvarDeNovo = false;
let aoFalhar: ((e: Error) => void) | null = null;

export async function carregar(): Promise<Estado> {
  const r = await fetch(API, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error("HTTP " + r.status);
  estado = normalizarImagens((await r.json()) as Estado);
  return estado;
}

/* Envia o estado inteiro. Se um salvamento já estiver em andamento, marca
   para reenviar ao terminar — cliques em sequência não geram fila nem se
   atropelam fora de ordem. */
export function salvar(): Promise<void> {
  if (salvando) { salvarDeNovo = true; return salvando; }
  salvando = fetch(API, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(estado) })
    .then(async (r) => {
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { erro?: string };
        throw new Error(j.erro || "HTTP " + r.status);
      }
    })
    .catch((e: Error) => {
      if (aoFalhar) aoFalhar(e);
      else console.error("Falha ao salvar no banco:", e.message);
    })
    .then(() => {
      salvando = null;
      if (salvarDeNovo) { salvarDeNovo = false; return salvar(); }
    });
  return salvando;
}

/** Permite ao núcleo mostrar um aviso na tela quando o banco recusar. */
export function aoFalharSalvar(fn: (e: Error) => void): void { aoFalhar = fn; }

export function resetar(): void { estado = gerarExemplo(); void salvar(); }

/** Só para apresentar: gera um movimento fictício novo (semente = relógio). */
export function embaralhar(): void { estado = gerarExemplo(Date.now() % 4294967296); void salvar(); }

/* Começar a usar de verdade: apaga clientes e pedidos e mantém o catálogo,
   que é real. O estoque zera porque vinha dos dados de exemplo. */
export function limpar(): void {
  estado = { versao: 2, produtos: estado.produtos.map((p) => ({ ...p, estoque: 0 })), clientes: [], pedidos: [] };
  void salvar();
}

/** Apaga só os pedidos (clientes e catálogo ficam). */
export function limparPedidos(): void { estado.pedidos = []; void salvar(); }

/* Apaga os clientes e os pedidos deles juntos (senão sobrariam pedidos sem
   dono). Pedidos do site ainda sem cliente sobrevivem — não são de ninguém. */
export function limparClientes(): void {
  estado.clientes = [];
  estado.pedidos = estado.pedidos.filter((o) => !o.clienteId);
  void salvar();
}

export function produto(id: string): Produto | undefined { return estado.produtos.find((p) => p.id === id); }
export function cliente(id: string | null): Cliente | undefined { return id ? estado.clientes.find((c) => c.id === id) : undefined; }
export function pedido(id: string): Pedido | undefined { return estado.pedidos.find((p) => p.id === id); }
export function totalPedido(o: Pedido): number { return o.itens.reduce((s, it) => s + it.q * it.preco, 0); }

export type DadosPedido = Omit<Pedido, "id" | "num" | "data" | "status"> & Partial<Pick<Pedido, "id" | "num" | "data" | "status">>;

export function salvarPedido(dados: DadosPedido): Pedido {
  let salvo: Pedido;
  const existente = dados.id ? pedido(dados.id) : undefined;
  if (existente) {
    salvo = Object.assign(existente, dados);
  } else {
    salvo = {
      ...dados,
      id: uid(),
      num: estado.pedidos.reduce((m, p) => Math.max(m, p.num), 1000) + 1,
      data: dados.data || new Date().toISOString(),
      status: dados.status || "novo",
    };
    estado.pedidos.push(salvo);
    // baixa de estoque
    salvo.itens.forEach((it) => { const p = produto(it.pid); if (p) p.estoque = Math.max(0, p.estoque - it.q); });
  }
  void salvar();
  return salvo;
}

export function excluirPedido(id: string): void {
  estado.pedidos = estado.pedidos.filter((p) => p.id !== id);
  void salvar();
}

export function salvarCliente(dados: Omit<Cliente, "id"> & { id?: string }): Cliente {
  const existente = dados.id ? cliente(dados.id) : undefined;
  if (existente) { Object.assign(existente, dados); void salvar(); return existente; }
  const novo: Cliente = { ...dados, id: "c" + uid(), criado: new Date().toISOString() };
  estado.clientes.push(novo);
  void salvar();
  return novo;
}

/** Pedidos de um cliente (para mostrar quantos vão junto ao excluir). */
export function pedidosDoCliente(id: string): Pedido[] {
  return estado.pedidos.filter((o) => o.clienteId === id);
}

/**
 * RF04 — remove um cliente. Os pedidos dele vão junto, o mesmo critério do
 * "Limpar clientes": o banco não aceita pedido apontando para cliente que não
 * existe, e um pedido "sem dono" confirmado violaria a regra do RF05.
 */
export function excluirCliente(id: string): void {
  estado.clientes = estado.clientes.filter((c) => c.id !== id);
  estado.pedidos = estado.pedidos.filter((o) => o.clienteId !== id);
  void salvar();
}
