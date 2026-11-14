//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: As TELAS do CRM: Pedidos (quadro kanban), Clientes, Produtos,
//      Origem e os formulários (novo pedido, cliente, detalhes).
//  ⚙️  COMO FUNCIONA: Cada tela monta seu HTML a partir de `estado` (dados.ts)
//      e liga os botões. Ao alterar algo, chama a função de dados.ts (que salva
//      no banco) e pede `render()` ao núcleo.
//  🎓 NA BANCA: Cobre RF04 (clientes: cadastrar, editar, REMOVER), RF05
//      (pedido com cliente + itens), RF06 (histórico) e RF07 (catálogo).
//  ──────────────────────────────────────────────────────────────────────
import * as D from "./dados";
import * as G from "./graficos";
import { abrir, fechar, intervalo, ir, linhaPedido, nomeDoCliente, pedidosEntre, render as renderTudo, serieDiaria, setPeriodo, statusPill, toast } from "./nucleo";
import type { Categoria, ItemPedido, StatusPedido } from "./tipos";
import { $, $$, brl, curto, dd, esc, ini, int, NOME_CATEGORIA_CURTO, normalizarTelefone, tel } from "./util";
import { podeFicarSemCliente, validarPedido } from "@/lib/regrasPedido";

let modoPedidos: "kanban" | "lista" = "kanban";
let catProdutos: Categoria | "todos" = "todos";

function busca(): string { return $<HTMLInputElement>("#busca").value.trim().toLowerCase(); }
function casa(o: { num: number; clienteId: string | null }): boolean {
  const q = busca();
  if (!q) return true;
  const c = D.cliente(o.clienteId);
  return String(o.num).includes(q.replace("#", "")) || (!!c && c.nome.toLowerCase().includes(q));
}
function statusNome(id: string): string { return D.STATUS.find((s) => s.id === id)?.nome ?? id; }

/* ================= Pedidos ================= */
function renderPedidos(): void {
  $$("[data-modo]").forEach((b) => b.classList.toggle("on", b.dataset.modo === modoPedidos));
  const lista = D.estado.pedidos.filter(casa).sort((a, b) => (a.data < b.data ? 1 : -1));
  const corpo = $("#pedidos-body");
  if (modoPedidos === "lista") {
    corpo.innerHTML = '<article class="card anim" style="padding:10px 12px"><div style="overflow-x:auto"><table><thead><tr><th>Pedido</th><th>Cliente</th><th class="hide-sm">Itens</th><th class="hide-sm">Origem</th><th>Status</th><th class="right">Total</th></tr></thead><tbody>' +
      (lista.slice(0, 80).map(linhaPedido).join("") || '<tr><td colspan="6" class="empty">Nenhum pedido encontrado</td></tr>') + "</tbody></table></div></article>" +
      (lista.length > 80 ? `<p class="hint" style="margin-top:10px">Mostrando os 80 mais recentes de ${lista.length}</p>` : "");
    return;
  }
  // No quadro, entregues e cancelados mostram só os últimos 3 dias
  const limite = Date.now() - 3 * 864e5;
  corpo.innerHTML = '<div class="kanban">' + D.STATUS.map((s) => {
    const da = lista.filter((o) => o.status === s.id && (s.id === "novo" || s.id === "confirmado" || s.id === "rota" || new Date(o.data).getTime() > limite)).slice(0, 12);
    const soma = da.reduce((t, o) => t + D.totalPedido(o), 0);
    return `<div class="col anim" data-status="${s.id}"><h3><span>${statusPill(s.id)}</span><span class="count">${da.length}</span></h3>` +
      `<p class="hint tabnum" style="margin:-6px 4px 10px">${brl.format(soma)}${s.id === "entregue" || s.id === "cancelado" ? " · 3 dias" : ""}</p>` +
      da.map((o) => {
        const d = new Date(o.data);
        const itens = o.itens.map((it) => { const p = D.produto(it.pid); return p ? it.q + "× " + curto(p.nome) : ""; }).join(", ");
        return `<div class="ocard" draggable="true" data-id="${o.id}" data-action="ver-pedido" tabindex="0"><div class="r1"><span class="num">#${o.num}</span><span class="hint tabnum">` +
          `${dd(d)} ${d.toTimeString().slice(0, 5)}</span></div><div class="nm">${esc(nomeDoCliente(o))}</div><div class="hint">${esc(itens)}</div><div class="r3"><span class="origin">` +
          `${esc(o.origem)}</span><b class="money">${brl.format(D.totalPedido(o))}</b></div></div>`;
      }).join("") + "</div>";
  }).join("") + "</div>";

  // Arrastar o card entre as colunas muda a etapa do pedido.
  $$(".ocard", corpo).forEach((card) => {
    card.addEventListener("dragstart", (e) => { card.classList.add("dragging"); e.dataTransfer?.setData("text/plain", card.dataset.id ?? ""); });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
  });
  $$(".col", corpo).forEach((col) => {
    col.addEventListener("dragover", (e) => { e.preventDefault(); col.classList.add("drop"); });
    col.addEventListener("dragleave", () => col.classList.remove("drop"));
    col.addEventListener("drop", (e) => {
      e.preventDefault(); col.classList.remove("drop");
      mudarStatus(e.dataTransfer?.getData("text/plain") ?? "", (col.dataset.status ?? "novo") as StatusPedido);
    });
  });
}

