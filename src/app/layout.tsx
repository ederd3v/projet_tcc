import type { Metadata } from "next";
import { Special_Elite, Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

// next/font baixa e autohospeda os arquivos no build — resolve de raiz o bug
// registrado no HANDOFF (fontes apontando pro fonts.gstatic.com deram 404
// porque a URL compilada pela Lovable expirou). Aqui não existe URL externa
// pra expirar.
const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-special-elite",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bebidas Maruim — Licores, Kombuchas e Ice artesanais",
  description:
    "Licores, kombuchas e ice artesanais da Bebidas Maruim, Joinville/SC. Peça pelo WhatsApp.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: o script abaixo pode pôr data-theme no <html>
    // antes do React hidratar (tema salvo pelo visitante, ou ?tema=claro|escuro
    // na URL, útil para mandar o link já no modo claro).
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var q=new URLSearchParams(location.search).get('tema'),t=q==='claro'?'light':q==='escuro'?'dark':null;if(t){localStorage.setItem('maruim-tema',t)}else{t=localStorage.getItem('maruim-tema')}if(t)document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${specialElite.variable} ${playfair.variable} ${dmSans.variable} font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
