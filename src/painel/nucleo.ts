//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: O NÚCLEO do painel: menu lateral, filtro de período, janelas
//      (modal e gaveta), avisos (toast) e a tela "Visão geral".
//  ⚙️  COMO FUNCIONA: `iniciarPainel()` liga os botões uma única vez, carrega os
//      dados do banco e desenha a tela pedida na URL (#pedidos, #clientes…).
//      Cada mudança chama `render()`, que redesenha só a tela atual.
//  🎓 NA BANCA: É o "maestro": não guarda dados (isso é dados.ts) nem desenha
//      as outras telas (isso é telas.ts) — só coordena.
//  ──────────────────────────────────────────────────────────────────────
import * as D from "./dados";
import * as G from "./graficos";
import * as Telas from "./telas";
import type { Pedido } from "./tipos";
import { $, $$, $talvez, brl, curto, dd, esc, ini, int, iso, ms, NOME_CATEGORIA_CURTO, pct, SEM } from "./util";

/* ---------- Aviso rápido no rodapé (toast) ---------- */
let timerToast: ReturnType<typeof setTimeout> | undefined;
export function toast(msg: string): void {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(timerToast);
  timerToast = setTimeout(() => t.classList.remove("on"), 2200);
}

/** Números sobem animados até o valor final. */
function contar(el: HTMLElement, alvo: number, fmt: (v: number) => string): void {
  const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const de = Number(el.dataset.v || 0);
  el.dataset.v = String(alvo);
  if (reduz || de === alvo) { el.innerHTML = fmt(alvo); return; }
  const t0 = performance.now(), dur = 650;
  const passo = (t: number) => {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.innerHTML = fmt(de + (alvo - de) * e);
    if (k < 1) requestAnimationFrame(passo);
  };
  passo(t0);
}

/* ---------- Modal (formulários) e gaveta (detalhes) ---------- */
let ultimoFoco: Element | null = null;
export function abrir(id: "modal" | "drawer", html: string): HTMLElement {
  ultimoFoco = document.activeElement;
  const ov = $(`#${id}`);
  const corpo = $(`#${id}-body`);
  corpo.innerHTML = html;
  ov.classList.add("on");
  const primeiro = $talvez<HTMLElement>("input,select,textarea,button", ov);
  if (primeiro) setTimeout(() => primeiro.focus(), 30);
  return corpo;
}
export function fechar(id?: string): void {
  $$(id ? `#${id}` : ".overlay").forEach((o) => o.classList.remove("on"));
  if (ultimoFoco instanceof HTMLElement) ultimoFoco.focus();
}

/* ---------- Período (Hoje, 7 dias, 30 dias, Este mês, 60 dias ou um dia) ---------- */
const periodo = { tipo: "30", dia: "" };
export type Intervalo = { ini: Date; fim: Date; iniAnt: Date; fimAnt: Date; rotulo: string; umDia: boolean };

export function intervalo(): Intervalo {
  const agora = new Date();
  const zero = (d: Date) => { const z = new Date(d); z.setHours(0, 0, 0, 0); return z; };
  let ini: Date, fim = agora, iniAnt: Date, fimAnt: Date, rotulo: string;
  if (periodo.dia) {
    const [a, m, d] = periodo.dia.split("-").map(Number);
    ini = new Date(a, m - 1, d); fim = new Date(a, m - 1, d, 23, 59, 59);
    iniAnt = new Date(ini); iniAnt.setDate(iniAnt.getDate() - 7); fimAnt = new Date(fim); fimAnt.setDate(fimAnt.getDate() - 7);
    rotulo = SEM[ini.getDay()] + ", " + dd(ini);
  } else if (periodo.tipo === "hoje") {
    ini = zero(agora); iniAnt = new Date(ini); iniAnt.setDate(iniAnt.getDate() - 7); fimAnt = new Date(agora); fimAnt.setDate(fimAnt.getDate() - 7);
    rotulo = "hoje";
  } else if (periodo.tipo === "mes") {
    ini = new Date(agora.getFullYear(), agora.getMonth(), 1);
    iniAnt = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
    fimAnt = new Date(agora); fimAnt.setMonth(fimAnt.getMonth() - 1);
    rotulo = agora.toLocaleDateString("pt-BR", { month: "long" });
  } else {
    const n = Number(periodo.tipo);
    ini = zero(agora); ini.setDate(ini.getDate() - (n - 1));
    fimAnt = new Date(ini.getTime() - 1); iniAnt = new Date(ini); iniAnt.setDate(iniAnt.getDate() - n);
    rotulo = "últimos " + n + " dias";
  }
  return { ini, fim, iniAnt, fimAnt, rotulo, umDia: !!periodo.dia || periodo.tipo === "hoje" };
}