/**
 * Muda a etapa do pedido. RF05: pedido do site sem cliente não pode ser
 * confirmado — o Jaisson precisa dizer de quem é primeiro.
 */
function mudarStatus(id: string, status: StatusPedido): boolean {
  const o = D.pedido(id);
  if (!o || o.status === status) return false;
  if (!o.clienteId && !podeFicarSemCliente(status)) {
    toast("Pedido #" + o.num + ": associe o cliente antes de confirmar");
    formPedido(o.id);
    return false;
  }
  o.status = status;
  void D.salvar();
  toast("Pedido #" + o.num + " → " + statusNome(status));
  renderTudo();
  return true;
}

export function detalhePedido(id: string): void {
  const o = D.pedido(id);
  if (!o) return;
  const c = D.cliente(o.clienteId);
  const d = new Date(o.data);
  const semCliente = !o.clienteId;
  const corpo = abrir("drawer",
    `<div style="display:flex;justify-content:space-between;align-items:center"><span class="num" style="font-size:15px">Pedido #${o.num}</span><button class="icon-btn" data-action="fechar" aria-label="Fechar">✕</button></div>` +
    `<h2>${esc(nomeDoCliente(o))}</h2><p class='hint tabnum'>${d.toLocaleDateString("pt-BR")} às ${d.toTimeString().slice(0, 5)}</p>` +
    (semCliente ? "<p class='err' style='margin-top:8px'>Pedido do site ainda sem cliente: associe um cliente para poder confirmar.</p>" : "") +
    "<p class='hint' style='margin:16px 0 4px'>Etapa do pedido</p><div class='stepper'>" +
    D.STATUS.map((s) => `<button class="chip${s.id === o.status ? " on" : ""}" data-st="${s.id}">${s.nome}</button>`).join("") + "</div>" +
    "<table style='margin-top:14px'><tbody>" + o.itens.map((it) => {
      const p = D.produto(it.pid) ?? { nome: "Produto removido", img: "" };
      return `<tr><td style='width:44px'><img src='${p.img}' alt='' style='width:38px;height:38px;border-radius:50%;object-fit:cover;background:#000'></td><td>${esc(p.nome)}` +
        `<div class='hint tabnum'>${it.q} × ${brl.format(it.preco)}</div></td><td class='right money'>${brl.format(it.q * it.preco)}</td></tr>`;
    }).join("") + "</tbody></table>" +
    `<div class='total-line'><span>Total</span><b>${brl.format(D.totalPedido(o))}</b></div>` +
    `<dl class='kv'><dt>Origem</dt><dd>${esc(o.origem)}</dd><dt>Pagamento</dt><dd>${esc(o.pagamento)}</dd>` +
    (c ? `<dt>WhatsApp</dt><dd class='tabnum'>${esc(tel(c.tel))}</dd>` : "") +
    (o.obs ? `<dt>Observação</dt><dd>${esc(o.obs)}</dd>` : "") + "</dl>" +
    "<div class='foot' style='justify-content:space-between'><button class='btn danger' id='d-excluir'>Excluir</button><div style='display:flex;gap:8px;flex-wrap:wrap'>" +
    (c ? `<a class='btn' target='_blank' rel='noopener noreferrer' href='https://wa.me/55${esc(c.tel)}?text=${encodeURIComponent("Oi, " + c.nome.split(" ")[0] + "! Seu pedido #" + o.num + " da Bebidas Maruim está: " + statusNome(o.status) + ".")}'>Avisar no WhatsApp</a>` : "") +
    `<button class='btn primary' id='d-editar'>${semCliente ? "Associar cliente" : "Editar pedido"}</button></div></div>`);
  $$("[data-st]", corpo).forEach((b) => b.addEventListener("click", () => {
    if (mudarStatus(o.id, (b.dataset.st ?? "novo") as StatusPedido)) detalhePedido(o.id);
  }));
  $("#d-editar", corpo).addEventListener("click", () => { fechar("drawer"); formPedido(o.id); });
  $("#d-excluir", corpo).addEventListener("click", () => {
    if (!confirm("Excluir o pedido #" + o.num + "? Isso não pode ser desfeito.")) return;
    D.excluirPedido(o.id); fechar("drawer"); toast("Pedido #" + o.num + " excluído"); renderTudo();
  });
}

