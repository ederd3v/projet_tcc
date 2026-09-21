/* app.js — núcleo: navegação, período, utilidades, modais e a visão geral. */
(function () {
  "use strict";
  var M = window.Maruim, G = window.Graficos;

  var brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  var int = new Intl.NumberFormat("pt-BR");
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ini(n) { var p = n.trim().split(/\s+/); return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase(); }
  function curto(nome) { return nome.replace(/^(Licor de|Kombucha|Ice) /, ""); }
  function dd(d) { return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0"); }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function tel(t) { t = String(t || "").replace(/\D/g, ""); return t.length === 11 ? "(" + t.slice(0, 2) + ") " + t.slice(2, 7) + "-" + t.slice(7) : t.length === 10 ? "(" + t.slice(0, 2) + ") " + t.slice(2, 6) + "-" + t.slice(6) : t; }
  function pct(a, b) { return b ? Math.round((a / b - 1) * 100) : (a ? 100 : 0); }
  var SEM = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("on");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("on"); }, 2200);
  }

  /* Números sobem animados até o valor final */
  function contar(el, alvo, fmt) {
    var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var de = +(el.dataset.v || 0); el.dataset.v = alvo;
    if (reduz || de === alvo) { el.innerHTML = fmt(alvo); return; }
    var t0 = performance.now(), dur = 650;
    (function passo(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.innerHTML = fmt(de + (alvo - de) * e);
      if (k < 1) requestAnimationFrame(passo);
    })(t0);
  }

  /* ---------- Modal e gaveta ---------- */
  var ultimoFoco = null;
  function abrir(id, html) {
    ultimoFoco = document.activeElement;
    var ov = $("#" + id); $("#" + id + "-body").innerHTML = html;
    ov.classList.add("on");
    var f = $("input,select,textarea,button", ov); if (f) setTimeout(function () { f.focus(); }, 30);
    return $("#" + id + "-body");
  }
  function fechar(id) {
    $$(id ? "#" + id : ".overlay").forEach(function (o) { o.classList.remove("on"); });
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }
  $$(".overlay").forEach(function (o) {
    o.addEventListener("mousedown", function (e) { if (e.target === o) fechar(o.id); });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") fechar(); });

  /* ---------- Período ---------- */
  var periodo = { tipo: "30", dia: "" };
  function intervalo() {
    var agora = new Date(), ini, fim = agora, iniAnt, fimAnt, rotulo;
    function zero(d) { d = new Date(d); d.setHours(0, 0, 0, 0); return d; }
    if (periodo.dia) {
      var p = periodo.dia.split("-");
      ini = new Date(+p[0], +p[1] - 1, +p[2]); fim = new Date(+p[0], +p[1] - 1, +p[2], 23, 59, 59);
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
      var n = +periodo.tipo;
      ini = zero(agora); ini.setDate(ini.getDate() - (n - 1));
      fimAnt = new Date(ini.getTime() - 1); iniAnt = new Date(ini); iniAnt.setDate(iniAnt.getDate() - n);
      rotulo = "últimos " + n + " dias";
    }
    return { ini: ini, fim: fim, iniAnt: iniAnt, fimAnt: fimAnt, rotulo: rotulo, umDia: !!periodo.dia || periodo.tipo === "hoje" };
  }
  function pedidosEntre(a, b, incluirCancelados) {
    return M.estado.pedidos.filter(function (o) {
      var d = new Date(o.data); return d >= a && d <= b && (incluirCancelados || o.status !== "cancelado");
    });
  }
  function setPeriodo(tipo, dia) {
    periodo.tipo = tipo || periodo.tipo; periodo.dia = dia || "";
    $$("[data-periodo]").forEach(function (b) { b.classList.toggle("on", !periodo.dia && b.dataset.periodo === periodo.tipo); });
    $("#dia").value = periodo.dia; $("#datepick").classList.toggle("on", !!periodo.dia);
    $("#periodo-hint").textContent = periodo.dia ? "Mostrando só este dia · clique num período para voltar" : "";
    render();
  }
  $$("[data-periodo]").forEach(function (b) { b.addEventListener("click", function () { setPeriodo(b.dataset.periodo, ""); }); });
  $("#dia").addEventListener("change", function (e) { if (e.target.value) setPeriodo(null, e.target.value); else setPeriodo(null, ""); });

  /* ---------- Navegação ---------- */
  var TITULOS = { geral: "Visão geral", pedidos: "Pedidos", clientes: "Clientes", produtos: "Produtos", origem: "Origem e vendas" };
  var tela = "geral";
  function ir(v) {
    if (!TITULOS[v]) v = "geral";
    tela = v;
    $$(".nav[data-view]").forEach(function (b) { b.classList.toggle("on", b.dataset.view === v); b.setAttribute("aria-current", b.dataset.view === v ? "page" : "false"); });
    $$(".view").forEach(function (s) { s.classList.toggle("on", s.id === "v-" + v); });
    $("#periodo-bar").style.display = v === "geral" || v === "origem" ? "" : "none";
    if (location.hash !== "#" + v) history.replaceState(null, "", "#" + v);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  $$(".nav[data-view]").forEach(function (b) { b.addEventListener("click", function () { ir(b.dataset.view); }); });
  document.addEventListener("click", function (e) {
    var g = e.target.closest("[data-goto]"); if (g) { ir(g.dataset.goto); return; }
    var a = e.target.closest("[data-action]"); if (!a) return;
    var acao = a.dataset.action;
    if (acao === "novo-pedido") window.Telas.formPedido();
    if (acao === "novo-cliente") window.Telas.formCliente();
    if (acao === "ver-pedido") window.Telas.detalhePedido(a.dataset.id);
    if (acao === "ver-cliente") window.Telas.detalheCliente(a.dataset.id);
    if (acao === "fechar") fechar();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    var g = e.target.closest && e.target.closest("[data-goto],[data-action]");
    if (g && g.tagName !== "BUTTON") g.click();
  });
  $("#btn-reset").addEventListener("click", function () {
    if (!confirm("Apagar tudo o que foi alterado e voltar aos dados de exemplo?")) return;
    M.resetar(); render(); toast("Dados de exemplo restaurados");
  });

  /* Embaralhar: troca o movimento fictício por outro. Serve para apresentar
     sem mostrar sempre os mesmos números. Não pede confirmação porque não
     apaga nada que o dono tenha digitado — os dados já eram de exemplo. */
  $("#btn-embaralhar").addEventListener("click", function () {
    M.embaralhar(); render();
    toast("Dados de exemplo embaralhados — " + M.estado.pedidos.length + " pedidos novos");
  });

  /* Limpar: o passo para começar a usar de verdade. Apaga pedidos e clientes
     e preserva o catálogo, que é real. Confirmação em duas etapas porque é
     irreversível: os dados vivem só no navegador, não há cópia em servidor. */
  $("#btn-limpar").addEventListener("click", function () {
    var qtd = M.estado.pedidos.length, cli = M.estado.clientes.length;

    // Primeira etapa: mostra o tamanho do estrago antes de perguntar.
    if (!confirm(
      "Apagar " + qtd + " pedidos e " + cli + " clientes?\n\n" +
      "Os " + M.estado.produtos.length + " produtos do catálogo ficam (estoque zera).\n\n" +
      "Isto NÃO tem volta: os dados ficam só neste navegador, não há cópia."
    )) return;

    // Segunda etapa: digitar a palavra. Um "OK" a mais é fácil de clicar sem
    // ler; digitar exige intenção. É a diferença entre confirmar e concordar.
    var palavra = prompt('Para confirmar, digite LIMPAR (em maiúsculas):');
    if (palavra === null) return;
    if (palavra.trim().toUpperCase() !== "LIMPAR") {
      toast("Cancelado — a palavra não confere");
      return;
    }

    M.limpar(); render();
    toast("Base zerada — catálogo mantido, pronto para uso real");
  });
  /* Confirmação em duas etapas, igual à do "Limpar dados": a primeira mostra
     o tamanho do estrago, a segunda exige digitar. Um "OK" a mais é fácil de
     clicar sem ler; digitar exige intenção. */
  function limpezaConfirmada(resumo, detalhe) {
    if (!confirm(resumo + "\n\n" + detalhe + "\n\nIsto NÃO tem volta.")) return false;
    var palavra = prompt('Para confirmar, digite LIMPAR (em maiúsculas):');
    if (palavra === null) return false;
    if (palavra.trim().toUpperCase() !== "LIMPAR") { toast("Cancelado — a palavra não confere"); return false; }
    return true;
  }

  $("#btn-limpar-pedidos").addEventListener("click", function () {
    var n = M.estado.pedidos.length;
    if (!n) return toast("Não há pedidos para apagar");
    if (!limpezaConfirmada("Apagar " + n + " pedidos?",
      "Os " + M.estado.clientes.length + " clientes e o catálogo ficam.")) return;
    M.limparPedidos(); render(); toast("Pedidos apagados — clientes e catálogo mantidos");
  });

  $("#btn-limpar-clientes").addEventListener("click", function () {
    var nc = M.estado.clientes.length;
    if (!nc) return toast("Não há clientes para apagar");
    var comDono = M.estado.pedidos.filter(function (o) { return o.clienteId; }).length;
    if (!limpezaConfirmada("Apagar " + nc + " clientes?",
      "Os " + comDono + " pedidos ligados a eles vão junto — senão sobrariam pedidos sem dono.\n" +
      "Pedidos vindos do site, que ainda não têm cliente, permanecem.")) return;
    M.limparClientes(); render(); toast("Clientes apagados");
  });

  $("#busca").addEventListener("input", function () { if (tela !== "pedidos" && tela !== "clientes" && this.value) ir("pedidos"); else render(); });

  /* ---------- Visão geral ---------- */
  function statusPill(s) { var st = M.STATUS.filter(function (x) { return x.id === s; })[0]; return "<span class='status s-" + s + "'>" + (st ? st.nome : s) + "</span>"; }
  function delta(el, v) { el.textContent = (v > 0 ? "+" : "") + v + "%"; el.className = "delta " + (v >= 0 ? "up" : "down"); }

  function serieDiaria(lista, iv) {
    if (iv.umDia) {
      var ac = 0, porHora = {};
      lista.forEach(function (o) { var h = new Date(o.data).getHours(); porHora[h] = (porHora[h] || 0) + M.totalPedido(o); });
      var pts = [{ rotulo: "9h", valor: 0, dica: brl.format(0), dicaRotulo: "Início do dia" }];
      for (var h = 9; h <= 19; h++) { ac += porHora[h] || 0; pts.push({ rotulo: (h + 1) + "h", valor: ac, dica: brl.format(ac) + " acumulado", dicaRotulo: "Até " + (h + 1) + "h" }); }
      return pts;
    }
    var out = [];
    for (var d = new Date(iv.ini); d <= iv.fim; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0) continue;
      var chave = d.toDateString();
      var doDia = lista.filter(function (o) { return new Date(o.data).toDateString() === chave; });
      var v = doDia.reduce(function (s, o) { return s + M.totalPedido(o); }, 0);
      out.push({ rotulo: dd(d), valor: v, dia: iso(d), dica: brl.format(v) + " · " + doDia.length + " pedido" + (doDia.length === 1 ? "" : "s"), dicaRotulo: SEM[d.getDay()] + ", " + dd(d) });
    }
    return out;
  }

  function renderGeral() {
    var iv = intervalo();
    var atual = pedidosEntre(iv.ini, iv.fim), ant = pedidosEntre(iv.iniAnt, iv.fimAnt);
    var fat = atual.reduce(function (s, o) { return s + M.totalPedido(o); }, 0);
    var fatAnt = ant.reduce(function (s, o) { return s + M.totalPedido(o); }, 0);

    contar($("#k-pedidos"), atual.length, function (v) { return int.format(Math.round(v)); });
    delta($("#k-pedidos-d"), pct(atual.length, ant.length));
    contar($("#k-fat"), fat, function (v) { return "<small>R$</small>" + int.format(Math.round(v)); });
    delta($("#k-fat-d"), pct(fat, fatAnt));
    var tk = atual.length ? fat / atual.length : 0, tkAnt = ant.length ? fatAnt / ant.length : 0;
    contar($("#k-ticket"), tk, function (v) { return "<small>R$</small>" + v.toFixed(2).replace(".", ","); });
    delta($("#k-ticket-d"), pct(tk, tkAnt));
    var quem = {}, antes = {};
    atual.forEach(function (o) { quem[o.clienteId] = 1; });
    M.estado.pedidos.forEach(function (o) { if (new Date(o.data) < iv.ini) antes[o.clienteId] = 1; });
    var ids = Object.keys(quem), novos = ids.filter(function (i) { return !antes[i]; }).length;
    contar($("#k-cli"), ids.length, function (v) { return int.format(Math.round(v)); });
    $("#k-cli-new").textContent = novos ? novos + (novos > 1 ? " compraram pela primeira vez" : " comprou pela primeira vez") : "todos já eram clientes";

    /* Mais vendidos */
    var un = {}, rec = {}, totalUn = 0;
    atual.forEach(function (o) { o.itens.forEach(function (it) { un[it.pid] = (un[it.pid] || 0) + it.q; rec[it.pid] = (rec[it.pid] || 0) + it.q * it.preco; totalUn += it.q; }); });
    var rank = M.estado.produtos.filter(function (p) { return un[p.id]; }).sort(function (a, b) { return un[b.id] - un[a.id] || rec[b.id] - rec[a.id]; });
    $("#units-total").textContent = int.format(totalUn) + " unidades";
    function garrafa(p, pos) {
      if (!p) return "<div></div>";
      return '<div class="bottle' + (pos === 1 ? " first" : "") + '" style="animation-delay:' + (pos * 70) + 'ms"><div class="ph"><img src="' + p.img + '" alt="">' +
        (pos === 1 ? '<span class="crown">mais pedido</span>' : "") + '</div><span class="rank">' + pos + 'º</span><span class="name">' + esc(curto(p.nome)) +
        '</span><span class="meta">' + ({licor:"Licor",kombucha:"Kombucha",ice:"Ice"})[p.cat] + " · " + un[p.id] + " un · " + brl.format(rec[p.id]) + "</span></div>";
    }
    $("#podium").innerHTML = rank.length ? garrafa(rank[1], 2) + garrafa(rank[0], 1) + garrafa(rank[2], 3) : '<p class="empty" style="grid-column:1/-1">Nenhuma venda neste período</p>';
    var top5 = rank.slice(0, 5), maxS = top5.length ? un[top5[0].id] : 1;
    $("#shares").innerHTML = top5.map(function (p) {
      return '<div class="share" title="' + esc(p.nome) + ": " + un[p.id] + ' unidades"><span class="pct">' + Math.round(un[p.id] / totalUn * 100) + '%</span><div class="tube"><i style="height:' +
        Math.max(8, Math.round(un[p.id] / maxS * 100)) + '%"></i></div><span class="who">' + esc(curto(p.nome)) + "</span></div>";
    }).join("");

    /* Evolução */
    var serie = serieDiaria(atual, iv);
    $("#area-sub").textContent = iv.umDia ? "Acumulado ao longo do dia · " + iv.rotulo : "Clique num dia para ver só ele";
    G.area($("#chart-area"), serie, { altura: 230, titulo: "Faturamento", eixo: function (v) { return "R$" + int.format(Math.round(v)); },
      aoClicar: iv.umDia ? null : function (d) { setPeriodo(null, d.dia); } });
    var best = iv.umDia ? null : serie.slice().sort(function (a, b) { return b.valor - a.valor; })[0];
    $("#best-day").textContent = best && best.valor ? "Melhor dia: " + best.rotulo : iv.rotulo;
    var cats = {}; Object.keys(M.CATEGORIAS).forEach(function (k) { cats[k] = [0, 0]; });
    atual.forEach(function (o) { o.itens.forEach(function (it) { var p = M.produto(it.pid); if (p) { cats[p.cat][0] += it.q; cats[p.cat][1] += it.q * it.preco; } }); });
    $("#cats").innerHTML = Object.keys(cats).map(function (k) {
      return '<div class="cat" data-goto="produtos" tabindex="0" style="cursor:pointer"><div class="t">' + M.CATEGORIAS[k] + '</div><div class="n">' + brl.format(cats[k][1]) +
        '</div><div class="s">' + cats[k][0] + " un · " + Math.round(cats[k][1] / (fat || 1) * 100) + "% do total</div></div>";
    }).join("");

    /* Recentes */
    var busca = $("#busca").value.trim().toLowerCase();
    var recentes = M.estado.pedidos.slice().sort(function (a, b) { return a.data < b.data ? 1 : -1; }).slice(0, 7);
    $("#orders").innerHTML = recentes.map(linhaPedido).join("");

    /* Origem */
    var org = {}; atual.forEach(function (o) { org[o.origem] = (org[o.origem] || 0) + 1; });
    var dadosOrg = M.ORIGENS.map(function (o) { return { rotulo: o, valor: org[o] || 0, dica: (org[o] || 0) + " pedidos · " + Math.round((org[o] || 0) / (atual.length || 1) * 100) + "%" }; });
    G.rosca($("#chart-origem"), dadosOrg, { tamanho: 190, centro: [String(org["Site"] || 0), "do site · " + Math.round((org["Site"] || 0) / (atual.length || 1) * 100) + "% do total"], aoClicar: function () { ir("origem"); } });

    /* Chamar de volta */
    var ult = {}, qtd = {};
    M.estado.pedidos.forEach(function (o) { if (o.status === "cancelado") return; if (!ult[o.clienteId] || o.data > ult[o.clienteId]) ult[o.clienteId] = o.data; qtd[o.clienteId] = (qtd[o.clienteId] || 0) + 1; });
    var agora = new Date();
    var sumidos = M.estado.clientes.filter(function (c) { return ult[c.id] && (agora - new Date(ult[c.id])) / 864e5 > 30 && qtd[c.id] >= 2; })
      .sort(function (a, b) { return qtd[b.id] - qtd[a.id]; }).slice(0, 4);
    $("#people").innerHTML = sumidos.length ? sumidos.map(function (c) {
      var dias = Math.round((agora - new Date(ult[c.id])) / 864e5);
      var msg = encodeURIComponent("Oi, " + c.nome.split(" ")[0] + "! Aqui é o Jaisson, da Bebidas Maruim. Faz um tempinho que você não pede, chegou sabor novo. Quer que eu separe algo pra você?");
      return '<div class="person"><span class="av">' + ini(c.nome) + '</span><div data-action="ver-cliente" data-id="' + c.id + '" style="cursor:pointer"><div class="client">' + esc(c.nome) +
        '</div><div class="fav tabnum">' + dias + " dias sem pedir · " + qtd[c.id] + ' pedidos</div></div><a class="wa" target="_blank" rel="noopener noreferrer" href="https://wa.me/55' + c.tel + "?text=" + msg + '">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a9 9 0 0 1-13.5 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z"/></svg>Chamar</a></div>';
    }).join("") : '<p class="hint">Ninguém sumido. Boa!</p>';
  }

  function linhaPedido(o) {
    var c = M.cliente(o.clienteId) || { nome: o.origem === "Site" ? "Ainda não identificado" : "Cliente removido" }, d = new Date(o.data), agora = new Date();
    var min = Math.round((agora - d) / 6e4), quando;
    if (min < 60) quando = "há " + Math.max(min, 1) + " min";
    else if (d.toDateString() === agora.toDateString()) quando = "hoje, " + d.toTimeString().slice(0, 5);
    else quando = dd(d) + ", " + d.toTimeString().slice(0, 5);
    var th = o.itens.slice(0, 3).map(function (it) { var p = M.produto(it.pid); return p ? '<img src="' + p.img + '" alt="" title="' + esc(it.q + "× " + p.nome) + '">' : ""; }).join("");
    if (o.itens.length > 3) th += '<span class="more">+' + (o.itens.length - 3) + "</span>";
    return '<tr data-action="ver-pedido" data-id="' + o.id + '" tabindex="0"><td><span class="num">#' + o.num + "</span></td><td><div class='client'>" + esc(c.nome) +
      "</div><div class='when'>" + quando + "</div></td><td class='hide-sm'><div class='thumbs'>" + th + "</div></td><td class='hide-sm'><span class='origin'>" + esc(o.origem) +
      "</span></td><td>" + statusPill(o.status) + "</td><td class='right money'>" + brl.format(M.totalPedido(o)) + "</td></tr>";
  }

  function render() {
    var iv = intervalo();
    $("#page-h1").innerHTML = TITULOS[tela] + (tela === "geral" || tela === "origem" ? ' <em id="period-label">' + esc(iv.rotulo) + "</em>" : "");
    if (tela === "geral") renderGeral();
    else if (window.Telas) window.Telas.render(tela);
  }

  var h = new Date().getHours();
  $("#greeting").textContent = (h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite") + ", Jaisson · Bebidas Maruim";
  var redim; window.addEventListener("resize", function () { clearTimeout(redim); redim = setTimeout(function () { G.cfg.animar = false; render(); G.cfg.animar = true; }, 150); });

  window.App = { tel: tel, $: $, $$: $$, esc: esc, ini: ini, curto: curto, dd: dd, iso: iso, brl: brl, int: int, SEM: SEM, toast: toast, abrir: abrir, fechar: fechar,
    intervalo: intervalo, pedidosEntre: pedidosEntre, setPeriodo: setPeriodo, serieDiaria: serieDiaria, statusPill: statusPill, linhaPedido: linhaPedido,
    render: render, ir: ir, get tela() { return tela; } };

  window.addEventListener("hashchange", function () { var v = location.hash.slice(1); if (v !== tela) ir(v); });
  /* O estado agora vem do banco, então o primeiro desenho espera a resposta.
     Sem isso as telas renderizariam vazias e só se preencheriam depois. */
  function iniciar() {
    var alvo = location.hash.slice(1) || "geral";
    document.body.setAttribute("data-carregando", "1");
    M.aoFalharSalvar(function (e) { toast("Não salvou no banco: " + e.message); });
    M.carregar()
      .then(function () {
        document.body.removeAttribute("data-carregando");
        ir(alvo);
      })
      .catch(function (e) {
        document.body.removeAttribute("data-carregando");
        ir(alvo); // desenha o que der, para a tela não ficar em branco
        toast("Sem conexão com o banco: " + e.message);
      });
  }
  document.addEventListener("DOMContentLoaded", iniciar);
})();
