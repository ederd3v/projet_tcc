/* charts.js — gráficos em SVG puro, no mesmo desenho dos gráficos do
   Arena Dunas (recharts): área com traço em degradê e preenchimento que
   some para baixo, pontos em cada dia, grade tracejada, tooltip escuro;
   barras com a líder destacada; rosca com espaçamento entre fatias.
   Aqui o laranja do Dunas vira o âmbar da Maruim.

   Animação de entrada: os valores crescem a partir do zero quando o
   gráfico aparece na tela (ao abrir a página, trocar de aba, trocar o
   período ou rolar até ele). Redimensionar a janela redesenha sem animar. */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var AMBAR = "oklch(72% .14 70)", AMBAR_CLARO = "oklch(80% .12 75)", COBRE = "oklch(55% .15 40)";
  var TONS = ["oklch(72% .14 70)", "oklch(80% .11 78)", "oklch(60% .15 50)", "oklch(88% .07 85)", "oklch(48% .12 45)", "oklch(66% .06 75)"];
  var n = 0;
  var cfg = { animar: true };
  var SEM_MOVIMENTO = window.matchMedia("(prefers-reduced-motion: reduce)");

  function el(tag, attrs, pai) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (pai) pai.appendChild(e);
    return e;
  }
  function tetoBonito(v) {
    if (v <= 0) return 100;
    var m = Math.pow(10, Math.floor(Math.log10(v))), f = v / m;
    return (f <= 1 ? 1 : f <= 1.5 ? 1.5 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 3 ? 3 : f <= 4 ? 4 : f <= 5 ? 5 : f <= 6 ? 6 : f <= 8 ? 8 : 10) * m;
  }
  function tooltip(box) {
    var t = box.querySelector(".ctip");
    if (!t) { t = document.createElement("div"); t.className = "ctip"; t.setAttribute("role", "status"); box.appendChild(t); }
    return {
      show: function (x, y, rotulo, valor) { t.innerHTML = '<div class="l">' + rotulo + '</div><div class="v">' + valor + "</div>"; t.style.left = x + "px"; t.style.top = y + "px"; t.style.opacity = 1; },
      hide: function () { t.style.opacity = 0; }
    };
  }
  function limitar(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function saida(k) { return 1 - Math.pow(1 - k, 3); }                    // desacelera no fim
  function mola(k) { var c = 1.4; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); } // passa um pouco e volta

  /* Roda desenhar(k) de 0 a 1 quando o gráfico entra na tela. */
  function animar(box, dur, desenhar) {
    if (box._anim) cancelAnimationFrame(box._anim);
    if (box._obs) { box._obs.disconnect(); box._obs = null; }
    if (!cfg.animar || SEM_MOVIMENTO.matches) { desenhar(1); return; }
    desenhar(0);
    function rodar() {
      var t0 = null;
      function passo(t) {
        if (t0 === null) t0 = t;
        var k = limitar((t - t0) / dur);
        desenhar(k);
        if (k < 1) box._anim = requestAnimationFrame(passo);
      }
      box._anim = requestAnimationFrame(passo);
    }
    if (!("IntersectionObserver" in window)) { rodar(); return; }
    box._obs = new IntersectionObserver(function (entradas) {
      if (entradas.some(function (e) { return e.isIntersecting; })) { box._obs.disconnect(); box._obs = null; rodar(); }
    }, { threshold: 0.15 });
    box._obs.observe(box);
  }

  // Curva monotônica (mesma ideia do type="monotone" do recharts): não passa abaixo de zero
  function curva(pts) {
    if (pts.length < 2) return "M" + pts.map(function (p) { return p.x + "," + p.y; }).join("L");
    var i, dx = [], dy = [], m = [], t = [];
    for (i = 0; i < pts.length - 1; i++) { dx[i] = pts[i + 1].x - pts[i].x; dy[i] = pts[i + 1].y - pts[i].y; m[i] = dy[i] / dx[i]; }
    t[0] = m[0]; t[pts.length - 1] = m[pts.length - 2];
    for (i = 1; i < pts.length - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
    for (i = 0; i < pts.length - 1; i++) {
      if (m[i] === 0) { t[i] = t[i + 1] = 0; continue; }
      var a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b;
      if (s > 9) { var k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
    }
    var d = "M" + pts[0].x + "," + pts[0].y;
    for (i = 0; i < pts.length - 1; i++) {
      var h = dx[i] / 3;
      d += "C" + (pts[i].x + h) + "," + (pts[i].y + t[i] * h) + " " + (pts[i + 1].x - h) + "," + (pts[i + 1].y - t[i + 1] * h) + " " + pts[i + 1].x + "," + pts[i + 1].y;
    }
    return d;
  }

  /* Área: dados = [{rotulo, valor, dica}] */
  function area(box, dados, op) {
    op = op || {};
    box.classList.add("svgchart");
    box.innerHTML = "";
    var W = Math.max(box.clientWidth, 280), H = op.altura || 240, L = 62, R = 12, T = 12, B = 26;
    var id = "a" + (++n), N = dados.length;
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, height: H, role: "img", "aria-label": op.titulo || "Gráfico de área" }, box);
    var defs = el("defs", {}, svg);
    var gs = el("linearGradient", { id: id + "s", x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    el("stop", { offset: "0%", "stop-color": COBRE }, gs); el("stop", { offset: "100%", "stop-color": AMBAR_CLARO }, gs);
    var gf = el("linearGradient", { id: id + "f", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el("stop", { offset: "0%", "stop-color": AMBAR, "stop-opacity": .3 }, gf); el("stop", { offset: "100%", "stop-color": AMBAR, "stop-opacity": 0 }, gf);

    var max = tetoBonito(Math.max.apply(null, dados.map(function (d) { return d.valor; }).concat([1])));
    var y = function (v) { return T + (H - T - B) * (1 - v / max); };
    var passo = N > 1 ? (W - L - R) / (N - 1) : 0;
    var x = function (i) { return N > 1 ? L + i * passo : (L + W - R) / 2; };
    [0, .25, .5, .75, 1].forEach(function (f) {
      el("line", { x1: L, x2: W - R, y1: y(max * f), y2: y(max * f), class: "gl" }, svg);
      el("text", { x: L - 10, y: y(max * f) + 4, "text-anchor": "end", class: "ax" }, svg).textContent = op.eixo ? op.eixo(max * f) : Math.round(max * f);
    });
    var cada = Math.max(1, Math.ceil(N / Math.floor((W - L - R) / 46)));
    dados.forEach(function (d, i) {
      if ((i % cada === 0 && N - 1 - i >= cada) || i === N - 1) el("text", { x: x(i), y: H - 6, "text-anchor": "middle", class: "ax" }, svg).textContent = d.rotulo;
    });

    var raio = N > 40 ? 0 : 3;
    var preench = el("path", { fill: "url(#" + id + "f)" }, svg);
    var linha = el("path", { fill: "none", stroke: "url(#" + id + "s)", "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
    var cursor = el("line", { y1: T, y2: H - B, class: "cursor", opacity: 0 }, svg);
    var dots = dados.map(function (d, i) { return el("circle", { cx: x(i), cy: y(0), r: 0, fill: AMBAR }, svg); });
    var emHover = false;

    if (op.efeito === "desenho") {
      // Linha se desenhando da esquerda para a direita; preenchimento aparece logo atrás
      var pts0 = dados.map(function (d, i) { return { x: x(i), y: y(d.valor) }; });
      if (N) {
        var dl0 = curva(pts0);
        linha.setAttribute("d", dl0);
        linha.setAttribute("pathLength", 1000);
        linha.setAttribute("stroke-dasharray", 1000);
        preench.setAttribute("d", dl0 + "L" + pts0[N - 1].x + "," + y(0) + "L" + pts0[0].x + "," + y(0) + "Z");
      }
      animar(box, op.duracao || 2200, function (k) {
        var e = 0.5 - Math.cos(Math.PI * k) / 2;   // ritmo constante, sem disparar no começo
        linha.setAttribute("stroke-dashoffset", 1000 * (1 - e));
        preench.setAttribute("opacity", saida(limitar((k - 0.2) / 0.8)));
        if (emHover) return;
        dots.forEach(function (c, i) {
          var chegou = limitar((e - (N > 1 ? i / (N - 1) : 0)) * 8);
          c.setAttribute("cy", pts0[i].y);
          c.setAttribute("r", raio * chegou);
        });
      });
    } else
    // Onda da esquerda para a direita: cada ponto sobe um pouco depois do anterior
    animar(box, op.duracao || 1400, function (k) {
      if (!N) return;
      var pts = dados.map(function (d, i) {
        var atraso = N > 1 ? i / (N - 1) * 0.45 : 0;
        var ki = limitar((k - atraso) / 0.55);
        return { x: x(i), y: y(d.valor * mola(ki)), ki: ki };
      });
      var dl = curva(pts);
      linha.setAttribute("d", dl);
      preench.setAttribute("d", dl + "L" + pts[N - 1].x + "," + y(0) + "L" + pts[0].x + "," + y(0) + "Z");
      preench.setAttribute("opacity", saida(limitar(k * 1.5)));
      if (emHover) return;
      dots.forEach(function (c, i) {
        c.setAttribute("cy", pts[i].y);
        c.setAttribute("r", raio * saida(limitar(pts[i].ki * 2.2 - 0.6)));
      });
    });

    var tip = tooltip(box);
    dados.forEach(function (d, i) {
      var w = passo || (W - L - R);
      var hit = el("rect", { x: x(i) - w / 2, y: T, width: w, height: H - T - B, class: "hit", tabindex: 0, "aria-label": d.rotulo + ": " + d.dica }, svg);
      function on() {
        emHover = true;
        dots.forEach(function (c, j) { c.setAttribute("cy", y(dados[j].valor)); c.setAttribute("r", j === i ? 6 : raio); c.setAttribute("fill", j === i ? AMBAR_CLARO : AMBAR); });
        cursor.setAttribute("x1", x(i)); cursor.setAttribute("x2", x(i)); cursor.setAttribute("opacity", 1);
        var r = box.clientWidth / W;
        tip.show(x(i) * r, y(d.valor) * r, d.dicaRotulo || d.rotulo, d.dica);
      }
      function off() { tip.hide(); cursor.setAttribute("opacity", 0); dots.forEach(function (c) { c.setAttribute("r", raio); c.setAttribute("fill", AMBAR); }); }
      hit.addEventListener("mouseenter", on); hit.addEventListener("focus", on);
      hit.addEventListener("mouseleave", off); hit.addEventListener("blur", off);
      if (op.aoClicar) {
        hit.addEventListener("click", function () { op.aoClicar(d); });
        hit.addEventListener("keydown", function (e) { if (e.key === "Enter") op.aoClicar(d); });
      } else hit.style.cursor = "default";
    });
  }

  /* Barras: dados = [{rotulo, valor, dica}] — a maior fica em âmbar */
  function barras(box, dados, op) {
    op = op || {};
    box.classList.add("svgchart");
    box.innerHTML = "";
    var W = Math.max(box.clientWidth, 280), H = op.altura || 260, L = 58, R = 8, T = 10, B = 34, N = dados.length;
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, height: H, role: "img", "aria-label": op.titulo || "Gráfico de barras" }, box);
    var max = tetoBonito(Math.max.apply(null, dados.map(function (d) { return d.valor; }).concat([1])));
    var y = function (v) { return T + (H - T - B) * (1 - v / max); };
    [0, .5, 1].forEach(function (f) {
      el("line", { x1: L, x2: W - R, y1: y(max * f), y2: y(max * f), class: "gl" }, svg);
      el("text", { x: L - 10, y: y(max * f) + 4, "text-anchor": "end", class: "ax" }, svg).textContent = op.eixo ? op.eixo(max * f) : Math.round(max * f);
    });
    var slot = (W - L - R) / Math.max(N, 1), bw = Math.min(46, slot * .62);
    var lider = dados.reduce(function (m, d, i) { return d.valor > dados[m].valor ? i : m; }, 0);
    function forma(cx, v) {
      var top = y(Math.max(0, v)), h = Math.max(0, y(0) - top), r = Math.min(6, bw / 2, h);
      return "M" + (cx - bw / 2) + "," + y(0) + "V" + (top + r) + "Q" + (cx - bw / 2) + "," + top + " " + (cx - bw / 2 + r) + "," + top +
        "H" + (cx + bw / 2 - r) + "Q" + (cx + bw / 2) + "," + top + " " + (cx + bw / 2) + "," + (top + r) + "V" + y(0) + "Z";
    }
    var tip = tooltip(box);
    var lista = dados.map(function (d, i) {
      var cx = L + slot * i + slot / 2, cor = i === lider ? AMBAR : "oklch(34% .04 70)";
      var p = el("path", { d: forma(cx, 0), fill: cor }, svg);
      el("text", { x: cx, y: H - 12, "text-anchor": "middle", class: "ax" }, svg).textContent = d.rotulo.length > 11 ? d.rotulo.slice(0, 10) + "…" : d.rotulo;
      var hit = el("rect", { x: cx - slot / 2, y: T, width: slot, height: H - T - B, class: "hit", tabindex: 0, "aria-label": d.rotulo + ": " + d.dica }, svg);
      function on() { var s = box.clientWidth / W; tip.show(cx * s, y(d.valor) * s, d.rotulo, d.dica); p.setAttribute("fill", i === lider ? AMBAR_CLARO : "oklch(44% .05 70)"); }
      function off() { tip.hide(); p.setAttribute("fill", cor); }
      hit.addEventListener("mouseenter", on); hit.addEventListener("focus", on);
      hit.addEventListener("mouseleave", off); hit.addEventListener("blur", off);
      if (op.aoClicar) hit.addEventListener("click", function () { op.aoClicar(d); });
      return { p: p, cx: cx, v: d.valor };
    });
    // Uma barra depois da outra, passando um pouco do ponto e voltando
    animar(box, op.duracao || 1100, function (k) {
      lista.forEach(function (b, i) {
        var atraso = N > 1 ? i / (N - 1) * 0.4 : 0;
        b.p.setAttribute("d", forma(b.cx, b.v * mola(limitar((k - atraso) / 0.6))));
      });
    });
  }

  /* Rosca: dados = [{rotulo, valor, dica}] */
  function rosca(box, dados, op) {
    op = op || {};
    box.classList.add("svgchart");
    box.innerHTML = "";
    var S = op.tamanho || 200, cx = S / 2, cy = S / 2, ro = S / 2 - 8, ri = ro * .66;
    var wrap = document.createElement("div");
    wrap.style.cssText = "position:relative;width:" + S + "px;margin:0 auto";
    box.appendChild(wrap);
    var svg = el("svg", { viewBox: "0 0 " + S + " " + S, width: S, height: S, role: "img", "aria-label": op.titulo || "Gráfico de rosca", style: "overflow:visible;transform-origin:50% 50%" }, wrap);
    var total = dados.reduce(function (s, d) { return s + d.valor; }, 0) || 1;
    var gap = dados.filter(function (d) { return d.valor > 0; }).length > 1 ? .035 : 0;
    var tip = tooltip(box);
    function pt(r, a) { return (cx + r * Math.cos(a)) + "," + (cy + r * Math.sin(a)); }
    function arco(a0, a1, rExt) {
      if (a1 - a0 >= Math.PI * 2 - 1e-4) a1 = a0 + Math.PI * 2 - 1e-4;
      var big = a1 - a0 > Math.PI ? 1 : 0;
      return "M" + pt(rExt, a0) + "A" + rExt + "," + rExt + " 0 " + big + " 1 " + pt(rExt, a1) + "L" + pt(ri, a1) + "A" + ri + "," + ri + " 0 " + big + " 0 " + pt(ri, a0) + "Z";
    }
    var ang = -Math.PI / 2, fatias = [], animando = true;
    dados.forEach(function (d, i) {
      var tam = d.valor / total * Math.PI * 2;
      if (tam <= 0) return;
      var f = { a0: ang + gap / 2, a1: ang + tam - gap / 2 };
      ang += tam;
      if (f.a1 <= f.a0) return;
      f.p = el("path", { d: "", fill: TONS[i % TONS.length], tabindex: 0, "aria-label": d.rotulo + ": " + d.dica, style: "cursor:pointer;transition:opacity .15s" }, svg);
      var meio = (f.a0 + f.a1) / 2;
      function on() {
        if (animando) return;
        fatias.forEach(function (q) { q.p.style.opacity = q === f ? 1 : .45; q.p.setAttribute("d", arco(q.a0, q.a1, q === f ? ro + 5 : ro)); });
        tip.show(cx + ro * .8 * Math.cos(meio) + (box.clientWidth - S) / 2, cy + ro * .8 * Math.sin(meio), d.rotulo, d.dica);
      }
      function off() { if (animando) return; fatias.forEach(function (q) { q.p.style.opacity = 1; q.p.setAttribute("d", arco(q.a0, q.a1, ro)); }); tip.hide(); }
      f.p.addEventListener("mouseenter", on); f.p.addEventListener("focus", on);
      f.p.addEventListener("mouseleave", off); f.p.addEventListener("blur", off);
      if (op.aoClicar) f.p.addEventListener("click", function () { op.aoClicar(d); });
      fatias.push(f);
    });

    var centro = null;
    if (op.centro) {
      centro = document.createElement("div");
      centro.className = "donut-center";
      centro.innerHTML = "<div><b>" + op.centro[0] + "</b><small>" + op.centro[1] + "</small></div>";
      wrap.appendChild(centro);
    }
    // Varre no sentido horário a partir do topo, girando e crescendo junto
    animar(box, op.duracao || 1200, function (k) {
      var e = saida(k), fim = -Math.PI / 2 + Math.PI * 2 * e;
      svg.style.transform = "scale(" + (0.8 + 0.2 * mola(limitar(k * 1.4))) + ") rotate(" + (-60 * (1 - e)) + "deg)";
      fatias.forEach(function (f) {
        f.p.setAttribute("d", fim <= f.a0 ? "" : arco(f.a0, Math.min(f.a1, fim), ro));
      });
      if (centro) { var c = saida(limitar(k * 2 - 0.7)); centro.style.opacity = c; centro.style.transform = "scale(" + (0.85 + 0.15 * c) + ")"; }
      animando = k < 1;
    });

    var lg = document.createElement("div");
    lg.className = "legend";
    lg.innerHTML = dados.map(function (d, i) { return '<span><i style="background:' + TONS[i % TONS.length] + '"></i>' + d.rotulo + "</span>"; }).join("");
    box.appendChild(lg);
  }

  window.Graficos = { area: area, barras: barras, rosca: rosca, TONS: TONS, cfg: cfg };
})();