/** Formulário de pedido: novo (sem id) ou edição. */
export function formPedido(id?: string): void {
  const o = id ? D.pedido(id) : undefined;
  const itens: ItemPedido[] = o ? o.itens.map((it) => ({ ...it })) : [{ pid: "", q: 1, preco: 0 }];
  const ativos = D.estado.produtos.filter((p) => p.ativo || itens.some((it) => it.pid === p.id));
  const clientes = D.estado.clientes.slice().sort((a, b) => a.nome.localeCompare(b.nome));
  const corpo = abrir("modal",
    `<h2>${o ? "Editar pedido #" + o.num : "Novo pedido"}</h2><p class='hint' style='margin-bottom:16px'>Os itens usam o preço atual do catálogo</p>` +
    "<div class='field'><label for='f-cli'>Cliente</label><select class='inp' id='f-cli'><option value=''>Escolha o cliente</option><option value='__novo'>+ Cadastrar cliente novo</option>" +
    clientes.map((c) => `<option value='${c.id}'${o && o.clienteId === c.id ? " selected" : ""}>${esc(c.nome)}</option>`).join("") + "</select></div>" +
    "<div id='f-novo' style='display:none' class='two'><div class='field'><label for='f-nn'>Nome</label><input class='inp' id='f-nn' placeholder='Maria Silva'></div><div class='field'><label for='f-nt'>WhatsApp</label><input class='inp' id='f-nt' inputmode='tel' placeholder='47 99999-0000'></div></div>" +
    "<p class='hint' style='margin:4px 0 8px'>Itens</p><div class='items' id='f-itens'></div><button class='btn sm' id='f-add'>+ Adicionar item</button>" +
    "<div class='two' style='margin-top:14px'><div class='field'><label for='f-org'>Origem</label><select class='inp' id='f-org'>" + D.ORIGENS.map((x) => `<option${o && o.origem === x ? " selected" : ""}>${x}</option>`).join("") + "</select></div>" +
    "<div class='field'><label for='f-pag'>Pagamento</label><select class='inp' id='f-pag'>" + D.PAGAMENTOS.map((x) => `<option${o && o.pagamento === x ? " selected" : ""}>${x}</option>`).join("") + "</select></div></div>" +
    `<div class='field'><label for='f-obs'>Observação</label><input class='inp' id='f-obs' placeholder='Entregar depois das 18h' value='${esc(o ? o.obs : "")}'></div>` +
    "<div class='total-line'><span>Total</span><b id='f-total'>R$ 0,00</b></div><p class='err' id='f-err'></p>" +
    `<div class='foot'><button class='btn' data-action='fechar'>Cancelar</button><button class='btn primary' id='f-salvar'>${o ? "Salvar alterações" : "Registrar pedido"}</button></div>`);

  const desenhar = () => {
    $("#f-itens", corpo).innerHTML = itens.map((it, i) =>
      `<div class='item'><select class='inp' data-i='${i}' data-k='pid' aria-label='Produto'><option value=''>Escolha o sabor</option>` +
      (Object.keys(D.CATEGORIAS) as Categoria[]).map((cat) =>
        `<optgroup label='${D.CATEGORIAS[cat]}'>` + ativos.filter((p) => p.cat === cat).map((p) =>
          `<option value='${p.id}'${p.id === it.pid ? " selected" : ""}>${esc(p.nome)} · ${brl.format(p.preco)}</option>`).join("") + "</optgroup>").join("") +
      `</select><input class='inp' type='number' min='1' step='1' value='${it.q}' data-i='${i}' data-k='q' aria-label='Quantidade'>` +
      `<span class='it-price'>${brl.format(it.q * it.preco)}</span><button class='icon-btn' data-rm='${i}' aria-label='Remover item'>✕</button></div>`).join("");
    $("#f-total", corpo).textContent = brl.format(itens.reduce((s, it) => s + it.q * it.preco, 0));
    $$<HTMLInputElement | HTMLSelectElement>("[data-k]", corpo).forEach((inp) => inp.addEventListener("change", () => {
      const it = itens[Number(inp.dataset.i)];
      if (inp.dataset.k === "pid") { it.pid = inp.value; it.preco = D.produto(inp.value)?.preco ?? 0; }
      else it.q = Math.max(1, Math.round(Number(inp.value) || 1));
      desenhar();
    }));
    $$("[data-rm]", corpo).forEach((b) => b.addEventListener("click", () => {
      itens.splice(Number(b.dataset.rm), 1);
      if (!itens.length) itens.push({ pid: "", q: 1, preco: 0 });
      desenhar();
    }));
  };
  desenhar();
  $("#f-add", corpo).addEventListener("click", () => { itens.push({ pid: "", q: 1, preco: 0 }); desenhar(); });
  const selCliente = $<HTMLSelectElement>("#f-cli", corpo);
  selCliente.addEventListener("change", () => { $("#f-novo", corpo).style.display = selCliente.value === "__novo" ? "grid" : "none"; $("#f-err", corpo).textContent = ""; });
  $("#f-salvar", corpo).addEventListener("click", () => {
    const err = $("#f-err", corpo);
    let cid = selCliente.value;
    const validos = itens.filter((it) => it.pid);
    if (!cid) { err.textContent = "Escolha o cliente do pedido."; return; }
    if (!validos.length) { err.textContent = "Adicione pelo menos um sabor."; return; }
    if (cid === "__novo") {
      const nn = $<HTMLInputElement>("#f-nn", corpo).value.trim(), nt = normalizarTelefone($<HTMLInputElement>("#f-nt", corpo).value);
      if (nn.length < 3) { err.textContent = "Digite o nome do cliente novo."; return; }
      if (nt.length < 10) { err.textContent = "Digite o WhatsApp com DDD."; return; }
      cid = D.salvarCliente({ nome: nn, tel: nt, bairro: "", notas: "" }).id;
    }
    const dados: D.DadosPedido = {
      clienteId: cid, itens: validos, origem: $<HTMLSelectElement>("#f-org", corpo).value,
      pagamento: $<HTMLSelectElement>("#f-pag", corpo).value, obs: $<HTMLInputElement>("#f-obs", corpo).value.trim(),
    };
    // Mesmas regras que o servidor confere (src/lib/regrasPedido.ts).
    const problema = validarPedido({ ...dados, status: o?.status ?? "novo" }, new Set(D.estado.clientes.map((c) => c.id)));
    if (problema) { err.textContent = problema; return; }
    if (o) dados.id = o.id; else dados.status = "novo";
    const salvo = D.salvarPedido(dados);
    fechar("modal"); toast(o ? "Pedido #" + salvo.num + " atualizado" : "Pedido #" + salvo.num + " registrado"); renderTudo();
  });
}

