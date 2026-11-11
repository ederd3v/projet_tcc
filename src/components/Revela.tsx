"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Faz o conteúdo surgir (sobe + fade) quando entra na tela, uma vez só.
// `atraso` em ms escalona os cards de uma mesma fileira. Quem pediu menos
// movimento (prefers-reduced-motion) vê tudo direto.
export function Revela({ children, atraso = 0, className = "" }: { children: ReactNode; atraso?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setVisivel(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisivel(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visivel ? `${atraso}ms` : "0ms" }}
      className={`transition-all duration-700 ease-out ${visivel ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}
