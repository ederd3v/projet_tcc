//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: /lab: vitrine de ideias de design (só no computador).
//  ⚙️  COMO FUNCIONA: Mostra efeitos com liga/desliga para escolher o que entra no site. Em produção responde 404.
//  🎓 NA BANCA: Ferramenta interna de decisão de design; não faz parte do site público.
//  ──────────────────────────────────────────────────────────────────────
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { LabDemos } from "@/components/lab/LabDemos";

export const metadata: Metadata = { title: "Lab de design — Bebidas Maruim", robots: { index: false } };
export const revalidate = 0;

// Vitrine de ideias de design para o Eder escolher o que entra no site.
// Só existe em desenvolvimento: em produção (Amplify) a rota responde 404.
export default async function LabPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const [produtos, vendidos] = await Promise.all([
    prisma.produto.findMany({ where: { ativo: true }, orderBy: [{ categoria: "asc" }, { preco: "asc" }] }),
    // Ideia 6 usa dado real do CRM: o produto com mais unidades em pedidos.
    prisma.itemPedido.groupBy({ by: ["produtoId"], _sum: { quantidade: true }, orderBy: { _sum: { quantidade: "desc" } }, take: 1 }),
  ]);
  const topId = vendidos[0]?.produtoId ?? null;
  const topQtd = vendidos[0]?._sum.quantidade ?? 0;

  const simples = produtos.map((p) => ({
    id: p.id,
    nome: p.nome,
    preco: p.preco,
    fotoUrl: p.fotoUrl,
    categoria: p.categoria,
    volumeMl: p.volumeMl,
    descricao: p.descricao,
  }));

  return (
    <>
      <Header />
      <main className="px-6 pb-32 pt-32 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.25em] text-maruim-amber">Lab de design · só no localhost</p>
          <h1 className="mt-4 font-display text-4xl text-maruim-cream md:text-5xl">7 ideias para escolher</h1>
          <p className="mt-4 max-w-2xl text-sm leading-[1.9] text-maruim-muted">
            Cada bloco mostra a ideia funcionando, com as fotos reais do site. Use o botão de cada um para ligar e
            desligar e comparar com o que existe hoje. Depois é só dizer os números que entram.
          </p>
          <LabDemos produtos={simples} topId={topId} topQtd={topQtd} />
        </div>
      </main>
    </>
  );
}