/* ================= Clientes ================= */
type Resumo = { n: number; total: number; ultimo: string | null };
function resumoClientes(): Record<string, Resumo> {
  const r: Record<string, Resumo> = {};
  D.estado.pedidos.forEach((o) => {
    if (o.status === "cancelado" || !o.clienteId) return;
    const x = r[o.clienteId] || (r[o.clienteId] = { n: 0, total: 0, ultimo: null });
    x.n++; x.total += D.totalPedido(o);
    if (!x.ultimo || o.data > x.ultimo) x.ultimo = o.data;
  });
  return r;
}

function renderClientes(): void {
  const r = resumoClientes(), q = busca();
  const lista = D.estado.clientes.filter((c) => !q || c.nome.toLowerCase().includes(q) || c.tel.includes(q))
    .sort((a, b) => (r[b.id]?.total ?? 0) - (r[a.id]?.total ?? 0));
  $("#cli-hint").textContent = lista.length + " clientes · ordenados por quem mais gastou";
  $("#clientes-body").innerHTML = lista.map((c) => {
    const x = r[c.id] ?? { n: 0, total: 0, ultimo: null };
    const dias = x.ultimo ? Math.round((Date.now() - new Date(x.ultimo).getTime()) / 864e5) : null;
    return `<tr data-action="ver-cliente" data-id="${c.id}" tabindex="0"><td><span class="avatar-sm">${ini(c.nome)}</span><b>${esc(c.nome)}</b></td><td class="hide-sm">${esc(c.bairro || "—")}` +
      `</td><td class="right tabnum">${x.n}</td><td class="right money">${brl.format(x.total)}</td><td class="hide-sm tabnum">` +
      (dias === null ? "—" : dias === 0 ? "hoje" : "há " + dias + " dia" + (dias === 1 ? "" : "s")) + '</td><td class="right"><span class="hint">›</span></td></tr>';
  }).join("") || '<tr><td colspan="6" class="empty">Nenhum cliente encontrado</td></tr>';
}

