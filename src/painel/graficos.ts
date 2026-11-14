//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: Os GRÁFICOS do painel: área (vendas por dia), barras (com a
//      líder destacada) e rosca (participação).
//  ⚙️  COMO FUNCIONA: Desenha SVG direto com document.createElementNS, sem
//      biblioteca. Os valores "crescem" quando o gráfico aparece na tela
//      (IntersectionObserver); redimensionar redesenha sem animar.
//  🎓 NA BANCA: Zero dependência externa — nada para atualizar ou quebrar, e o
//      painel continua leve. Respeita quem pede menos movimento.
//  ──────────────────────────────────────────────────────────────────────

/** Um ponto/fatia/barra: rótulo do eixo, valor e o texto da dica (tooltip). */
export type Ponto = { rotulo: string; valor: number; dica: string; dicaRotulo?: string; dia?: string };

type Caixa = HTMLElement & { _anim?: number; _obs?: IntersectionObserver | null };
type Atributos = Record<string, string | number>;

const NS = "http://www.w3.org/2000/svg";
const AMBAR = "oklch(72% .14 70)", AMBAR_CLARO = "oklch(80% .12 75)", COBRE = "oklch(55% .15 40)";
export const TONS = ["oklch(72% .14 70)", "oklch(80% .11 78)", "oklch(60% .15 50)", "oklch(88% .07 85)", "oklch(48% .12 45)", "oklch(66% .06 75)"];
let n = 0;
/** `animar: false` desliga a animação (usado ao redimensionar a janela). */
export const cfg = { animar: true };

const semMovimento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Atributos, pai?: Element): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  if (pai) pai.appendChild(e);
  return e;
}

/** Arredonda o topo do eixo para um número "bonito" (1, 1,5, 2, 2,5…). */
function tetoBonito(v: number): number {
  if (v <= 0) return 100;
  const m = Math.pow(10, Math.floor(Math.log10(v))), f = v / m;
  return (f <= 1 ? 1 : f <= 1.5 ? 1.5 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 3 ? 3 : f <= 4 ? 4 : f <= 5 ? 5 : f <= 6 ? 6 : f <= 8 ? 8 : 10) * m;
}

function tooltip(box: HTMLElement) {
  let t = box.querySelector<HTMLDivElement>(".ctip");
  if (!t) { t = document.createElement("div"); t.className = "ctip"; t.setAttribute("role", "status"); box.appendChild(t); }
  const dica = t;
  return {
    show(x: number, y: number, rotulo: string, valor: string) {
      dica.innerHTML = `<div class="l">${rotulo}</div><div class="v">${valor}</div>`;
      dica.style.left = x + "px"; dica.style.top = y + "px"; dica.style.opacity = "1";
    },
    hide() { dica.style.opacity = "0"; },
  };
}

const limitar = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const saida = (k: number) => 1 - Math.pow(1 - k, 3); // desacelera no fim
const mola = (k: number) => { const c = 1.4; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }; // passa um pouco e volta

/** Roda desenhar(k), com k indo de 0 a 1, quando o gráfico entra na tela. */
function animar(box: Caixa, dur: number, desenhar: (k: number) => void): void {
  if (box._anim) cancelAnimationFrame(box._anim);
  if (box._obs) { box._obs.disconnect(); box._obs = null; }
  if (!cfg.animar || semMovimento()) { desenhar(1); return; }
  desenhar(0);
  const rodar = () => {
    let t0: number | null = null;
    const passo = (t: number) => {
      if (t0 === null) t0 = t;
      const k = limitar((t - t0) / dur);
      desenhar(k);
      if (k < 1) box._anim = requestAnimationFrame(passo);
    };
    box._anim = requestAnimationFrame(passo);
  };
  if (!("IntersectionObserver" in window)) { rodar(); return; }
  box._obs = new IntersectionObserver((entradas) => {
    if (entradas.some((e) => e.isIntersecting)) { box._obs?.disconnect(); box._obs = null; rodar(); }
  }, { threshold: 0.15 });
  box._obs.observe(box);
}

