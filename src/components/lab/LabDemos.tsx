"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { fotoLeve } from "@/components/FotoComNotas";
import { notasDaFoto } from "@/lib/notas";
import { SeloMaruim } from "@/components/SeloMaruim";
import { IconeWhatsApp } from "@/components/IconeWhatsApp";

type Produto = {
  id: string;
  nome: string;
  preco: number;
  fotoUrl: string;
  categoria: string;
  volumeMl: number;
  descricao: string;
};

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Ruído de filme em SVG (feTurbulence), usado na ideia 5.
const GRAO =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.2 -0.1'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

function Bloco({
  n,
  titulo,
  texto,
  ligado,
  alternar,
  children,
}: {
  n: number;
  titulo: string;
  texto: string;
  ligado: boolean;
  alternar: () => void;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-maruim-line py-16">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-serif text-4xl font-bold text-maruim-amber">{String(n).padStart(2, "0")}</p>
          <h2 className="mt-2 font-display text-2xl text-maruim-cream md:text-3xl">{titulo}</h2>
          <p className="mt-2 max-w-xl text-sm leading-[1.8] text-maruim-muted">{texto}</p>
        </div>
        <button
          type="button"
          onClick={alternar}
          className={`shrink-0 rounded-full border px-5 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors ${
            ligado
              ? "border-maruim-amber bg-maruim-amber text-maruim-onAmber"
              : "border-maruim-line text-maruim-muted hover:border-maruim-amber/50"
          }`}
        >
          {ligado ? "Efeito ligado" : "Efeito desligado (como é hoje)"}
        </button>
      </div>
      {children}
    </section>
  );
}