/** RF06 — ficha do cliente com o histórico de pedidos (mais recente primeiro). */
export function detalheCliente(id: string): void {
  const c = D.cliente(id);
  if (!c) return;
  const ps = D.pedidosDoCliente(id).sort((a, b) => (a.data < b.data ? 1 : -1));
  const validos = ps.filter((o) => o.status !== "cancelado");
  const total = validos.reduce((s, o) => s + D.totalPedido(o), 0);
  const fav: Record<string, number> = {};
  validos.forEach((o) => o.itens.forEach((it) => { fav[it.pid] = (fav[it.pid] || 0) + it.q; }));
  const favId = Object.keys(fav).sort((a, b) => fav[b] - fav[a])[0];
  const favP = favId ? D.produto(favId) : undefined;
  const corpo = abrir("drawer",
    `<div style="display:flex;justify-content:space-between;align-items:center"><span class="avatar-sm" style="width:52px;height:52px;font-size:18px">${ini(c.nome)}</span><button class="icon-btn" data-action="fechar" aria-label="Fechar">✕</button></div>` +
    `<h2 style='margin-top:10px'>${esc(c.nome)}</h2><p class='hint tabnum'>${esc(tel(c.tel))}${c.bairro ? " · " + esc(c.bairro) : ""}</p>` +
    `<div class='cats' style='margin:16px 0'><div class='cat'><div class='t'>Pedidos</div><div class='n'>${validos.length}</div></div><div class='cat'><div class='t'>Gastou</div><div class='n'>${brl.format(total)}` +
    `</div></div><div class='cat'><div class='t'>Ticket</div><div class='n'>${brl.format(validos.length ? total / validos.length : 0)}</div></div></div>` +
    (favP ? `<p class='hint'>Sabor favorito: <b style='color:var(--cream)'>${esc(favP.nome)}</b> (${fav[favId]} un)</p>` : "") +
    (c.notas ? `<p class='hint'>Anotação: ${esc(c.notas)}</p>` : "") +
    "<h3 style='font-family:var(--display);margin:18px 0 6px'>Histórico</h3><table><tbody>" +
    (ps.slice(0, 12).map((o) => `<tr data-action="ver-pedido" data-id="${o.id}" tabindex="0"><td><span class="num">#${o.num}</span><div class="when tabnum">${new Date(o.data).toLocaleDateString("pt-BR")}</div></td><td>${statusPill(o.status)}</td><td class='right money'>${brl.format(D.totalPedido(o))}</td></tr>`).join("") ||
      "<tr><td class='hint'>Ainda sem pedidos</td></tr>") + "</tbody></table>" +
    "<div class='foot' style='justify-content:space-between'><button class='btn danger' id='c-excluir'>Excluir cliente</button><div style='display:flex;gap:8px;flex-wrap:wrap'>" +
    `<a class='btn' target='_blank' rel='noopener noreferrer' href='https://wa.me/55${esc(c.tel)}'>WhatsApp</a><button class='btn' id='c-editar'>Editar</button><button class='btn primary' id='c-pedido'>Novo pedido</button></div></div>`);
  $("#c-editar", corpo).addEventListener("click", () => { fechar("drawer"); formCliente(id); });
  $("#c-pedido", corpo).addEventListener("click", () => { fechar("drawer"); formPedido(); $<HTMLSelectElement>("#f-cli").value = id; });
  // RF04 — remover cliente (com aviso de quantos pedidos vão junto).
  $("#c-excluir", corpo).addEventListener("click", () => {
    const n = ps.length;
    const aviso = n
      ? `Excluir ${c.nome}?\n\nOs ${n} pedido${n === 1 ? "" : "s"} dele${n === 1 ? "" : "s"} (${brl.format(ps.reduce((s, o) => s + D.totalPedido(o), 0))}) também serão apagados.\n\nIsso não pode ser desfeito.`
      : `Excluir ${c.nome}? Isso não pode ser desfeito.`;
    if (!confirm(aviso)) return;
    D.excluirCliente(id);
    fechar("drawer"); toast(c.nome + " excluído" + (n ? ` (com ${n} pedido${n === 1 ? "" : "s"})` : "")); renderTudo();
  });
}

