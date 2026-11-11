"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

// Faixa de fechamento da home, logo acima do rodapé: as 3 kombuchas e os 3 ices
// lado a lado, ocupando a largura toda. Ao rolar até ela, a foto entra com um
// zoom suave (1.15 → 1) e um leve parallax, e as bordas se fundem com a página.
// Quem prefere menos movimento (prefers-reduced-motion) vê a foto parada.
export function FaixaRodape() {
  const secao = useRef<HTMLElement>(null);
  const foto = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = secao.current;
    const img = foto.current;
    if (!el || !img) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const atualizar = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 quando o topo da faixa encosta no pé da tela; 1 quando ela está centralizada
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.5 + r.height * 0.5)));
      const escala = 1.15 - 0.15 * p;
      const desloca = (1 - p) * 40;
      img.style.transform = `translate3d(0, ${desloca}px, 0) scale(${escala})`;
      img.style.opacity = String(0.35 + 0.65 * p);
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
    <section ref={secao} aria-label="Kombuchas e Ice Maruim" className="relative w-full overflow-hidden bg-black">
      <div className="relative aspect-[16/9] max-h-screen w-full">
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
        {/* Fusão com a página em cima, embaixo e nas laterais */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-maruim-bg to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-maruim-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[8%] bg-gradient-to-r from-maruim-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[8%] bg-gradient-to-l from-maruim-bg to-transparent" />
      </div>
    </section>
  );
}
