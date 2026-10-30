import { SecaoTitulo } from "./SecaoTitulo";
import { whatsappLinkGeneric, WHATSAPP_DISPLAY } from "@/lib/whatsapp";

const INFORMACOES = [
  { rotulo: "Cidade", valor: "Joinville, SC" },
  { rotulo: "WhatsApp", valor: WHATSAPP_DISPLAY },
  { rotulo: "Entrega", valor: "Consulte disponibilidade" },
];

// Fecho da home. O botão é verde-WhatsApp de propósito — é o único ponto da
// página onde a cor foge da paleta da marca, porque aqui o reconhecimento do
// canal vale mais que a consistência cromática (mesma decisão do site publicado).
export function SecaoContato() {
  return (
    <section className="relative overflow-hidden border-t border-maruim-line px-6 py-24 text-center md:px-12">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[180px] leading-none text-maruim-cream/[0.02]"
      >
        MARUIM
      </span>

      <div className="relative">
        <SecaoTitulo
          eyebrow="Entre em Contato"
          titulo="Faça seu"
          destaque="Pedido"
          apoio="Atendemos pelo WhatsApp. É fácil, rápido e direto."
          centralizado
        />

        <a
          href={whatsappLinkGeneric()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 rounded-sm bg-[#25D366] px-7 py-4 text-[13px] font-medium uppercase tracking-[0.1em] text-[#0b1f14] transition-opacity hover:opacity-90"
        >
          📱 {WHATSAPP_DISPLAY}
        </a>

        <div className="mt-14 flex flex-wrap justify-center gap-12">
          {INFORMACOES.map((info) => (
            <div key={info.rotulo}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-maruim-muted">{info.rotulo}</p>
              <p className="mt-2 font-display text-lg text-maruim-cream">{info.valor}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
