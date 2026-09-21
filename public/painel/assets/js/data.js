/* data.js — catálogo, dados de exemplo e persistência (localStorage).
   Protótipo: tudo fica salvo no navegador de quem abre. No sistema real
   isso vira o banco de dados. */
(function () {
  "use strict";

  var PASTA_IMG = "/painel/assets/img/"; // única fonte da pasta das fotos
  var CHAVE = "maruim-crm-v2";

  /* Catálogo real da landing */
  var CATALOGO = [
    ["jabuticaba","Licor de Jabuticaba","licor",35,"render-jabuticaba",9],["butia","Licor de Butiá","licor",35,"render-butia",7],
    ["cafe","Licor de Café","licor",40,"render-cafe",8],["morango","Licor de Morango","licor",40,"render-morango",6],
    ["figo","Licor de Figo","licor",40,"render-figo",3],["ameixa","Licor de Ameixa","licor",50,"render-ameixa",3],
    ["anis","Licor de Anis Estrelado","licor",30,"render-anis",2],["banana","Licor de Banana","licor",30,"render-banana",4],
    ["canela","Licor de Canela","licor",30,"render-canela",4],["maracuja","Licor de Maracujá","licor",30,"render-maracuja",5],
    ["abacaxi","Licor de Abacaxi","licor",30,"render-abacaxi",3],
    ["k-abacaxi","Kombucha Abacaxi e Hortelã","kombucha",11,"kombucha-abacaxi",5],["k-gengibre","Kombucha Gengibre, Limão e Mel","kombucha",11,"kombucha-gengibre",6],
    ["k-maracuja","Kombucha Maracujá e Cardamomo","kombucha",11,"kombucha-maracuja",3],["k-morango","Kombucha Morango e Hibisco","kombucha",11,"kombucha-morango",5],
    ["k-pink","Kombucha Pink Lemonade","kombucha",11,"kombucha-pinklemonade",4],["k-uva","Kombucha Uva","kombucha",11,"kombucha-uva",3],
    ["k-uvabranca","Kombucha Uva Branca","kombucha",11,"kombucha-uvabranca",2],
    ["i-limao","Ice Limão","ice",7.5,"ice-limao",6],["i-abacaxi","Ice Abacaxi","ice",7.5,"ice-abacaxi",4],
    ["i-melancia","Ice Melancia","ice",7.5,"ice-melancia",5],["i-maracuja","Ice Maracujá","ice",7.5,"ice-maracuja",3]
  ];

  var NOMES = ["Mariana Kraus","Rafael Schmitt","Juliana Beck","Carlos Hoffmann","Patrícia Lenz","Bruno Voigt","Fernanda Rocha",
    "Diego Martins","Aline Weber","Gustavo Pereira","Camila Fischer","Rodrigo Silva","Letícia Koch","André Souza","Bianca Schulz",
    "Thiago Lima","Renata Zimmer","Marcelo Costa","Larissa Braun","Eduardo Nunes","Priscila Wolf","Fábio Ramos","Tatiane Hass",
    "Leandro Alves","Vanessa Klein","Paulo Werner","Débora Santos","Rogério Mayer","Simone Vieira","Henrique Borba",
    "Cristiane Moser","Lucas Pacheco","Daniela Stein","Márcio Teixeira","Gabriela Ritter","Sérgio Duarte"];
  var BAIRROS = ["América","Anita Garibaldi","Atiradores","Bom Retiro","Boa Vista","Centro","Costa e Silva","Glória","Iririú","Saguaçu","Santo Antônio","Floresta"];

  var CATEGORIAS = { licor: "Licores", kombucha: "Kombuchas", ice: "Ice" };
  var ORIGENS = ["Site", "WhatsApp direto", "Instagram", "Indicação"];
  var STATUS = [
    { id: "novo", nome: "Novo" },
    { id: "confirmado", nome: "Confirmado" },
    { id: "rota", nome: "Saiu para entrega" },
    { id: "entregue", nome: "Entregue" },
    { id: "cancelado", nome: "Cancelado" }
  ];
  var PAGAMENTOS = ["Pix", "Dinheiro", "Cartão"];

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  /* Dados de exemplo: 75 dias até hoje, gerador determinístico */
  function gerarExemplo(sementeInicial) {
    var seed = sementeInicial || 20140916;
    function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
    function pick(list, peso) {
      var t = 0, i; for (i = 0; i < list.length; i++) t += peso(list[i]);
      var r = rnd() * t;
      for (i = 0; i < list.length; i++) { r -= peso(list[i]); if (r <= 0) return list[i]; }
      return list[list.length - 1];
    }

    /* O catálogo agora vive no banco: os produtos vêm de lá, com os ids de
       lá. Inventar produtos aqui geraria pedidos apontando para ids que não
       existem, e o banco recusaria por chave estrangeira.
       O CATALOGO local só entra se ainda não houver nada carregado. */
    var base = (estado && estado.produtos && estado.produtos.length)
      ? estado.produtos
      : CATALOGO.map(function (p) {
          return { id: p[0], nome: p[1], cat: p[2], preco: p[3], img: PASTA_IMG + p[4] + ".jpg", ativo: true };
        });

    // Peso = probabilidade de o sabor aparecer num pedido. Vem do CATALOGO
    // quando o produto é conhecido; senão, peso médio.
    var pesos = {};
    CATALOGO.forEach(function (p) { pesos[p[1]] = p[5]; });

    var produtos = base.map(function (p) {
      return {
        id: p.id, nome: p.nome, cat: p.cat, preco: p.preco, img: p.img,
        ativo: p.ativo !== false,
        estoque: 10 + Math.floor(rnd() * 40),
        _peso: pesos[p.nome] || 4
      };
    });
    var hoje = new Date();
    var clientes = NOMES.map(function (n, i) {
      var tel = "4799" + String(1000000 + Math.floor(rnd() * 8999999)).slice(0, 7);
      var criado = new Date(hoje); criado.setDate(criado.getDate() - 80 - Math.floor(rnd() * 300));
      return { id: "c" + i, nome: n, tel: tel, bairro: BAIRROS[Math.floor(rnd() * BAIRROS.length)], notas: "",
        criado: criado.toISOString(), _fiel: i < 14, _fav: pick(produtos, function (p) { return p._peso; }) };
    });

    var pedidos = [];
    var inicio = new Date(hoje); inicio.setDate(inicio.getDate() - 75); inicio.setHours(0, 0, 0, 0);
    for (var d = new Date(inicio); d <= hoje; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0) continue;
      var idade = (hoje - d) / 864e5;
      var qtd = Math.floor(3.4 + (75 - idade) / 40 + rnd() * 4) + (d.getDay() === 6 ? 2 : 0);
      for (var k = 0; k < qtd; k++) {
        var c = pick(clientes, function (c) { return c._fiel ? 4 : 1; });
        var itens = [], n = 1 + Math.floor(rnd() * 3);
        for (var j = 0; j < n; j++) {
          var p = rnd() < .35 ? c._fav : pick(produtos, function (p) { return p._peso; });
          var existente = itens.filter(function (it) { return it.pid === p.id; })[0];
          var q = p.cat === "licor" ? 1 + Math.floor(rnd() * 2) : 1 + Math.floor(rnd() * 3);
          if (existente) existente.q += q; else itens.push({ pid: p.id, q: q, preco: p.preco });
        }
        var data = new Date(d); data.setHours(9 + Math.floor(rnd() * 10), Math.floor(rnd() * 60), 0, 0);
        if (data > hoje) data = new Date(hoje.getTime() - (k + 1) * 7 * 6e4);
        var horas = (hoje - data) / 36e5, status;
        if (horas > 48) status = rnd() < .04 ? "cancelado" : "entregue";
        else if (horas > 20) status = rnd() < .5 ? "entregue" : "rota";
        else status = pick(["novo", "confirmado", "rota"], function () { return 1; });
        var o = rnd();
        pedidos.push({ id: uid() + k, data: data.toISOString(), clienteId: c.id, itens: itens,
          origem: o < .5 ? "Site" : o < .78 ? "WhatsApp direto" : o < .94 ? "Instagram" : "Indicação",
          pagamento: PAGAMENTOS[Math.floor(rnd() * 3)], status: status, obs: "" });
      }
    }
    pedidos.sort(function (a, b) { return a.data < b.data ? -1 : 1; });
    pedidos.forEach(function (p, i) { p.num = 1001 + i; });
    produtos.forEach(function (p) { delete p._peso; });
    clientes.forEach(function (c) { delete c._fiel; delete c._fav; });
    return { versao: 2, produtos: produtos, clientes: clientes, pedidos: pedidos };
  }

  // O caminho da foto é gravado dentro do produto e vai junto para o
  // localStorage. Quem já tinha usado o CRM antes de as fotos mudarem de pasta
  // ficaria com as imagens quebradas para sempre, porque o dado salvo vence o
  // catálogo novo. Aqui o caminho é reancorado na carga: o dado guarda o nome
  // do arquivo, quem decide a pasta é o código.
  function normalizarImagens(dados) {
    if (!dados || !dados.produtos) return dados;
    dados.produtos.forEach(function (p) {
      if (!p.img) return;
      // Caminho absoluto ("/products/...") vem do banco: a foto é servida pelo
      // webapp, que passa a ser a fonte única das imagens do catálogo. Em
      // produção os dois estão no mesmo domínio e o prefixo some.
      if (p.img.charAt(0) === "/") p.img = (window.MARUIM_API || "") + p.img;
      // Caminho relativo é dado antigo, de quando as fotos eram locais.
      else if (p.img.indexOf("http") !== 0) p.img = PASTA_IMG + p.img.split("/").pop();
    });
    return dados;
  }

  /* ------------------------------------------------------------------
     Persistência: PostgreSQL, através da API do webapp.

     Antes tudo vivia no localStorage — cada navegador tinha a própria base,
     e a landing não conseguia enxergar nada. Agora o estado vem do banco,
     então o dono vê o mesmo painel no celular e no computador, e o site e o
     CRM leem a mesma verdade.

     O formato de `estado` não mudou: a API entrega exatamente o que as telas
     já esperavam. Por isso nenhuma tela precisou ser reescrita.
     ------------------------------------------------------------------ */

  // Em produção o painel é servido pelo mesmo domínio da API e isto fica "".
  var API = (window.MARUIM_API || "http://localhost:3000") + "/api/crm/estado";

  var estado = { versao: 3, produtos: [], clientes: [], pedidos: [] };
  var salvando = null, salvarDeNovo = false, aoFalhar = null;

  function carregar() {
    return fetch(API, { headers: { Accept: "application/json" } })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (dados) { estado = normalizarImagens(dados); return estado; });
  }

  /* Envia o estado inteiro. Se um salvamento já estiver em voo, marca para
     reenviar ao terminar — assim cliques em sequência não geram uma fila de
     requisições nem se atropelam fora de ordem. */
  function salvar() {
    if (salvando) { salvarDeNovo = true; return salvando; }
    salvando = fetch(API, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(estado)
    })
      .then(function (r) {
        if (!r.ok) return r.json().then(function (j) { throw new Error(j.erro || "HTTP " + r.status); });
      })
      .catch(function (e) {
        if (typeof aoFalhar === "function") aoFalhar(e);
        else console.error("Falha ao salvar no banco:", e.message);
      })
      .then(function () {
        salvando = null;
        if (salvarDeNovo) { salvarDeNovo = false; return salvar(); }
      });
    return salvando;
  }

  /* Permite ao app.js mostrar um aviso na tela quando o banco recusar. */
  function aoFalharSalvar(fn) { aoFalhar = fn; }
  function resetar() { estado = gerarExemplo(); salvar(); }

  /* Começar a usar de verdade: apaga o movimento (clientes, pedidos) e
     mantém o catálogo, que é real. O estoque volta a zero porque a contagem
     antiga vinha dos dados de exemplo e não corresponde ao que existe. */
  function limpar() {
    estado = {
      versao: 2,
      produtos: (estado.produtos || gerarExemplo().produtos).map(function (p) {
        return Object.assign({}, p, { estoque: 0 });
      }),
      clientes: [],
      pedidos: []
    };
    salvar();
  }

  /* Só para apresentar: gera um movimento fictício novo a cada chamada.
     A semente vem do relógio, então os números mudam — diferente do
     "restaurar", que sempre devolve exatamente o mesmo conjunto. */
  function embaralhar() {
    estado = gerarExemplo(Date.now() % 4294967296);
    salvar();
  }

  function produto(id) { return estado.produtos.filter(function (p) { return p.id === id; })[0]; }
  function cliente(id) { return estado.clientes.filter(function (c) { return c.id === id; })[0]; }
  function totalPedido(o) { return o.itens.reduce(function (s, it) { return s + it.q * it.preco; }, 0); }

  function salvarPedido(dados) {
    if (dados.id) {
      var i = estado.pedidos.findIndex(function (p) { return p.id === dados.id; });
      estado.pedidos[i] = Object.assign(estado.pedidos[i], dados);
    } else {
      dados.id = uid();
      dados.num = estado.pedidos.reduce(function (m, p) { return Math.max(m, p.num); }, 1000) + 1;
      dados.data = dados.data || new Date().toISOString();
      estado.pedidos.push(dados);
      // baixa de estoque
      dados.itens.forEach(function (it) { var p = produto(it.pid); if (p) p.estoque = Math.max(0, p.estoque - it.q); });
    }
    salvar();
    return dados;
  }
  function excluirPedido(id) {
    estado.pedidos = estado.pedidos.filter(function (p) { return p.id !== id; });
    salvar();
  }
  function salvarCliente(dados) {
    if (dados.id) Object.assign(cliente(dados.id), dados);
    else { dados.id = "c" + uid(); dados.criado = new Date().toISOString(); estado.clientes.push(dados); }
    salvar();
    return dados;
  }

  window.Maruim = {
    CATEGORIAS: CATEGORIAS, ORIGENS: ORIGENS, STATUS: STATUS, PAGAMENTOS: PAGAMENTOS,
    get estado() { return estado; },
    carregar: carregar, salvar: salvar, aoFalharSalvar: aoFalharSalvar,
    resetar: resetar, limpar: limpar, embaralhar: embaralhar,
    produto: produto, cliente: cliente, totalPedido: totalPedido,
    salvarPedido: salvarPedido, excluirPedido: excluirPedido, salvarCliente: salvarCliente
  };
})();
