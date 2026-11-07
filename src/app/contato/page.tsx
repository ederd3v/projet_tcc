import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { whatsappLinkGeneric, WHATSAPP_DISPLAY } from "@/lib/whatsapp";

export default function ContatoPage() {
  return (
    <>
      <Header />
      <main className="halo-bg min-h-screen">
        <section className="mx-auto max-w-3xl px-4 py-16 text-maruim-cream">
          <h1 className="font-display text-3xl text-maruim-amberLight">Contato</h1>
          <p className="mt-6">
            Joinville/SC · Seg a Sáb, 9h às 19h
          </p>
          <a
            href={whatsappLinkGeneric()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full bg-maruim-amber px-6 py-3 text-maruim-bg"
          >
            Falar no WhatsApp: {WHATSAPP_DISPLAY}
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