/** Pedidos entre duas datas (cancelados ficam de fora, a não ser que peça). */
export function pedidosEntre(a: Date, b: Date, incluirCancelados = false): Pedido[] {
  return D.estado.pedidos.filter((o) => {
    const d = new Date(o.data);
    return d >= a && d <= b && (incluirCancelados || o.status !== "cancelado");
  });
}

export function setPeriodo(tipo: string | null, dia: string): void {
  periodo.tipo = tipo || periodo.tipo;
  periodo.dia = dia || "";
  $$("[data-periodo]").forEach((b) => b.classList.toggle("on", !periodo.dia && b.dataset.periodo === periodo.tipo));
  $<HTMLInputElement>("#dia").value = periodo.dia;
  $("#datepick").classList.toggle("on", !!periodo.dia);
  $("#periodo-hint").textContent = periodo.dia ? "Mostrando só este dia · clique num período para voltar" : "";
  render();
}

/* ---------- Navegação entre as telas ---------- */
const TITULOS: Record<string, string> = { geral: "Visão geral", pedidos: "Pedidos", clientes: "Clientes", produtos: "Produtos", origem: "Origem e vendas" };
let tela = "geral";
export function telaAtual(): string { return tela; }

export function ir(destino: string): void {
  const v = TITULOS[destino] ? destino : "geral";
  tela = v;
  $$(".nav[data-view]").forEach((b) => { b.classList.toggle("on", b.dataset.view === v); b.setAttribute("aria-current", b.dataset.view === v ? "page" : "false"); });
  $$(".view").forEach((s) => s.classList.toggle("on", s.id === "v-" + v));
  $("#periodo-bar").style.display = v === "geral" || v === "origem" ? "" : "none";
  if (location.hash !== "#" + v) history.replaceState(null, "", "#" + v);
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- Visão geral ---------- */
export function statusPill(s: string): string {
  const st = D.STATUS.find((x) => x.id === s);
  return `<span class='status s-${s}'>${st ? st.nome : s}</span>`;
}
function delta(el: HTMLElement, v: number): void {
  el.textContent = (v > 0 ? "+" : "") + v + "%";
  el.className = "delta " + (v >= 0 ? "up" : "down");
}

/** Faturamento por dia (ou acumulado por hora, quando o período é um dia só). */
export function serieDiaria(lista: Pedido[], iv: Intervalo): G.Ponto[] {
  if (iv.umDia) {
    let ac = 0;
    const porHora: Record<number, number> = {};
    lista.forEach((o) => { const h = new Date(o.data).getHours(); porHora[h] = (porHora[h] || 0) + D.totalPedido(o); });
    const pts: G.Ponto[] = [{ rotulo: "9h", valor: 0, dica: brl.format(0), dicaRotulo: "Início do dia" }];
    for (let h = 9; h <= 19; h++) { ac += porHora[h] || 0; pts.push({ rotulo: h + 1 + "h", valor: ac, dica: brl.format(ac) + " acumulado", dicaRotulo: "Até " + (h + 1) + "h" }); }
    return pts;
  }
  const out: G.Ponto[] = [];
  for (const d = new Date(iv.ini); d <= iv.fim; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 0) continue;
    const chave = d.toDateString();
    const doDia = lista.filter((o) => new Date(o.data).toDateString() === chave);
    const v = doDia.reduce((s, o) => s + D.totalPedido(o), 0);
    out.push({ rotulo: dd(d), valor: v, dia: iso(d), dica: brl.format(v) + " · " + doDia.length + " pedido" + (doDia.length === 1 ? "" : "s"), dicaRotulo: SEM[d.getDay()] + ", " + dd(d) });
  }
  return out;
}