/** Formulário de cliente: novo (sem id) ou edição. */
export function formCliente(id?: string): void {
  const c = (id && D.cliente(id)) || { nome: "", tel: "", bairro: "", notas: "" };
  const corpo = abrir("modal", `<h2>${id ? "Editar cliente" : "Novo cliente"}</h2><p class='hint' style='margin-bottom:16px'>Nome e WhatsApp são obrigatórios</p>` +
    `<div class='two'><div class='field'><label for='c-nome'>Nome</label><input class='inp' id='c-nome' value='${esc(c.nome)}' placeholder='Maria Silva'></div>` +
    `<div class='field'><label for='c-tel'>WhatsApp</label><input class='inp' id='c-tel' inputmode='tel' value='${esc(tel(c.tel))}' placeholder='47 99999-0000'></div></div>` +
    `<div class='field'><label for='c-bairro'>Bairro</label><input class='inp' id='c-bairro' value='${esc(c.bairro)}' placeholder='América'></div>` +
    `<div class='field'><label for='c-notas'>Anotações</label><textarea class='inp' id='c-notas' rows='3' placeholder='Prefere entrega à tarde'>${esc(c.notas)}</textarea></div>` +
    "<p class='err' id='c-err'></p><div class='foot'><button class='btn' data-action='fechar'>Cancelar</button><button class='btn primary' id='c-salvar'>Salvar cliente</button></div>");
  $("#c-salvar", corpo).addEventListener("click", () => {
    const nome = $<HTMLInputElement>("#c-nome", corpo).value.trim(), fone = normalizarTelefone($<HTMLInputElement>("#c-tel", corpo).value);
    if (nome.length < 3) { $("#c-err", corpo).textContent = "Digite o nome do cliente."; return; }
    if (fone.length < 10) { $("#c-err", corpo).textContent = "Digite o WhatsApp com DDD."; return; }
    D.salvarCliente({ id, nome, tel: fone, bairro: $<HTMLInputElement>("#c-bairro", corpo).value.trim(), notas: $<HTMLTextAreaElement>("#c-notas", corpo).value.trim() });
    fechar("modal"); toast(id ? "Cliente atualizado" : "Cliente cadastrado"); renderTudo();
  });
}