type XY = { x: number; y: number };

/** Curva suave que não passa abaixo de zero (como type="monotone" do recharts). */
function curva(pts: XY[]): string {
  if (pts.length < 2) return "M" + pts.map((p) => p.x + "," + p.y).join("L");
  const dx: number[] = [], m: number[] = [], t: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) { dx[i] = pts[i + 1].x - pts[i].x; m[i] = (pts[i + 1].y - pts[i].y) / dx[i]; }
  t[0] = m[0]; t[pts.length - 1] = m[pts.length - 2];
  for (let i = 1; i < pts.length - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < pts.length - 1; i++) {
    if (m[i] === 0) { t[i] = t[i + 1] = 0; continue; }
    const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
  }
  let d = "M" + pts[0].x + "," + pts[0].y;
  for (let i = 0; i < pts.length - 1; i++) {
    const h = dx[i] / 3;
    d += "C" + (pts[i].x + h) + "," + (pts[i].y + t[i] * h) + " " + (pts[i + 1].x - h) + "," + (pts[i + 1].y - t[i + 1] * h) + " " + pts[i + 1].x + "," + pts[i + 1].y;
  }
  return d;
}

export type OpcoesArea = {
  altura?: number; titulo?: string; duracao?: number; efeito?: "desenho";
  eixo?: (v: number) => string; aoClicar?: ((p: Ponto) => void) | null;
};