function renderGeral(): void {
  const iv = intervalo();
  const atual = pedidosEntre(iv.ini, iv.fim), ant = pedidosEntre(iv.iniAnt, iv.fimAnt);
  const fat = atual.reduce((s, o) => s + D.totalPedido(o), 0);
  const fatAnt = ant.reduce((s, o) => s + D.totalPedido(o), 0);

  contar($("#k-pedidos"), atual.length, (v) => int.format(Math.round(v)));
  delta($("#k-pedidos-d"), pct(atual.length, ant.length));
  contar($("#k-fat"), fat, (v) => "<small>R$</small>" + int.format(Math.round(v)));
  delta($("#k-fat-d"), pct(fat, fatAnt));
  const tk = atual.length ? fat / atual.length : 0, tkAnt = ant.length ? fatAnt / ant.length : 0;
  contar($("#k-ticket"), tk, (v) => "<small>R$</small>" + v.toFixed(2).replace(".", ","));
  delta($("#k-ticket-d"), pct(tk, tkAnt));
  const quem: Record<string, 1> = {}, antes: Record<string, 1> = {};
  atual.forEach((o) => { if (o.clienteId) quem[o.clienteId] = 1; });
  D.estado.pedidos.forEach((o) => { if (o.clienteId && new Date(o.data) < iv.ini) antes[o.clienteId] = 1; });
  const ids = Object.keys(quem), novos = ids.filter((i) => !antes[i]).length;
  contar($("#k-cli"), ids.length, (v) => int.format(Math.round(v)));
  $("#k-cli-new").textContent = novos ? novos + (novos > 1 ? " compraram pela primeira vez" : " comprou pela primeira vez") : "todos já eram clientes";

  /* Mais vendidos */
  const un: Record<string, number> = {}, rec: Record<string, number> = {};
  let totalUn = 0;
  atual.forEach((o) => o.itens.forEach((it) => { un[it.pid] = (un[it.pid] || 0) + it.q; rec[it.pid] = (rec[it.pid] || 0) + it.q * it.preco; totalUn += it.q; }));
  const rank = D.estado.produtos.filter((p) => un[p.id]).sort((a, b) => un[b.id] - un[a.id] || rec[b.id] - rec[a.id]);
  $("#units-total").textContent = int.format(totalUn) + " unidades";
  const garrafa = (p: (typeof rank)[number] | undefined, pos: number) => {
    if (!p) return "<div></div>";
    return `<div class="bottle${pos === 1 ? " first" : ""}" style="animation-delay:${pos * 70}ms"><div class="ph"><img src="${p.img}" alt="">` +
      (pos === 1 ? '<span class="crown">mais pedido</span>' : "") + `</div><span class="rank">${pos}º</span><span class="name">${esc(curto(p.nome))}` +
      `</span><span class="meta">${NOME_CATEGORIA_CURTO[p.cat]} · ${un[p.id]} un · ${brl.format(rec[p.id])}</span></div>`;
  };
  $("#podium").innerHTML = rank.length ? garrafa(rank[1], 2) + garrafa(rank[0], 1) + garrafa(rank[2], 3) : '<p class="empty" style="grid-column:1/-1">Nenhuma venda neste período</p>';
  const top5 = rank.slice(0, 5), maxS = top5.length ? un[top5[0].id] : 1;
  $("#shares").innerHTML = top5.map((p) =>
    `<div class="share" title="${esc(p.nome)}: ${un[p.id]} unidades"><span class="pct">${Math.round((un[p.id] / totalUn) * 100)}%</span><div class="tube"><i style="height:` +
    `${Math.max(8, Math.round((un[p.id] / maxS) * 100))}%"></i></div><span class="who">${esc(curto(p.nome))}</span></div>`).join("");

  /* Evolução do faturamento */
  const serie = serieDiaria(atual, iv);
  $("#area-sub").textContent = iv.umDia ? "Acumulado ao longo do dia · " + iv.rotulo : "Clique num dia para ver só ele";
  G.area($("#chart-area"), serie, {
    altura: 230, titulo: "Faturamento", eixo: (v) => "R$" + int.format(Math.round(v)),
    aoClicar: iv.umDia ? null : (d) => setPeriodo(null, d.dia ?? ""),
  });
  const best = iv.umDia ? null : serie.slice().sort((a, b) => b.valor - a.valor)[0];
  $("#best-day").textContent = best && best.valor ? "Melhor dia: " + best.rotulo : iv.rotulo;
  const cats: Record<string, [number, number]> = {};
  Object.keys(D.CATEGORIAS).forEach((k) => { cats[k] = [0, 0]; });
  atual.forEach((o) => o.itens.forEach((it) => { const p = D.produto(it.pid); if (p) { cats[p.cat][0] += it.q; cats[p.cat][1] += it.q * it.preco; } }));
  $("#cats").innerHTML = (Object.keys(cats) as (keyof typeof D.CATEGORIAS)[]).map((k) =>
    `<div class="cat" data-goto="produtos" tabindex="0" style="cursor:pointer"><div class="t">${D.CATEGORIAS[k]}</div><div class="n">${brl.format(cats[k][1])}` +
    `</div><div class="s">${cats[k][0]} un · ${Math.round((cats[k][1] / (fat || 1)) * 100)}% do total</div></div>`).join("");

  /* Pedidos recentes */
  const recentes = D.estado.pedidos.slice().sort((a, b) => (a.data < b.data ? 1 : -1)).slice(0, 7);
  $("#orders").innerHTML = recentes.map(linhaPedido).join("");

  /* De onde vêm os pedidos */
  const org: Record<string, number> = {};
  atual.forEach((o) => { org[o.origem] = (org[o.origem] || 0) + 1; });
  const dadosOrg = D.ORIGENS.map((o) => ({ rotulo: o, valor: org[o] || 0, dica: (org[o] || 0) + " pedidos · " + Math.round(((org[o] || 0) / (atual.length || 1)) * 100) + "%" }));
  G.rosca($("#chart-origem"), dadosOrg, {
    tamanho: 190, centro: [String(org["Site"] || 0), "do site · " + Math.round(((org["Site"] || 0) / (atual.length || 1)) * 100) + "% do total"], aoClicar: () => ir("origem"),
  });

  /* Chamar de volta: clientes fiéis que sumiram há mais de 30 dias */
  const ult: Record<string, string> = {}, qtd: Record<string, number> = {};
  D.estado.pedidos.forEach((o) => {
    if (o.status === "cancelado" || !o.clienteId) return;
    if (!ult[o.clienteId] || o.data > ult[o.clienteId]) ult[o.clienteId] = o.data;
    qtd[o.clienteId] = (qtd[o.clienteId] || 0) + 1;
  });
  const agora = new Date();
  const sumidos = D.estado.clientes.filter((c) => ult[c.id] && ms(agora, new Date(ult[c.id])) / 864e5 > 30 && qtd[c.id] >= 2)
    .sort((a, b) => qtd[b.id] - qtd[a.id]).slice(0, 4);
  $("#people").innerHTML = sumidos.length ? sumidos.map((c) => {
    const dias = Math.round(ms(agora, new Date(ult[c.id])) / 864e5);
    const msg = encodeURIComponent("Oi, " + c.nome.split(" ")[0] + "! Aqui é o Jaisson, da Bebidas Maruim. Faz um tempinho que você não pede, chegou sabor novo. Quer que eu separe algo pra você?");
    return `<div class="person"><span class="av">${ini(c.nome)}</span><div data-action="ver-cliente" data-id="${c.id}" style="cursor:pointer"><div class="client">${esc(c.nome)}` +
      `</div><div class="fav tabnum">${dias} dias sem pedir · ${qtd[c.id]} pedidos</div></div><a class="wa" target="_blank" rel="noopener noreferrer" href="https://wa.me/55${c.tel}?text=${msg}">` +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a9 9 0 0 1-13.5 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z"/></svg>Chamar</a></div>';
  }).join("") : '<p class="hint">Ninguém sumido. Boa!</p>';
}