/* ================= Produtos ================= */
function renderProdutos(): void {
  $$("[data-cat]").forEach((b) => b.classList.toggle("on", b.dataset.cat === catProdutos));
  const vend: Record<string, number> = {}, limite = Date.now() - 30 * 864e5;
  D.estado.pedidos.forEach((o) => { if (o.status !== "cancelado" && new Date(o.data).getTime() > limite) o.itens.forEach((it) => { vend[it.pid] = (vend[it.pid] || 0) + it.q; }); });
  $("#produtos-body").innerHTML = D.estado.produtos.filter((p) => catProdutos === "todos" || p.cat === catProdutos).map((p, i) => {
    const baixo = p.estoque <= 5;
    return `<div class="pcard anim${p.ativo ? "" : " off"}" style="animation-delay:${i * 25}ms"><img src="${p.img}" alt=""><div class="b"><div class="line"><span class="t" style="color:var(--cream)">${esc(p.nome)}` +
      `</span><button class="switch${p.ativo ? " on" : ""}" data-toggle="${p.id}" aria-label="${p.ativo ? "Tirar do catálogo" : "Voltar ao catálogo"}" aria-pressed="${p.ativo}"></button></div>` +
      `<div class="line"><span>${NOME_CATEGORIA_CURTO[p.cat]} · ${vend[p.id] || 0} vendidos em 30 dias</span></div>` +
      `<div class="line"><label for="pr-${p.id}">Preço (R$)</label><input id="pr-${p.id}" type="number" min="0" step="0.5" value="${p.preco}" data-preco="${p.id}"></div>` +
      `<div class="line"><label for="es-${p.id}">Estoque${baixo ? ' <b style="color:var(--rust)">· baixo</b>' : ""}</label><input id="es-${p.id}" type="number" min="0" step="1" value="${p.estoque}" data-estoque="${p.id}"></div></div></div>`;
  }).join("");
  $$("[data-toggle]").forEach((b) => b.addEventListener("click", () => {
    const p = D.produto(b.dataset.toggle ?? "");
    if (!p) return;
    p.ativo = !p.ativo; void D.salvar();
    toast(p.nome + (p.ativo ? " voltou ao catálogo" : " saiu do catálogo")); renderProdutos();
  }));
  $$<HTMLInputElement>("[data-preco],[data-estoque]").forEach((inp) => inp.addEventListener("change", () => {
    const p = D.produto(inp.dataset.preco || inp.dataset.estoque || "");
    if (!p) return;
    const v = Math.max(0, Number(inp.value) || 0);
    if (inp.dataset.preco) { p.preco = Math.round(v * 100) / 100; toast("Preço de " + curto(p.nome) + ": " + brl.format(p.preco)); }
    else { p.estoque = Math.round(v); toast("Estoque de " + curto(p.nome) + ": " + p.estoque); }
    void D.salvar(); renderProdutos();
  }));
}

