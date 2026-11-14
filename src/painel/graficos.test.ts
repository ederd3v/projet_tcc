// @vitest-environment jsdom
// Testes dos gráficos SVG do painel (desenhados sem animação).
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { area, barras, cfg, rosca, type Ponto } from "./graficos";

beforeAll(() => {
  // jsdom não tem matchMedia; o painel consulta "prefers-reduced-motion".
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
  cfg.animar = false; // desenha o estado final direto
});
let caixa: HTMLDivElement;
beforeEach(() => { document.body.innerHTML = '<div id="c" style="width:600px"></div>'; caixa = document.getElementById("c") as HTMLDivElement; });

const dados: Ponto[] = [
  { rotulo: "seg", valor: 100, dica: "R$ 100" },
  { rotulo: "ter", valor: 300, dica: "R$ 300" },
  { rotulo: "qua", valor: 0, dica: "R$ 0" },
];

describe("área", () => {
  it("desenha um ponto por dia e uma área clicável por dia", () => {
    area(caixa, dados, { titulo: "Faturamento" });
    expect(caixa.querySelector("svg")?.getAttribute("aria-label")).toBe("Faturamento");
    expect(caixa.querySelectorAll("circle")).toHaveLength(3);
    expect(caixa.querySelectorAll("rect.hit")).toHaveLength(3);
  });
  it("clicar num dia chama aoClicar com aquele dia", () => {
    let clicado = "";
    area(caixa, dados, { aoClicar: (p) => { clicado = p.rotulo; } });
    (caixa.querySelectorAll("rect.hit")[1] as SVGRectElement).dispatchEvent(new Event("click"));
    expect(clicado).toBe("ter");
  });
  it("sem dados não quebra", () => {
    expect(() => area(caixa, [])).not.toThrow();
  });
});

describe("barras", () => {
  it("destaca a maior barra em âmbar", () => {
    barras(caixa, dados);
    const cores = Array.from(caixa.querySelectorAll("path")).map((p) => p.getAttribute("fill"));
    expect(cores[1]).toContain("72%"); // a de 300 é a líder
    expect(cores[0]).not.toContain("72%");
  });
  it("encurta rótulo longo com reticências", () => {
    barras(caixa, [{ rotulo: "Kombucha Maracujá e Cardamomo", valor: 1, dica: "" }]);
    expect(Array.from(caixa.querySelectorAll("text")).some((t) => t.textContent?.endsWith("…"))).toBe(true);
  });
});

describe("rosca", () => {
  it("uma fatia por valor maior que zero e legenda com todos", () => {
    rosca(caixa, dados, { centro: ["400", "total"] });
    expect(caixa.querySelectorAll("path")).toHaveLength(2); // "qua" vale 0
    expect(caixa.querySelectorAll(".legend span")).toHaveLength(3);
    expect(caixa.querySelector(".donut-center b")?.textContent).toBe("400");
  });
  it("tudo zero não quebra", () => {
    expect(() => rosca(caixa, dados.map((d) => ({ ...d, valor: 0 })))).not.toThrow();
  });
});