/** Nome mostrado para o cliente do pedido (pedido do site ainda sem dono). */
export function nomeDoCliente(o: Pedido): string {
  const c = D.cliente(o.clienteId);
  if (c) return c.nome;
  return o.origem === "Site" ? "Ainda não identificado" : "Cliente removido";
}

/** Uma linha da tabela de pedidos (Visão geral e modo Lista). */
export function linhaPedido(o: Pedido): string {
  const d = new Date(o.data), agora = new Date();
  const min = Math.round(ms(agora, d) / 6e4);
  let quando: string;
  if (min < 60) quando = "há " + Math.max(min, 1) + " min";
  else if (d.toDateString() === agora.toDateString()) quando = "hoje, " + d.toTimeString().slice(0, 5);
  else quando = dd(d) + ", " + d.toTimeString().slice(0, 5);
  let th = o.itens.slice(0, 3).map((it) => { const p = D.produto(it.pid); return p ? `<img src="${p.img}" alt="" title="${esc(it.q + "× " + p.nome)}">` : ""; }).join("");
  if (o.itens.length > 3) th += `<span class="more">+${o.itens.length - 3}</span>`;
  return `<tr data-action="ver-pedido" data-id="${o.id}" tabindex="0"><td><span class="num">#${o.num}</span></td><td><div class='client'>${esc(nomeDoCliente(o))}` +
    `</div><div class='when'>${quando}</div></td><td class='hide-sm'><div class='thumbs'>${th}</div></td><td class='hide-sm'><span class='origin'>${esc(o.origem)}` +
    `</span></td><td>${statusPill(o.status)}</td><td class='right money'>${brl.format(D.totalPedido(o))}</td></tr>`;
}