/* ================= Origem e vendas ================= */
function renderOrigem(): void {
  const iv = intervalo(), atual = pedidosEntre(iv.ini, iv.fim), todos = pedidosEntre(iv.ini, iv.fim, true);
  const fat = atual.reduce((s, o) => s + D.totalPedido(o), 0);
  const eixo = (v: number) => "R$" + int.format(Math.round(v));
  $("#o-total").textContent = brl.format(fat) + " · " + atual.length + " pedidos";
  G.area($("#o-area"), serieDiaria(atual, iv), { efeito: "desenho", duracao: 2000, altura: 260, eixo, aoClicar: iv.umDia ? null : (d) => setPeriodo(null, d.dia ?? "") });
  const cat: Record<string, number> = {}, sab: Record<string, number> = {}, org: Record<string, number> = {}, pag: Record<string, number> = {};
  atual.forEach((o) => {
    org[o.origem] = (org[o.origem] || 0) + 1; pag[o.pagamento] = (pag[o.pagamento] || 0) + 1;
    o.itens.forEach((it) => { const p = D.produto(it.pid); if (!p) return; cat[p.cat] = (cat[p.cat] || 0) + it.q * it.preco; sab[p.id] = (sab[p.id] || 0) + it.q * it.preco; });
  });
  G.barras($("#o-barras"), (Object.keys(D.CATEGORIAS) as Categoria[]).map((k) => ({ rotulo: D.CATEGORIAS[k], valor: cat[k] || 0, dica: brl.format(cat[k] || 0) })),
    { duracao: 1700, eixo, aoClicar: () => ir("produtos") });
  const canc = todos.length - atual.length;
  G.rosca($("#o-rosca"), D.ORIGENS.map((o) => ({ rotulo: o, valor: org[o] || 0, dica: (org[o] || 0) + " pedidos" })),
    { duracao: 1800, tamanho: 210, centro: [atual.length, "pedidos" + (canc ? "<br>+" + canc + " cancel." : "")] });
  const top = Object.keys(sab).sort((a, b) => sab[b] - sab[a]).slice(0, 8);
  G.barras($("#o-sabores"), top.map((id) => ({ rotulo: curto(D.produto(id)?.nome ?? "?"), valor: sab[id], dica: brl.format(sab[id]) })), { duracao: 1700, eixo });
  G.rosca($("#o-pagto"), D.PAGAMENTOS.map((x) => ({ rotulo: x, valor: pag[x] || 0, dica: (pag[x] || 0) + " pedidos" })),
    { duracao: 1800, tamanho: 210, centro: [Math.round(((pag["Pix"] || 0) / (atual.length || 1)) * 100) + "%", "no Pix"] });
}

/** Desenha a tela pedida pelo núcleo. */
export function render(t: string): void {
  if (t === "pedidos") renderPedidos();
  if (t === "clientes") renderClientes();
  if (t === "produtos") renderProdutos();
  if (t === "origem") renderOrigem();
}

/** Botões fixos destas telas (ligados uma vez, pelo núcleo). */
export function ligarEventos(): void {
  $$("[data-modo]").forEach((b) => b.addEventListener("click", () => { modoPedidos = b.dataset.modo === "lista" ? "lista" : "kanban"; renderPedidos(); }));
  $$("[data-cat]").forEach((b) => b.addEventListener("click", () => { catProdutos = (b.dataset.cat ?? "todos") as Categoria | "todos"; renderProdutos(); }));
}
