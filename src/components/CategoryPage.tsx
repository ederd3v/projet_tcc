import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";

type Props = { categoria: "licor" | "kombucha" | "ice"; titulo: string; intro: string };

export async function CategoryPage({ categoria, titulo, intro }: Props) {
  // RF01: só produtos ativo=true aparecem na landing.
  const produtos = await prisma.produto.findMany({
    where: { categoria, ativo: true },
    orderBy: { preco: "asc" },
  });

  return (
    <>
      <Header />
      <main className="halo-bg min-h-screen">
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="font-display text-3xl text-maruim-amberLight">{titulo}</h1>
          <p className="mt-2 max-w-2xl text-maruim-cream">{intro}</p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {produtos.map((p) => (
              <ProductCard
                key={p.id}
                nome={p.nome}
                descricao={p.descricao}
                preco={p.preco}
                fotoUrl={p.fotoUrl}
                volumeMl={p.volumeMl}
              />
            ))}
          </div>
          {produtos.length === 0 && (
            <p className="mt-10 text-maruim-muted">Nenhum produto ativo nesta categoria.</p>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