/** Redesenha a tela atual. */
export function render(): void {
  const iv = intervalo();
  $("#page-h1").innerHTML = TITULOS[tela] + (tela === "geral" || tela === "origem" ? ` <em id="period-label">${esc(iv.rotulo)}</em>` : "");
  if (tela === "geral") renderGeral();
  else Telas.render(tela);
}

/* Confirmação em duas etapas para apagar em massa: a primeira mostra o
   tamanho do estrago, a segunda exige digitar LIMPAR. Um "OK" a mais é fácil
   de clicar sem ler; digitar exige intenção. */
function limpezaConfirmada(resumo: string, detalhe: string): boolean {
  if (!confirm(resumo + "\n\n" + detalhe + "\n\nIsto NÃO tem volta: apaga do banco de dados.")) return false;
  const palavra = prompt("Para confirmar, digite LIMPAR (em maiúsculas):");
  if (palavra === null) return false;
  if (palavra.trim().toUpperCase() !== "LIMPAR") { toast("Cancelado — a palavra não confere"); return false; }
  return true;
}

/* ---------- Liga os botões (uma vez só) ---------- */
function ligarEventos(): void {
  $$(".overlay").forEach((o) => o.addEventListener("mousedown", (e) => { if (e.target === o) fechar(o.id); }));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") fechar(); });

  $$("[data-periodo]").forEach((b) => b.addEventListener("click", () => setPeriodo(b.dataset.periodo ?? null, "")));
  $<HTMLInputElement>("#dia").addEventListener("change", (e) => setPeriodo(null, (e.target as HTMLInputElement).value));

  $$(".nav[data-view]").forEach((b) => b.addEventListener("click", () => ir(b.dataset.view ?? "geral")));

  // Um só "ouvinte" para todos os cliques com data-goto / data-action.
  document.addEventListener("click", (e) => {
    const alvo = e.target as HTMLElement;
    const g = alvo.closest<HTMLElement>("[data-goto]");
    if (g) { ir(g.dataset.goto ?? "geral"); return; }
    const a = alvo.closest<HTMLElement>("[data-action]");
    if (!a) return;
    const acao = a.dataset.action, id = a.dataset.id ?? "";
    if (acao === "novo-pedido") Telas.formPedido();
    if (acao === "novo-cliente") Telas.formCliente();
    if (acao === "ver-pedido") Telas.detalhePedido(id);
    if (acao === "ver-cliente") Telas.detalheCliente(id);
    if (acao === "fechar") fechar();
  });
  // Enter em card/linha clicável funciona como clique (acessibilidade por teclado).
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const g = (e.target as HTMLElement).closest?.<HTMLElement>("[data-goto],[data-action]");
    if (g && g.tagName !== "BUTTON") g.click();
  });

  $("#btn-reset").addEventListener("click", () => {
    if (!confirm("Apagar tudo o que foi alterado e voltar aos dados de exemplo?")) return;
    D.resetar(); render(); toast("Dados de exemplo restaurados");
  });
  // Troca o movimento fictício por outro (só para apresentar).
  $("#btn-embaralhar").addEventListener("click", () => {
    D.embaralhar(); render();
    toast("Dados de exemplo embaralhados — " + D.estado.pedidos.length + " pedidos novos");
  });
  // O passo para começar a usar de verdade: apaga pedidos e clientes, mantém o catálogo.
  $("#btn-limpar").addEventListener("click", () => {
    if (!limpezaConfirmada(
      `Apagar ${D.estado.pedidos.length} pedidos e ${D.estado.clientes.length} clientes?`,
      `Os ${D.estado.produtos.length} produtos do catálogo ficam (estoque zera).`)) return;
    D.limpar(); render(); toast("Base zerada — catálogo mantido, pronto para uso real");
  });
  $("#btn-limpar-pedidos").addEventListener("click", () => {
    const n = D.estado.pedidos.length;
    if (!n) { toast("Não há pedidos para apagar"); return; }
    if (!limpezaConfirmada(`Apagar ${n} pedidos?`, `Os ${D.estado.clientes.length} clientes e o catálogo ficam.`)) return;
    D.limparPedidos(); render(); toast("Pedidos apagados — clientes e catálogo mantidos");
  });
  $("#btn-limpar-clientes").addEventListener("click", () => {
    const nc = D.estado.clientes.length;
    if (!nc) { toast("Não há clientes para apagar"); return; }
    const comDono = D.estado.pedidos.filter((o) => o.clienteId).length;
    if (!limpezaConfirmada(`Apagar ${nc} clientes?`,
      `Os ${comDono} pedidos ligados a eles vão junto — senão sobrariam pedidos sem dono.\nPedidos vindos do site, que ainda não têm cliente, permanecem.`)) return;
    D.limparClientes(); render(); toast("Clientes apagados");
  });

  $<HTMLInputElement>("#busca").addEventListener("input", (e) => {
    const valor = (e.target as HTMLInputElement).value;
    if (tela !== "pedidos" && tela !== "clientes" && valor) ir("pedidos"); else render();
  });

  let redim: ReturnType<typeof setTimeout> | undefined;
  window.addEventListener("resize", () => {
    clearTimeout(redim);
    redim = setTimeout(() => { G.cfg.animar = false; render(); G.cfg.animar = true; }, 150);
  });
  window.addEventListener("hashchange", () => { const v = location.hash.slice(1); if (v !== tela) ir(v); });

  Telas.ligarEventos();
}

let iniciado = false;

/** Ponto de entrada: chamado pela página /painel depois que o HTML aparece. */
export async function iniciarPainel(): Promise<void> {
  if (iniciado) return; // o React (modo de desenvolvimento) chama duas vezes
  iniciado = true;
  const h = new Date().getHours();
  $("#greeting").textContent = (h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite") + ", Jaisson · Bebidas Maruim";
  ligarEventos();
  D.aoFalharSalvar((e) => toast("Não salvou no banco: " + e.message));

  // O estado vem do banco: o primeiro desenho espera a resposta.
  const alvo = location.hash.slice(1) || "geral";
  document.body.setAttribute("data-carregando", "1");
  try {
    await D.carregar();
  } catch (e) {
    toast("Sem conexão com o banco: " + (e as Error).message);
  } finally {
    document.body.removeAttribute("data-carregando");
    ir(alvo); // desenha o que der, para a tela não ficar em branco
  }
}