/* 1 — menu que encolhe ao rolar */
function MenuEncolhe({ ligado, produtos }: { ligado: boolean; produtos: Produto[] }) {
  const [rolou, setRolou] = useState(false);
  const compacto = ligado && rolou;
  return (
    <div
      onScroll={(e) => setRolou((e.target as HTMLDivElement).scrollTop > 30)}
      className="relative h-[440px] overflow-y-auto overflow-x-hidden border border-maruim-line bg-maruim-bg"
    >
      <div
        className={`sticky top-0 z-10 flex items-center justify-between px-6 transition-all duration-300 ${
          compacto ? "bg-maruim-bg/90 py-2 shadow-lg shadow-black/20 backdrop-blur-md" : "bg-gradient-to-b from-maruim-bg/90 to-transparent py-5"
        }`}
      >
        <div className="flex items-center gap-3">
          <SeloMaruim className={`text-maruim-cream transition-all duration-300 ${compacto ? "h-8 w-8" : "h-12 w-12"}`} />
          <span className={`font-display text-maruim-cream transition-all duration-300 ${compacto ? "text-base" : "text-xl"}`}>Maruim</span>
        </div>
        <span className="rounded-sm bg-maruim-amber px-4 py-2 text-[11px] uppercase tracking-[0.1em] text-maruim-onAmber">Pedir</span>
      </div>
      <p className="px-6 pt-2 text-xs text-maruim-muted">↓ Role dentro deste quadro</p>
      <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
        {produtos.slice(0, 12).map((p) => (
          <div key={p.id} className="relative aspect-[4/5] overflow-hidden bg-black">
            <Image src={fotoLeve(p.fotoUrl)} alt={p.nome} fill sizes="250px" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* 2 — cards surgindo ao rolar */
function Revelar({ ligado, produtos }: { ligado: boolean; produtos: Produto[] }) {
  const [rodada, setRodada] = useState(0);
  return (
    <div>
      <button type="button" onClick={() => setRodada((r) => r + 1)} className="mb-4 text-[11px] uppercase tracking-[0.16em] text-maruim-amber hover:underline">
        ↻ Repetir animação
      </button>
      <div key={rodada} className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-7">
        {produtos.slice(0, 4).map((p, i) => (
          <CardRevela key={p.id} p={p} i={i} ligado={ligado} />
        ))}
      </div>
    </div>
  );
}
function CardRevela({ p, i, ligado }: { p: Produto; i: number; ligado: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisto(true), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const mostrar = !ligado || visto;
  return (
    <div
      ref={ref}
      style={{ transitionDelay: ligado ? `${i * 130}ms` : "0ms" }}
      className={`transition-all duration-700 ease-out ${mostrar ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden border border-maruim-line bg-black">
        <Image src={fotoLeve(p.fotoUrl)} alt={p.nome} fill sizes="300px" className="object-cover" />
      </div>
      <div className="mt-3 flex justify-between gap-2">
        <p className="font-display text-lg text-maruim-cream">{p.nome.replace(/^(Licor|Kombucha|Ice)\s+(de\s+)?/i, "")}</p>
        <p className="font-display text-maruim-amber">{brl(p.preco)}</p>
      </div>
    </div>
  );
}

/* 3 — botão flutuante do WhatsApp */
function WhatsFlutuante({ ligado }: { ligado: boolean }) {
  return (
    <div className="relative h-[380px] overflow-hidden border border-maruim-line bg-black">
      <Image src="/products/faixa-rodape.jpg" alt="" fill sizes="1100px" className="object-cover opacity-70" />
      <div
        className={`absolute bottom-6 right-6 flex items-center gap-3 transition-all duration-500 ${
          ligado ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        <span className="rounded-full bg-white px-4 py-2 text-sm text-neutral-900 shadow-lg">Peça pelo WhatsApp</span>
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-[#0b1f14] shadow-xl">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-40" />
          <IconeWhatsApp className="relative h-7 w-7" />
        </span>
      </div>
      <p className="absolute left-6 top-6 max-w-xs text-sm text-white/80">
        No site ele aparece depois que a pessoa passa da capa e fica sempre no canto, em todas as páginas.
      </p>
    </div>
  );
}

/* 4 — capa acompanhando o mouse */
function Parallax({ ligado }: { ligado: boolean }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const mover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ligado) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  };
  const t = ligado
    ? `perspective(1000px) rotateY(${pos.x * 7}deg) rotateX(${-pos.y * 7}deg) scale(1.06) translate(${pos.x * -14}px, ${pos.y * -10}px)`
    : "none";
  return (
    <div
      onMouseMove={mover}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      className="relative mx-auto aspect-[3/4] max-h-[620px] overflow-hidden border border-maruim-line bg-black"
    >
      <div className="absolute inset-0 transition-transform duration-300 ease-out" style={{ transform: t }}>
        <Image src="/products/lineup.jpg" alt="Cinco licores Maruim" fill sizes="500px" quality={90} className="object-cover" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: ligado ? 1 : 0,
          background: `radial-gradient(circle at ${50 + pos.x * 60}% ${40 + pos.y * 60}%, rgba(255,200,120,0.18), transparent 45%)`,
        }}
      />
      <p className="absolute bottom-4 left-4 text-xs text-white/70">Passe o mouse por cima da foto</p>
    </div>
  );
}

/* 5 — granulação de filme */
function Granulacao({ ligado, produtos }: { ligado: boolean; produtos: Produto[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {produtos.slice(4, 8).map((p) => (
        <div key={p.id} className="relative aspect-[4/5] overflow-hidden border border-maruim-line bg-black">
          <Image src={fotoLeve(p.fotoUrl)} alt={p.nome} fill sizes="300px" className="object-cover" />
          <div
            className="pointer-events-none absolute inset-0 mix-blend-overlay transition-opacity duration-500"
            style={{ backgroundImage: GRAO, opacity: ligado ? 0.55 : 0 }}
          />
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-500"
            style={{ boxShadow: "inset 0 0 80px rgba(0,0,0,0.55)", opacity: ligado ? 1 : 0 }}
          />
        </div>
      ))}
    </div>
  );
}

/* 6 — selo "Mais pedido" vindo do CRM */
function MaisPedido({ ligado, top: topReal, qtd, reserva }: { ligado: boolean; top: Produto | null; qtd: number; reserva: Produto }) {
  // Sem pedidos no banco local, mostra uma simulação com um produto qualquer.
  const simulado = !topReal;
  const top = topReal ?? reserva;
  return (
    <div className="grid items-center gap-8 md:grid-cols-[320px_1fr]">
      <div>
        <div className="relative aspect-[4/5] overflow-hidden border border-maruim-line bg-black">
          <Image src={fotoLeve(top.fotoUrl)} alt={top.nome} fill sizes="320px" className="object-cover" />
          <span
            className={`absolute left-3 top-3 flex items-center gap-1.5 bg-maruim-amber px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-maruim-onAmber shadow transition-all duration-500 ${
              ligado ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
          >
            ★ Mais pedido
          </span>
        </div>
        <div className="mt-3 flex justify-between">
          <p className="font-display text-lg text-maruim-cream">{top.nome}</p>
          <p className="font-display text-maruim-amber">{brl(top.preco)}</p>
        </div>
      </div>
      <div className="text-sm leading-[1.9] text-maruim-muted">
        {simulado ? (
          <p>
            <strong className="text-maruim-cream">Simulação:</strong> o banco local está sem pedidos agora. No site no
            ar, o selo vai para o produto com mais unidades nos pedidos do CRM.
          </p>
        ) : (
          <p>
            Dado real do banco agora: <strong className="text-maruim-cream">{top.nome}</strong> soma{" "}
            <strong className="text-maruim-cream">{qtd} unidades</strong> em pedidos.
          </p>
        )}
        <p className="mt-3">
          O selo muda sozinho conforme os pedidos do CRM. Na banca, mostra que o painel alimenta o site, e não só o
          contrário.
        </p>
      </div>
    </div>
  );
}

/* 7 — página própria de cada produto */
function PaginaProduto({ produtos }: { produtos: Produto[] }) {
  const p = produtos.find((x) => x.fotoUrl.includes("licor-canela")) ?? produtos[0];
  const [qtd, setQtd] = useState(1);
  const notas = notasDaFoto(p.fotoUrl);
  const irmaos = produtos.filter((x) => x.categoria === p.categoria && x.id !== p.id).slice(0, 4);
  return (
    <div className="border border-maruim-line p-6 md:p-10">
      <p className="mb-6 text-[11px] uppercase tracking-[0.16em] text-maruim-muted">bebidasmaruim / licores / {p.nome.toLowerCase()}</p>
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden bg-black">
          <Image src={fotoLeve(p.fotoUrl)} alt={p.nome} fill sizes="560px" quality={90} className="object-cover" />
        </div>
        <div className="flex flex-col">
          <p className="text-[10px] uppercase tracking-[0.25em] text-maruim-amber">Licor fino · {p.volumeMl}ml</p>
          <h3 className="mt-3 font-display text-4xl text-maruim-cream">{p.nome}</h3>
          <p className="mt-4 font-display text-2xl text-maruim-amber">{brl(p.preco)}</p>
          <p className="mt-4 text-sm leading-[1.8] text-maruim-muted">{p.descricao}</p>
          {notas && (
            <dl className="mt-6 space-y-3 border-y border-maruim-line py-5">
              {[
                ["Sabor", notas.sabor],
                ["Combina com", notas.combina],
                ["Sirva", notas.servir],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-maruim-muted">{k}</dt>
                  <dd className="font-serif text-maruim-cream">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-maruim-line">
              <button type="button" onClick={() => setQtd((q) => Math.max(1, q - 1))} className="px-4 py-2 text-maruim-cream">−</button>
              <span className="w-8 text-center text-maruim-cream">{qtd}</span>
              <button type="button" onClick={() => setQtd((q) => q + 1)} className="px-4 py-2 text-maruim-cream">+</button>
            </div>
            <span className="text-sm text-maruim-muted">Total {brl(p.preco * qtd)}</span>
          </div>
          <span className="mt-5 inline-flex items-center justify-center gap-2 rounded-sm bg-[#25D366] px-6 py-3.5 text-[13px] font-medium uppercase tracking-[0.1em] text-[#0b1f14]">
            <IconeWhatsApp className="h-4 w-4" /> Pedir no WhatsApp (demo)
          </span>
        </div>
      </div>
      {irmaos.length > 0 && (
        <>
          <p className="mt-12 text-[10px] uppercase tracking-[0.25em] text-maruim-amber">Da mesma linha</p>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {irmaos.map((x) => (
              <div key={x.id}>
                <div className="relative aspect-[4/5] overflow-hidden bg-black">
                  <Image src={fotoLeve(x.fotoUrl)} alt={x.nome} fill sizes="250px" className="object-cover" />
                </div>
                <p className="mt-2 font-display text-maruim-cream">{x.nome}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function LabDemos({ produtos, topId, topQtd }: { produtos: Produto[]; topId: string | null; topQtd: number }) {
  const [on, setOn] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true });
  const alt = (n: number) => () => setOn((s) => ({ ...s, [n]: !s[n] }));
  const top = produtos.find((p) => p.id === topId) ?? null;

  return (
    <div className="mt-12">
      <Bloco n={1} titulo="Menu que encolhe ao rolar" texto="Ao descer a página, o topo fica mais fino, com fundo sólido e desfocado. Passa acabamento e não atrapalha a leitura." ligado={on[1]} alternar={alt(1)}>
        <MenuEncolhe ligado={on[1]} produtos={produtos} />
      </Bloco>
      <Bloco n={2} titulo="Cards surgindo ao rolar" texto="Os produtos entram um de cada vez, subindo com um fade, quando chegam na tela." ligado={on[2]} alternar={alt(2)}>
        <Revelar ligado={on[2]} produtos={produtos} />
      </Bloco>
      <Bloco n={3} titulo="Botão flutuante do WhatsApp" texto="Sempre à mão no canto da tela, como na loja de perfumes. É o atalho de pedido em qualquer página." ligado={on[3]} alternar={alt(3)}>
        <WhatsFlutuante ligado={on[3]} />
      </Bloco>
      <Bloco n={4} titulo="Capa acompanhando o mouse" texto="A foto da capa inclina levemente e a luz segue o cursor, dando profundidade. No celular fica parada." ligado={on[4]} alternar={alt(4)}>
        <Parallax ligado={on[4]} />
      </Bloco>
      <Bloco n={5} titulo="Granulação de filme nas fotos" texto="Um grão fino e uma vinheta por cima das fotos: tira o brilho “perfeito demais” e reduz a cara de IA." ligado={on[5]} alternar={alt(5)}>
        <Granulacao ligado={on[5]} produtos={produtos} />
      </Bloco>
      <Bloco n={6} titulo="Selo “Mais pedido” vindo do CRM" texto="O produto com mais pedidos no painel ganha o selo automaticamente." ligado={on[6]} alternar={alt(6)}>
        <MaisPedido ligado={on[6]} top={top} qtd={topQtd} reserva={produtos.find((p) => p.fotoUrl.includes("jabuticaba")) ?? produtos[0]} />
      </Bloco>
      <Bloco n={7} titulo="Página de cada produto" texto="Foto grande, notas, quantidade com total e o botão de pedido, como a página de perfume da loja. (Aqui o botão é só ilustrativo.)" ligado={on[7]} alternar={alt(7)}>
        {on[7] ? <PaginaProduto produtos={produtos} /> : <p className="text-sm text-maruim-muted">Hoje não existe página por produto: o pedido é feito direto no card do cardápio.</p>}
      </Bloco>
    </div>
  );
}
