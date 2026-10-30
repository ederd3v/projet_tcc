/* telas.js — Pedidos, Clientes, Produtos, Origem e os formulários. */
(function () {
  "use strict";
  var M = window.Maruim, G = window.Graficos, A = window.App;
  var $ = A.$, $$ = A.$$, esc = A.esc, brl = A.brl;
  var modoPedidos = "kanban", catProdutos = "todos";

  function busca() { return $("#busca").value.trim().toLowerCase(); }
  function casa(o) {
    var q = busca(); if (!q) return true;
    var c = M.cliente(o.clienteId);
    return String(o.num).indexOf(q.replace("#", "")) > -1 || (c && c.nome.toLowerCase().indexOf(q) > -1);
  }
  function statusNome(id) { return M.STATUS.filter(function (s) { return s.id === id; })[0].nome; }

  /* ---------- Pedidos ---------- */
  function renderPedidos() {
    $$("[data-modo]").forEach(function (b) { b.classList.toggle("on", b.dataset.modo === modoPedidos); });
    var lista = M.estado.pedidos.filter(casa).sort(function (a, b) { return a.data < b.data ? 1 : -1; });
    var corpo = $("#pedidos-body");
    if (modoPedidos === "lista") {
      corpo.innerHTML = '<article class="card anim" style="padding:10px 12px"><div style="overflow-x:auto"><table><thead><tr><th>Pedido</th><th>Cliente</th><th class="hide-sm">Itens</th><th class="hide-sm">Origem</th><th>Status</th><th class="right">Total</th></tr></thead><tbody>' +
        (lista.slice(0, 80).map(A.linhaPedido).join("") || '<tr><td colspan="6" class="empty">Nenhum pedido encontrado</td></tr>') + "</tbody></table></div></article>" +
        (lista.length > 80 ? '<p class="hint" style="margin-top:10px">Mostrando os 80 mais recentes de ' + lista.length + "</p>" : "");
      return;
    }
    // No quadro, entregues e cancelados mostram só os últimos 7 dias
    var limite = Date.now() - 3 * 864e5;
    corpo.innerHTML = '<div class="kanban">' + M.STATUS.map(function (s) {
      var da = lista.filter(function (o) { return o.status === s.id && (s.id === "novo" || s.id === "confirmado" || s.id === "rota" || new Date(o.data) > limite); }).slice(0, 12);
      var soma = da.reduce(function (t, o) { return t + M.totalPedido(o); }, 0);
      return '<div class="col anim" data-status="' + s.id + '"><h3><span>' + A.statusPill(s.id) + '</span><span class="count">' + da.length + "</span></h3>" +
        '<p class="hint tabnum" style="margin:-6px 4px 10px">' + brl.format(soma) + (s.id === "entregue" || s.id === "cancelado" ? " · 3 dias" : "") + "</p>" +
        da.map(function (o) {
          var c = M.cliente(o.clienteId) || { nome: o.origem === "Site" ? "Ainda não identificado" : "—" }, d = new Date(o.data);
          var itens = o.itens.map(function (it) { var p = M.produto(it.pid); return p ? it.q + "× " + A.curto(p.nome) : ""; }).join(", ");
          return '<div class="ocard" draggable="true" data-id="' + o.id + '" data-action="ver-pedido" tabindex="0"><div class="r1"><span class="num">#' + o.num + '</span><span class="hint tabnum">' +
            A.dd(d) + " " + d.toTimeString().slice(0, 5) + '</span></div><div class="nm">' + esc(c.nome) + '</div><div class="hint">' + esc(itens) + '</div><div class="r3"><span class="origin">' +
            esc(o.origem) + '</span><b class="money">' + brl.format(M.totalPedido(o)) + "</b></div></div>";
        }).join("") + "</div>";
    }).join("") + "</div>";

    $$(".ocard", corpo).forEach(function (card) {
      card.addEventListener("dragstart", function (e) { card.classList.add("dragging"); e.dataTransfer.setData("text/plain", card.dataset.id); });
      card.addEventListener("dragend", function () { card.classList.remove("dragging"); });
    });
    $$(".col", corpo).forEach(function (col) {
      col.addEventListener("dragover", function (e) { e.preventDefault(); col.classList.add("drop"); });
      col.addEventListener("dragleave", function () { col.classList.remove("drop"); });
      col.addEventListener("drop", function (e) {
        e.preventDefault(); col.classList.remove("drop");
        mudarStatus(e.dataTransfer.getData("text/plain"), col.dataset.status);
      });
    });
  }
  function mudarStatus(id, status) {
    var o = M.estado.pedidos.filter(function (p) { return p.id === id; })[0];
    if (!o || o.status === status) return;
    o.status = status; M.salvar();
    A.toast("Pedido #" + o.num + " → " + statusNome(status));
    A.render();
  }
  $$("[data-modo]").forEach(function (b) { b.addEventListener("click", function () { modoPedidos = b.dataset.modo; renderPedidos(); }); });

  function detalhePedido(id) {
    var o = M.estado.pedidos.filter(function (p) { return p.id === id; })[0]; if (!o) return;
    var c = M.cliente(o.clienteId) || { nome: o.origem === "Site" ? "Ainda não identificado" : "—", tel: "" }, d = new Date(o.data);
    var corpo = A.abrir("drawer",
      '<div style="display:flex;justify-content:space-between;align-items:center"><span class="num" style="font-size:15px">Pedido #' + o.num + '</span><button class="icon-btn" data-action="fechar" aria-label="Fechar">✕</button></div>' +
      "<h2>" + esc(c.nome) + "</h2><p class='hint tabnum'>" + d.toLocaleDateString("pt-BR") + " às " + d.toTimeString().slice(0, 5) + "</p>" +
      "<p class='hint' style='margin:16px 0 4px'>Etapa do pedido</p><div class='stepper'>" + M.STATUS.map(function (s) {
        return '<button class="chip' + (s.id === o.status ? " on" : "") + '" data-st="' + s.id + '">' + s.nome + "</button>";
      }).join("") + "</div>" +
      "<table style='margin-top:14px'><tbody>" + o.itens.map(function (it) {
        var p = M.produto(it.pid) || { nome: "Produto removido", img: "" };
        return "<tr><td style='width:44px'><img src='" + p.img + "' alt='' style='width:38px;height:38px;border-radius:50%;object-fit:cover;background:#000'></td><td>" + esc(p.nome) +
          "<div class='hint tabnum'>" + it.q + " × " + brl.format(it.preco) + "</div></td><td class='right money'>" + brl.format(it.q * it.preco) + "</td></tr>";
      }).join("") + "</tbody></table>" +
      "<div class='total-line'><span>Total</span><b>" + brl.format(M.totalPedido(o)) + "</b></div>" +
      "<dl class='kv'><dt>Origem</dt><dd>" + esc(o.origem) + "</dd><dt>Pagamento</dt><dd>" + esc(o.pagamento) + "</dd><dt>WhatsApp</dt><dd class='tabnum'>" + esc(A.tel(c.tel)) + "</dd>" +
      (o.obs ? "<dt>Observação</dt><dd>" + esc(o.obs) + "</dd>" : "") + "</dl>" +
      "<div class='foot' style='justify-content:space-between'><button class='btn danger' id='d-excluir'>Excluir</button><div style='display:flex;gap:8px;flex-wrap:wrap'>" +
      "<a class='btn' target='_blank' rel='noopener noreferrer' href='https://wa.me/55" + esc(c.tel) + "?text=" + encodeURIComponent("Oi, " + c.nome.split(" ")[0] + "! Seu pedido #" + o.num + " da Bebidas Maruim está: " + statusNome(o.status) + ".") + "'>Avisar no WhatsApp</a>" +
      "<button class='btn primary' id='d-editar'>Editar pedido</button></div></div>");
    $$("[data-st]", corpo).forEach(function (b) { b.addEventListener("click", function () { mudarStatus(o.id, b.dataset.st); detalhePedido(o.id); }); });
    $("#d-editar", corpo).addEventListener("click", function () { A.fechar("drawer"); formPedido(o.id); });
    $("#d-excluir", corpo).addEventListener("click", function () {
      if (!confirm("Excluir o pedido #" + o.num + "? Isso não pode ser desfeito.")) return;
      M.excluirPedido(o.id); A.fechar("drawer"); A.toast("Pedido #" + o.num + " excluído"); A.render();
    });
  }

  function formPedido(id) {
    var o = id ? M.estado.pedidos.filter(function (p) { return p.id === id; })[0] : null;
    var itens = o ? o.itens.map(function (it) { return { pid: it.pid, q: it.q, preco: it.preco }; }) : [{ pid: "", q: 1, preco: 0 }];
    var ativos = M.estado.produtos.filter(function (p) { return p.ativo || itens.some(function (it) { return it.pid === p.id; }); });
    var clientes = M.estado.clientes.slice().sort(function (a, b) { return a.nome.localeCompare(b.nome); });
    var corpo = A.abrir("modal",
      "<h2>" + (o ? "Editar pedido #" + o.num : "Novo pedido") + "</h2><p class='hint' style='margin-bottom:16px'>Os itens usam o preço atual do catálogo</p>" +
      "<div class='field'><label for='f-cli'>Cliente</label><select class='inp' id='f-cli'><option value=''>Escolha o cliente</option><option value='__novo'>+ Cadastrar cliente novo</option>" +
      clientes.map(function (c) { return "<option value='" + c.id + "'" + (o && o.clienteId === c.id ? " selected" : "") + ">" + esc(c.nome) + "</option>"; }).join("") + "</select></div>" +
      "<div id='f-novo' style='display:none' class='two'><div class='field'><label for='f-nn'>Nome</label><input class='inp' id='f-nn' placeholder='Maria Silva'></div><div class='field'><label for='f-nt'>WhatsApp</label><input class='inp' id='f-nt' inputmode='tel' placeholder='47 99999-0000'></div></div>" +
      "<p class='hint' style='margin:4px 0 8px'>Itens</p><div class='items' id='f-itens'></div><button class='btn sm' id='f-add'>+ Adicionar item</button>" +
      "<div class='two' style='margin-top:14px'><div class='field'><label for='f-org'>Origem</label><select class='inp' id='f-org'>" + M.ORIGENS.map(function (x) { return "<option" + (o && o.origem === x ? " selected" : "") + ">" + x + "</option>"; }).join("") + "</select></div>" +
      "<div class='field'><label for='f-pag'>Pagamento</label><select class='inp' id='f-pag'>" + M.PAGAMENTOS.map(function (x) { return "<option" + (o && o.pagamento === x ? " selected" : "") + ">" + x + "</option>"; }).join("") + "</select></div></div>" +
      "<div class='field'><label for='f-obs'>Observação</label><input class='inp' id='f-obs' placeholder='Entregar depois das 18h' value='" + esc(o ? o.obs : "") + "'></div>" +
      "<div class='total-line'><span>Total</span><b id='f-total'>R$ 0,00</b></div><p class='err' id='f-err'></p>" +
      "<div class='foot'><button class='btn' data-action='fechar'>Cancelar</button><button class='btn primary' id='f-salvar'>" + (o ? "Salvar alterações" : "Registrar pedido") + "</button></div>");

    function desenhar() {
      $("#f-itens", corpo).innerHTML = itens.map(function (it, i) {
        return "<div class='item'><select class='inp' data-i='" + i + "' data-k='pid' aria-label='Produto'><option value=''>Escolha o sabor</option>" +
          Object.keys(M.CATEGORIAS).map(function (cat) {
            return "<optgroup label='" + M.CATEGORIAS[cat] + "'>" + ativos.filter(function (p) { return p.cat === cat; }).map(function (p) {
              return "<option value='" + p.id + "'" + (p.id === it.pid ? " selected" : "") + ">" + esc(p.nome) + " · " + brl.format(p.preco) + "</option>";
            }).join("") + "</optgroup>";
          }).join("") + "</select><input class='inp' type='number' min='1' step='1' value='" + it.q + "' data-i='" + i + "' data-k='q' aria-label='Quantidade'>" +
          "<span class='it-price'>" + brl.format(it.q * it.preco) + "</span><button class='icon-btn' data-rm='" + i + "' aria-label='Remover item'>✕</button></div>";
      }).join("");
      $("#f-total", corpo).textContent = brl.format(itens.reduce(function (s, it) { return s + it.q * it.preco; }, 0));
      $$("[data-k]", corpo).forEach(function (inp) {
        inp.addEventListener("change", function () {
          var it = itens[+inp.dataset.i];
          if (inp.dataset.k === "pid") { it.pid = inp.value; var p = M.produto(inp.value); it.preco = p ? p.preco : 0; }
          else it.q = Math.max(1, Math.round(+inp.value || 1));
          desenhar();
        });
      });
      $$("[data-rm]", corpo).forEach(function (b) { b.addEventListener("click", function () { itens.splice(+b.dataset.rm, 1); if (!itens.length) itens.push({ pid: "", q: 1, preco: 0 }); desenhar(); }); });
    }
    desenhar();
    $("#f-add", corpo).addEventListener("click", function () { itens.push({ pid: "", q: 1, preco: 0 }); desenhar(); });
    $("#f-cli", corpo).addEventListener("change", function () { $("#f-novo", corpo).style.display = this.value === "__novo" ? "grid" : "none"; $("#f-err", corpo).textContent = ""; });
    $("#f-salvar", corpo).addEventListener("click", function () {
      var err = $("#f-err", corpo), cid = $("#f-cli", corpo).value;
      var validos = itens.filter(function (it) { return it.pid; });
      if (!cid) { err.textContent = "Escolha o cliente do pedido."; return; }
      if (cid === "__novo") {
        var nn = $("#f-nn", corpo).value.trim(), nt = $("#f-nt", corpo).value.replace(/\D/g, "");
        if (nn.length < 3) { err.textContent = "Digite o nome do cliente novo."; return; }
        if (nt.length < 10) { err.textContent = "Digite o WhatsApp com DDD."; return; }
        cid = M.salvarCliente({ nome: nn, tel: nt, bairro: "", notas: "" }).id;
      }
      if (!validos.length) { err.textContent = "Adicione pelo menos um sabor."; return; }
      var dados = { clienteId: cid, itens: validos, origem: $("#f-org", corpo).value, pagamento: $("#f-pag", corpo).value, obs: $("#f-obs", corpo).value.trim() };
      if (o) dados.id = o.id; else dados.status = "novo";
      var salvo = M.salvarPedido(dados);
      A.fechar("modal"); A.toast(o ? "Pedido #" + salvo.num + " atualizado" : "Pedido #" + salvo.num + " registrado"); A.render();
    });
  }

  /* ---------- Clientes ---------- */
  function resumoClientes() {
    var r = {};
    M.estado.pedidos.forEach(function (o) {
      if (o.status === "cancelado") return;
      var x = r[o.clienteId] || (r[o.clienteId] = { n: 0, total: 0, ultimo: null });
      x.n++; x.total += M.totalPedido(o); if (!x.ultimo || o.data > x.ultimo) x.ultimo = o.data;
    });
    return r;
  }
  function renderClientes() {
    var r = resumoClientes(), q = busca();
    var lista = M.estado.clientes.filter(function (c) { return !q || c.nome.toLowerCase().indexOf(q) > -1 || c.tel.indexOf(q) > -1; })
      .sort(function (a, b) { return ((r[b.id] || {}).total || 0) - ((r[a.id] || {}).total || 0); });
    $("#cli-hint").textContent = lista.length + " clientes · ordenados por quem mais gastou";
    $("#clientes-body").innerHTML = lista.map(function (c) {
      var x = r[c.id] || { n: 0, total: 0, ultimo: null };
      var dias = x.ultimo ? Math.round((Date.now() - new Date(x.ultimo)) / 864e5) : null;
      return '<tr data-action="ver-cliente" data-id="' + c.id + '" tabindex="0"><td><span class="avatar-sm">' + A.ini(c.nome) + '</span><b>' + esc(c.nome) + '</b></td><td class="hide-sm">' + esc(c.bairro || "—") +
        '</td><td class="right tabnum">' + x.n + '</td><td class="right money">' + brl.format(x.total) + '</td><td class="hide-sm tabnum">' +
        (dias === null ? "—" : dias === 0 ? "hoje" : "há " + dias + " dia" + (dias === 1 ? "" : "s")) + '</td><td class="right"><span class="hint">›</span></td></tr>';
    }).join("") || '<tr><td colspan="6" class="empty">Nenhum cliente encontrado</td></tr>';
  }
  function detalheCliente(id) {
    var c = M.cliente(id); if (!c) return;
    var ps = M.estado.pedidos.filter(function (o) { return o.clienteId === id; }).sort(function (a, b) { return a.data < b.data ? 1 : -1; });
    var validos = ps.filter(function (o) { return o.status !== "cancelado"; });
    var total = validos.reduce(function (s, o) { return s + M.totalPedido(o); }, 0), fav = {};
    validos.forEach(function (o) { o.itens.forEach(function (it) { fav[it.pid] = (fav[it.pid] || 0) + it.q; }); });
    var favId = Object.keys(fav).sort(function (a, b) { return fav[b] - fav[a]; })[0], favP = favId && M.produto(favId);
    var corpo = A.abrir("drawer",
      '<div style="display:flex;justify-content:space-between;align-items:center"><span class="avatar-sm" style="width:52px;height:52px;font-size:18px">' + A.ini(c.nome) + '</span><button class="icon-btn" data-action="fechar" aria-label="Fechar">✕</button></div>' +
      "<h2 style='margin-top:10px'>" + esc(c.nome) + "</h2><p class='hint tabnum'>" + esc(A.tel(c.tel)) + (c.bairro ? " · " + esc(c.bairro) : "") + "</p>" +
      "<div class='cats' style='margin:16px 0'><div class='cat'><div class='t'>Pedidos</div><div class='n'>" + validos.length + "</div></div><div class='cat'><div class='t'>Gastou</div><div class='n'>" + brl.format(total) +
      "</div></div><div class='cat'><div class='t'>Ticket</div><div class='n'>" + brl.format(validos.length ? total / validos.length : 0) + "</div></div></div>" +
      (favP ? "<p class='hint'>Sabor favorito: <b style='color:var(--cream)'>" + esc(favP.nome) + "</b> (" + fav[favId] + " un)</p>" : "") +
      (c.notas ? "<p class='hint'>Anotação: " + esc(c.notas) + "</p>" : "") +
      "<h3 style='font-family:var(--display);margin:18px 0 6px'>Histórico</h3><table><tbody>" +
      (ps.slice(0, 12).map(function (o) { return '<tr data-action="ver-pedido" data-id="' + o.id + '" tabindex="0"><td><span class="num">#' + o.num + '</span><div class="when tabnum">' + new Date(o.data).toLocaleDateString("pt-BR") + "</div></td><td>" + A.statusPill(o.status) + "</td><td class='right money'>" + brl.format(M.totalPedido(o)) + "</td></tr>"; }).join("") ||
        "<tr><td class='hint'>Ainda sem pedidos</td></tr>") + "</tbody></table>" +
      "<div class='foot'><a class='btn' target='_blank' rel='noopener noreferrer' href='https://wa.me/55" + esc(c.tel) + "'>WhatsApp</a><button class='btn' id='c-editar'>Editar</button><button class='btn primary' id='c-pedido'>Novo pedido</button></div>");
    $("#c-editar", corpo).addEventListener("click", function () { A.fechar("drawer"); formCliente(id); });
    $("#c-pedido", corpo).addEventListener("click", function () { A.fechar("drawer"); formPedido(); var s = $("#f-cli"); s.value = id; });
  }
  function formCliente(id) {
    var c = id ? M.cliente(id) : { nome: "", tel: "", bairro: "", notas: "" };
    var corpo = A.abrir("modal", "<h2>" + (id ? "Editar cliente" : "Novo cliente") + "</h2><p class='hint' style='margin-bottom:16px'>Nome e WhatsApp são obrigatórios</p>" +
      "<div class='two'><div class='field'><label for='c-nome'>Nome</label><input class='inp' id='c-nome' value='" + esc(c.nome) + "' placeholder='Maria Silva'></div>" +
      "<div class='field'><label for='c-tel'>WhatsApp</label><input class='inp' id='c-tel' inputmode='tel' value='" + esc(A.tel(c.tel)) + "' placeholder='47 99999-0000'></div></div>" +
      "<div class='field'><label for='c-bairro'>Bairro</label><input class='inp' id='c-bairro' value='" + esc(c.bairro) + "' placeholder='América'></div>" +
      "<div class='field'><label for='c-notas'>Anotações</label><textarea class='inp' id='c-notas' rows='3' placeholder='Prefere entrega à tarde'>" + esc(c.notas) + "</textarea></div>" +
      "<p class='err' id='c-err'></p><div class='foot'><button class='btn' data-action='fechar'>Cancelar</button><button class='btn primary' id='c-salvar'>Salvar cliente</button></div>");
    $("#c-salvar", corpo).addEventListener("click", function () {
      var nome = $("#c-nome", corpo).value.trim(), tel = $("#c-tel", corpo).value.replace(/\D/g, "");
      if (nome.length < 3) { $("#c-err", corpo).textContent = "Digite o nome do cliente."; return; }
      if (tel.length < 10) { $("#c-err", corpo).textContent = "Digite o WhatsApp com DDD."; return; }
      M.salvarCliente({ id: id, nome: nome, tel: tel, bairro: $("#c-bairro", corpo).value.trim(), notas: $("#c-notas", corpo).value.trim() });
      A.fechar("modal"); A.toast(id ? "Cliente atualizado" : "Cliente cadastrado"); A.render();
    });
  }

  /* ---------- Produtos ---------- */
  function renderProdutos() {
    $$("[data-cat]").forEach(function (b) { b.classList.toggle("on", b.dataset.cat === catProdutos); });
    var vend = {}, limite = Date.now() - 30 * 864e5;
    M.estado.pedidos.forEach(function (o) { if (o.status !== "cancelado" && new Date(o.data) > limite) o.itens.forEach(function (it) { vend[it.pid] = (vend[it.pid] || 0) + it.q; }); });
    $("#produtos-body").innerHTML = M.estado.produtos.filter(function (p) { return catProdutos === "todos" || p.cat === catProdutos; }).map(function (p, i) {
      var baixo = p.estoque <= 5;
      return '<div class="pcard anim' + (p.ativo ? "" : " off") + '" style="animation-delay:' + (i * 25) + 'ms"><img src="' + p.img + '" alt=""><div class="b"><div class="line"><span class="t" style="color:var(--cream)">' + esc(p.nome) +
        '</span><button class="switch' + (p.ativo ? " on" : "") + '" data-toggle="' + p.id + '" aria-label="' + (p.ativo ? "Tirar do catálogo" : "Voltar ao catálogo") + '" aria-pressed="' + p.ativo + '"></button></div>' +
        '<div class="line"><span>' + ({licor:"Licor",kombucha:"Kombucha",ice:"Ice"})[p.cat] + " · " + (vend[p.id] || 0) + ' vendidos em 30 dias</span></div>' +
        '<div class="line"><label for="pr-' + p.id + '">Preço (R$)</label><input id="pr-' + p.id + '" type="number" min="0" step="0.5" value="' + p.preco + '" data-preco="' + p.id + '"></div>' +
        '<div class="line"><label for="es-' + p.id + '">Estoque' + (baixo ? ' <b style="color:var(--rust)">· baixo</b>' : "") + '</label><input id="es-' + p.id + '" type="number" min="0" step="1" value="' + p.estoque + '" data-estoque="' + p.id + '"></div></div></div>';
    }).join("");
    $$("[data-toggle]").forEach(function (b) { b.addEventListener("click", function () { var p = M.produto(b.dataset.toggle); p.ativo = !p.ativo; M.salvar(); A.toast(p.nome + (p.ativo ? " voltou ao catálogo" : " saiu do catálogo")); renderProdutos(); }); });
    $$("[data-preco],[data-estoque]").forEach(function (inp) {
      inp.addEventListener("change", function () {
        var p = M.produto(inp.dataset.preco || inp.dataset.estoque), v = Math.max(0, +inp.value || 0);
        if (inp.dataset.preco) { p.preco = Math.round(v * 100) / 100; A.toast("Preço de " + A.curto(p.nome) + ": " + brl.format(p.preco)); }
        else { p.estoque = Math.round(v); A.toast("Estoque de " + A.curto(p.nome) + ": " + p.estoque); }
        M.salvar(); renderProdutos();
      });
    });
  }
  $$("[data-cat]").forEach(function (b) { b.addEventListener("click", function () { catProdutos = b.dataset.cat; renderProdutos(); }); });

  /* ---------- Origem e vendas ---------- */
  function renderOrigem() {
    var iv = A.intervalo(), atual = A.pedidosEntre(iv.ini, iv.fim), todos = A.pedidosEntre(iv.ini, iv.fim, true);
    var fat = atual.reduce(function (s, o) { return s + M.totalPedido(o); }, 0);
    $("#o-total").textContent = brl.format(fat) + " · " + atual.length + " pedidos";
    G.area($("#o-area"), A.serieDiaria(atual, iv), { efeito: "desenho", duracao: 2000, altura: 260, eixo: function (v) { return "R$" + A.int.format(Math.round(v)); }, aoClicar: iv.umDia ? null : function (d) { A.setPeriodo(null, d.dia); } });
    var cat = {}, sab = {}, org = {}, pag = {};
    atual.forEach(function (o) {
      org[o.origem] = (org[o.origem] || 0) + 1; pag[o.pagamento] = (pag[o.pagamento] || 0) + 1;
      o.itens.forEach(function (it) { var p = M.produto(it.pid); if (!p) return; cat[p.cat] = (cat[p.cat] || 0) + it.q * it.preco; sab[p.id] = (sab[p.id] || 0) + it.q * it.preco; });
    });
    G.barras($("#o-barras"), Object.keys(M.CATEGORIAS).map(function (k) { return { rotulo: M.CATEGORIAS[k], valor: cat[k] || 0, dica: brl.format(cat[k] || 0) }; }),
      { duracao: 1700, eixo: function (v) { return "R$" + A.int.format(Math.round(v)); }, aoClicar: function () { A.ir("produtos"); } });
    var canc = todos.length - atual.length;
    G.rosca($("#o-rosca"), M.ORIGENS.map(function (o) { return { rotulo: o, valor: org[o] || 0, dica: (org[o] || 0) + " pedidos" }; }),
      { duracao: 1800, tamanho: 210, centro: [atual.length, "pedidos" + (canc ? "<br>+" + canc + " cancel." : "")] });
    var top = Object.keys(sab).sort(function (a, b) { return sab[b] - sab[a]; }).slice(0, 8);
    G.barras($("#o-sabores"), top.map(function (id) { var p = M.produto(id); return { rotulo: A.curto(p.nome), valor: sab[id], dica: brl.format(sab[id]) }; }),
      { duracao: 1700, eixo: function (v) { return "R$" + A.int.format(Math.round(v)); } });
    G.rosca($("#o-pagto"), M.PAGAMENTOS.map(function (x) { return { rotulo: x, valor: pag[x] || 0, dica: (pag[x] || 0) + " pedidos" }; }),
      { duracao: 1800, tamanho: 210, centro: [Math.round((pag["Pix"] || 0) / (atual.length || 1) * 100) + "%", "no Pix"] });
  }

  window.Telas = {
    render: function (t) { if (t === "pedidos") renderPedidos(); if (t === "clientes") renderClientes(); if (t === "produtos") renderProdutos(); if (t === "origem") renderOrigem(); },
    formPedido: formPedido, detalhePedido: detalhePedido, formCliente: formCliente, detalheCliente: detalheCliente
  };
})();