/** Gráfico de ÁREA (faturamento por dia). */
export function area(caixa: HTMLElement, dados: Ponto[], op: OpcoesArea = {}): void {
  const box = caixa as Caixa;
  box.classList.add("svgchart");
  box.innerHTML = "";
  const W = Math.max(box.clientWidth, 280), H = op.altura || 240, L = 62, R = 12, T = 12, B = 26;
  const id = "a" + (++n), N = dados.length;
  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, height: H, role: "img", "aria-label": op.titulo || "Gráfico de área" }, box);
  const defs = el("defs", {}, svg);
  const gs = el("linearGradient", { id: id + "s", x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
  el("stop", { offset: "0%", "stop-color": COBRE }, gs); el("stop", { offset: "100%", "stop-color": AMBAR_CLARO }, gs);
  const gf = el("linearGradient", { id: id + "f", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el("stop", { offset: "0%", "stop-color": AMBAR, "stop-opacity": 0.3 }, gf); el("stop", { offset: "100%", "stop-color": AMBAR, "stop-opacity": 0 }, gf);

  const max = tetoBonito(Math.max(1, ...dados.map((d) => d.valor)));
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const passo = N > 1 ? (W - L - R) / (N - 1) : 0;
  const x = (i: number) => (N > 1 ? L + i * passo : (L + W - R) / 2);
  [0, 0.25, 0.5, 0.75, 1].forEach((f) => {
    el("line", { x1: L, x2: W - R, y1: y(max * f), y2: y(max * f), class: "gl" }, svg);
    el("text", { x: L - 10, y: y(max * f) + 4, "text-anchor": "end", class: "ax" }, svg).textContent = op.eixo ? op.eixo(max * f) : String(Math.round(max * f));
  });
  const cada = Math.max(1, Math.ceil(N / Math.floor((W - L - R) / 46)));
  dados.forEach((d, i) => {
    if ((i % cada === 0 && N - 1 - i >= cada) || i === N - 1) el("text", { x: x(i), y: H - 6, "text-anchor": "middle", class: "ax" }, svg).textContent = d.rotulo;
  });

  const raio = N > 40 ? 0 : 3;
  const preench = el("path", { fill: `url(#${id}f)` }, svg);
  const linha = el("path", { fill: "none", stroke: `url(#${id}s)`, "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
  const cursor = el("line", { y1: T, y2: H - B, class: "cursor", opacity: 0 }, svg);
  const dots = dados.map((_, i) => el("circle", { cx: x(i), cy: y(0), r: 0, fill: AMBAR }, svg));
  let emHover = false;

  if (op.efeito === "desenho") {
    // Linha se desenhando da esquerda para a direita; preenchimento logo atrás
    const pts0 = dados.map((d, i) => ({ x: x(i), y: y(d.valor) }));
    if (N) {
      const dl0 = curva(pts0);
      linha.setAttribute("d", dl0);
      linha.setAttribute("pathLength", "1000");
      linha.setAttribute("stroke-dasharray", "1000");
      preench.setAttribute("d", `${dl0}L${pts0[N - 1].x},${y(0)}L${pts0[0].x},${y(0)}Z`);
    }
    animar(box, op.duracao || 2200, (k) => {
      const e = 0.5 - Math.cos(Math.PI * k) / 2; // ritmo constante, sem disparar no começo
      linha.setAttribute("stroke-dashoffset", String(1000 * (1 - e)));
      preench.setAttribute("opacity", String(saida(limitar((k - 0.2) / 0.8))));
      if (emHover) return;
      dots.forEach((c, i) => {
        const chegou = limitar((e - (N > 1 ? i / (N - 1) : 0)) * 8);
        c.setAttribute("cy", String(pts0[i].y));
        c.setAttribute("r", String(raio * chegou));
      });
    });
  } else {
    // Onda da esquerda para a direita: cada ponto sobe um pouco depois do anterior
    animar(box, op.duracao || 1400, (k) => {
      if (!N) return;
      const pts = dados.map((d, i) => {
        const atraso = N > 1 ? (i / (N - 1)) * 0.45 : 0;
        const ki = limitar((k - atraso) / 0.55);
        return { x: x(i), y: y(d.valor * mola(ki)), ki };
      });
      const dl = curva(pts);
      linha.setAttribute("d", dl);
      preench.setAttribute("d", `${dl}L${pts[N - 1].x},${y(0)}L${pts[0].x},${y(0)}Z`);
      preench.setAttribute("opacity", String(saida(limitar(k * 1.5))));
      if (emHover) return;
      dots.forEach((c, i) => {
        c.setAttribute("cy", String(pts[i].y));
        c.setAttribute("r", String(raio * saida(limitar(pts[i].ki * 2.2 - 0.6))));
      });
    });
  }

  const tip = tooltip(box);
  dados.forEach((d, i) => {
    const w = passo || W - L - R;
    const hit = el("rect", { x: x(i) - w / 2, y: T, width: w, height: H - T - B, class: "hit", tabindex: 0, "aria-label": `${d.rotulo}: ${d.dica}` }, svg);
    const on = () => {
      emHover = true;
      dots.forEach((c, j) => { c.setAttribute("cy", String(y(dados[j].valor))); c.setAttribute("r", String(j === i ? 6 : raio)); c.setAttribute("fill", j === i ? AMBAR_CLARO : AMBAR); });
      cursor.setAttribute("x1", String(x(i))); cursor.setAttribute("x2", String(x(i))); cursor.setAttribute("opacity", "1");
      const r = box.clientWidth / W;
      tip.show(x(i) * r, y(d.valor) * r, d.dicaRotulo || d.rotulo, d.dica);
    };
    const off = () => { tip.hide(); cursor.setAttribute("opacity", "0"); dots.forEach((c) => { c.setAttribute("r", String(raio)); c.setAttribute("fill", AMBAR); }); };
    hit.addEventListener("mouseenter", on); hit.addEventListener("focus", on);
    hit.addEventListener("mouseleave", off); hit.addEventListener("blur", off);
    const clicar = op.aoClicar;
    if (clicar) {
      hit.addEventListener("click", () => clicar(d));
      hit.addEventListener("keydown", (e) => { if (e.key === "Enter") clicar(d); });
    } else hit.style.cursor = "default";
  });
}

export type OpcoesBarras = { altura?: number; titulo?: string; duracao?: number; eixo?: (v: number) => string; aoClicar?: (p: Ponto) => void };

/** Gráfico de BARRAS — a maior fica em âmbar. */
export function barras(caixa: HTMLElement, dados: Ponto[], op: OpcoesBarras = {}): void {
  const box = caixa as Caixa;
  box.classList.add("svgchart");
  box.innerHTML = "";
  const W = Math.max(box.clientWidth, 280), H = op.altura || 260, L = 58, R = 8, T = 10, B = 34, N = dados.length;
  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, height: H, role: "img", "aria-label": op.titulo || "Gráfico de barras" }, box);
  const max = tetoBonito(Math.max(1, ...dados.map((d) => d.valor)));
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  [0, 0.5, 1].forEach((f) => {
    el("line", { x1: L, x2: W - R, y1: y(max * f), y2: y(max * f), class: "gl" }, svg);
    el("text", { x: L - 10, y: y(max * f) + 4, "text-anchor": "end", class: "ax" }, svg).textContent = op.eixo ? op.eixo(max * f) : String(Math.round(max * f));
  });
  const slot = (W - L - R) / Math.max(N, 1), bw = Math.min(46, slot * 0.62);
  const lider = dados.reduce((m, d, i) => (d.valor > dados[m].valor ? i : m), 0);
  const forma = (cx: number, v: number) => {
    const top = y(Math.max(0, v)), h = Math.max(0, y(0) - top), r = Math.min(6, bw / 2, h);
    return `M${cx - bw / 2},${y(0)}V${top + r}Q${cx - bw / 2},${top} ${cx - bw / 2 + r},${top}` +
      `H${cx + bw / 2 - r}Q${cx + bw / 2},${top} ${cx + bw / 2},${top + r}V${y(0)}Z`;
  };
  const tip = tooltip(box);
  const lista = dados.map((d, i) => {
    const cx = L + slot * i + slot / 2, cor = i === lider ? AMBAR : "oklch(34% .04 70)";
    const p = el("path", { d: forma(cx, 0), fill: cor }, svg);
    el("text", { x: cx, y: H - 12, "text-anchor": "middle", class: "ax" }, svg).textContent = d.rotulo.length > 11 ? d.rotulo.slice(0, 10) + "…" : d.rotulo;
    const hit = el("rect", { x: cx - slot / 2, y: T, width: slot, height: H - T - B, class: "hit", tabindex: 0, "aria-label": `${d.rotulo}: ${d.dica}` }, svg);
    const on = () => { const s = box.clientWidth / W; tip.show(cx * s, y(d.valor) * s, d.rotulo, d.dica); p.setAttribute("fill", i === lider ? AMBAR_CLARO : "oklch(44% .05 70)"); };
    const off = () => { tip.hide(); p.setAttribute("fill", cor); };
    hit.addEventListener("mouseenter", on); hit.addEventListener("focus", on);
    hit.addEventListener("mouseleave", off); hit.addEventListener("blur", off);
    const clicar = op.aoClicar;
    if (clicar) hit.addEventListener("click", () => clicar(d));
    return { p, cx, v: d.valor };
  });
  // Uma barra depois da outra, passando um pouco do ponto e voltando
  animar(box, op.duracao || 1100, (k) => {
    lista.forEach((b, i) => {
      const atraso = N > 1 ? (i / (N - 1)) * 0.4 : 0;
      b.p.setAttribute("d", forma(b.cx, b.v * mola(limitar((k - atraso) / 0.6))));
    });
  });
}

export type OpcoesRosca = { tamanho?: number; titulo?: string; duracao?: number; centro?: [string | number, string]; aoClicar?: (p: Ponto) => void };

/** Gráfico de ROSCA (participação de cada parte no total). */
export function rosca(caixa: HTMLElement, dados: Ponto[], op: OpcoesRosca = {}): void {
  const box = caixa as Caixa;
  box.classList.add("svgchart");
  box.innerHTML = "";
  const S = op.tamanho || 200, cx = S / 2, cy = S / 2, ro = S / 2 - 8, ri = ro * 0.66;
  const wrap = document.createElement("div");
  wrap.style.cssText = `position:relative;width:${S}px;margin:0 auto`;
  box.appendChild(wrap);
  const svg = el("svg", { viewBox: `0 0 ${S} ${S}`, width: S, height: S, role: "img", "aria-label": op.titulo || "Gráfico de rosca", style: "overflow:visible;transform-origin:50% 50%" }, wrap);
  const total = dados.reduce((s, d) => s + d.valor, 0) || 1;
  const gap = dados.filter((d) => d.valor > 0).length > 1 ? 0.035 : 0;
  const tip = tooltip(box);
  const pt = (r: number, a: number) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  const arco = (a0: number, a1Orig: number, rExt: number) => {
    const a1 = a1Orig - a0 >= Math.PI * 2 - 1e-4 ? a0 + Math.PI * 2 - 1e-4 : a1Orig;
    const big = a1 - a0 > Math.PI ? 1 : 0;
    return `M${pt(rExt, a0)}A${rExt},${rExt} 0 ${big} 1 ${pt(rExt, a1)}L${pt(ri, a1)}A${ri},${ri} 0 ${big} 0 ${pt(ri, a0)}Z`;
  };
  type Fatia = { a0: number; a1: number; p: SVGPathElement };
  let ang = -Math.PI / 2, animando = true;
  const fatias: Fatia[] = [];
  dados.forEach((d, i) => {
    const tam = (d.valor / total) * Math.PI * 2;
    if (tam <= 0) return;
    const a0 = ang + gap / 2, a1 = ang + tam - gap / 2;
    ang += tam;
    if (a1 <= a0) return;
    const f: Fatia = { a0, a1, p: el("path", { d: "", fill: TONS[i % TONS.length], tabindex: 0, "aria-label": `${d.rotulo}: ${d.dica}`, style: "cursor:pointer;transition:opacity .15s" }, svg) };
    const meio = (f.a0 + f.a1) / 2;
    const on = () => {
      if (animando) return;
      fatias.forEach((q) => { q.p.style.opacity = q === f ? "1" : ".45"; q.p.setAttribute("d", arco(q.a0, q.a1, q === f ? ro + 5 : ro)); });
      tip.show(cx + ro * 0.8 * Math.cos(meio) + (box.clientWidth - S) / 2, cy + ro * 0.8 * Math.sin(meio), d.rotulo, d.dica);
    };
    const off = () => { if (animando) return; fatias.forEach((q) => { q.p.style.opacity = "1"; q.p.setAttribute("d", arco(q.a0, q.a1, ro)); }); tip.hide(); };
    f.p.addEventListener("mouseenter", on); f.p.addEventListener("focus", on);
    f.p.addEventListener("mouseleave", off); f.p.addEventListener("blur", off);
    const clicar = op.aoClicar;
    if (clicar) f.p.addEventListener("click", () => clicar(d));
    fatias.push(f);
  });

  let centro: HTMLDivElement | null = null;
  if (op.centro) {
    centro = document.createElement("div");
    centro.className = "donut-center";
    centro.innerHTML = `<div><b>${op.centro[0]}</b><small>${op.centro[1]}</small></div>`;
    wrap.appendChild(centro);
  }
  // Varre no sentido horário a partir do topo, girando e crescendo junto
  animar(box, op.duracao || 1200, (k) => {
    const e = saida(k), fim = -Math.PI / 2 + Math.PI * 2 * e;
    svg.style.transform = `scale(${0.8 + 0.2 * mola(limitar(k * 1.4))}) rotate(${-60 * (1 - e)}deg)`;
    fatias.forEach((f) => { f.p.setAttribute("d", fim <= f.a0 ? "" : arco(f.a0, Math.min(f.a1, fim), ro)); });
    if (centro) { const c = saida(limitar(k * 2 - 0.7)); centro.style.opacity = String(c); centro.style.transform = `scale(${0.85 + 0.15 * c})`; }
    animando = k < 1;
  });

  const lg = document.createElement("div");
  lg.className = "legend";
  lg.innerHTML = dados.map((d, i) => `<span><i style="background:${TONS[i % TONS.length]}"></i>${d.rotulo}</span>`).join("");
  box.appendChild(lg);
}
