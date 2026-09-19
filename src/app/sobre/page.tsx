import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function SobrePage() {
  return (
    <>
      <Header />
      <main className="halo-bg min-h-screen">
        <section className="mx-auto max-w-3xl px-4 py-16 text-maruim-cream">
          <h1 className="font-display text-3xl text-maruim-amberLight">Sobre a Maruim</h1>
          <p className="mt-6 leading-relaxed">
            A Bebidas Maruim é uma produtora artesanal de licores, kombuchas e bebidas
            geladas em Joinville, Santa Catarina, ativa desde 2014. Cada receita é feita
            em pequenos lotes, com foco em sabor e ingredientes de qualidade.
          </p>
          <p className="mt-4 leading-relaxed">
            Hoje os pedidos são fechados diretamente pelo WhatsApp — sem carrinho ou
            checkout online. É a mesma proposta descrita no RFC do projeto: uma vitrine
            digital que direciona pra conversa, não um e-commerce completo.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
