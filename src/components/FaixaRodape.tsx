//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: Faixa final da home: quadro que CRESCE até a tela cheia ao rolar.
//  ⚙️  COMO FUNCIONA: Mede o quanto a seção já rolou e usa isso para aumentar o quadro; no fim, botões para Kombuchas e Ice.
//  🎓 NA BANCA: Respeita quem pede menos movimento (acessibilidade).
//  ──────────────────────────────────────────────────────────────────────
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

// Fecho da home, logo acima do rodapé: as 3 kombuchas e os 3 ices.
// A seção é mais alta que a tela e o quadro fica "preso" (sticky) enquanto se
// rola: ele começa como um cartão menor com cantos arredondados e cresce até
// ocupar a tela inteira; no fim entram o título e os botões das duas linhas.
// Quem prefere menos movimento (prefers-reduced-motion) vê o quadro já aberto.
export function FaixaRodape() {
  const secao = useRef<HTMLElement>(null);
  const quadro = useRef<HTMLDivElement>(null);
  const foto = useRef<HTMLDivElement>(null);
  const texto = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = secao.current;
    const q = quadro.current;
    const f = foto.current;
    const t = texto.current;
    if (!el || !q || !f || !t) return;
    const parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
    const atualizar = () => {
      raf = 0;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const r = el.getBoundingClientRect();
      // 0 quando a seção chega no topo da tela; 1 quando o quadro terminou de crescer
      const bruto = parado ? 1 : Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)));
      const p = 1 - Math.pow(1 - bruto, 2); // desacelera no fim
      const celular = vw < 768;
      const alturaFinal = celular ? Math.min(vh, vw * 1.1) : vh;
      q.style.width = `${lerp(celular ? 82 : 58, 100, p)}vw`;
      q.style.height = `${lerp(celular ? vw * 0.62 : vh * 0.56, alturaFinal, p)}px`;
      q.style.borderRadius = `${lerp(24, 0, p)}px`;
      f.style.transform = `scale(${lerp(1.18, 1, p)})`;
      const pt = Math.min(1, Math.max(0, (bruto - 0.7) / 0.3)); // texto só no último terço
      t.style.opacity = String(pt);
      t.style.transform = `translate3d(0, ${lerp(24, 0, pt)}px, 0)`;
      t.style.pointerEvents = pt > 0.6 ? "auto" : "none";
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(atualizar);
    };

    atualizar();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={secao} aria-label="Kombuchas e Ice Maruim" className="relative h-[170vh] md:h-[230vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div ref={quadro} className="relative overflow-hidden bg-black will-change-[width,height]" style={{ width: "58vw", height: "56vh", borderRadius: 24 }}>
          <div ref={foto} className="absolute inset-0 will-change-transform">
            <Image
              src="/products/faixa-rodape.jpg"
              alt="Três kombuchas e três Maruim Ice lado a lado"
              fill
              sizes="100vw"
              quality={90}
              className="object-cover"
            />
          </div>
          {/* degradê de baixo para o texto ler bem sobre a foto */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 to-transparent" />

          <div ref={texto} className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-10 text-center opacity-0 md:pb-16">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[oklch(80%_0.12_75)]">Kombuchas vivas · Maruim Ice</p>
            <p className="mt-3 font-display text-3xl text-[oklch(95%_0.02_85)] md:text-5xl">Gelada, do jeito certo.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/kombuchas" className="rounded-sm bg-[oklch(72%_0.14_70)] px-5 py-3 text-[12px] font-medium uppercase tracking-[0.1em] text-[oklch(15%_0.015_70)] transition hover:brightness-110">
                Ver kombuchas
              </Link>
              <Link href="/ice" className="rounded-sm border border-white/40 px-5 py-3 text-[12px] uppercase tracking-[0.1em] text-white transition hover:border-white">
                Ver Maruim Ice
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
