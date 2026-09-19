import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export const revalidate = 0; // sempre lê do banco — catálogo é editado no CRM (RF07)

export default async function HomePage() {
  // RF01: landing exibe catálogo com produtos ativo=true, direto do banco.
  const destaques = await prisma.produto.findMany({
    where: { ativo: true },
    take: 6,
    orderBy: { criadoEm: "asc" },
  });

  return (
    <>
      <Header />
      <main className="halo-bg">
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center">
          <div className="relative h-64 w-64">
            <Image src="/products/lineup.png" alt="Linha Bebidas Maruim" fill className="object-contain" />
          </div>
          <h1 className="font-display text-4xl text-maruim-amberLight md:text-5xl">
            Bebidas Maruim
          </h1>
          <p className="max-w-xl text-maruim-cream">
            Licores, kombuchas e ice artesanais, feitos em Joinville/SC desde 2014.
            Escolha o sabor e feche o pedido direto no WhatsApp.
          </p>
          <div className="flex gap-4">
            <Link href="/licores" className="rounded-full bg-maruim-amber px-6 py-3 text-maruim-bg">
              Ver catálogo
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <h2 className="mb-6 font-serif text-2xl text-maruim-amberLight">Destaques</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destaques.map((p) => (
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
        </section>
      </main>
      <Footer />
    </>
  );
}
