import { whatsappLinkGeneric } from "@/lib/whatsapp";

const WHATSAPP_DISPLAY = "(47) 9 9240-1430";
// Pendência aberta no HANDOFF (item 5): não temos o @ real do perfil da
// Maruim ainda. Deixe NEXT_PUBLIC_INSTAGRAM_URL vazio até confirmar com o
// Jaisson — o link só aparece quando essa env var for preenchida, pra não
// repetir o bug do site publicado (`instagram.com` puro, sem destino real).
const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL;

export function Footer() {
  return (
    <footer className="border-t border-maruim-amber/20 bg-maruim-bgAlt px-4 py-10 text-sm text-maruim-muted">
      <div className="mx-auto max-w-6xl space-y-2">
        <p className="font-display text-maruim-amberLight">Bebidas Maruim</p>
        <p>Joinville/SC · desde 2014 · Seg a Sáb, 9h às 19h</p>
        <p>
          {/* target=_blank corrige o bug do HANDOFF: telefone do rodapé abria na
              mesma aba e tirava o visitante do site. */}
          <a
            href={whatsappLinkGeneric()}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-maruim-amberLight"
          >
            WhatsApp: {WHATSAPP_DISPLAY}
          </a>
        </p>
        {INSTAGRAM_URL && (
          <p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-maruim-amberLight"
            >
              Instagram
            </a>
          </p>
        )}
      </div>
    </footer>
  );
}
