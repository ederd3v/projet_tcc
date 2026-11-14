//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: Moldura RAIZ de todas as páginas (site e painel): <html>, idioma, fontes e o script do tema.
//  ⚙️  COMO FUNCIONA: O Next.js envolve cada página com este layout. Abaixo dele há dois grupos:
//      (site)/layout.tsx = site público (CSS Tailwind) e painel/layout.tsx = CRM (CSS próprio).
//      O script aplica o tema salvo (claro/escuro) antes da tela pintar, para não piscar.
//  🎓 NA BANCA: Estrutura em camadas: o que é comum fica aqui uma vez só; cada área tem o seu visual.
//  ──────────────────────────────────────────────────────────────────────
import type { Metadata } from "next";
import { Special_Elite, Playfair_Display, DM_Sans } from "next/font/google";
// O CSS do site (Tailwind) é carregado em (site)/layout.tsx; o painel tem o
// próprio CSS em painel/layout.tsx. Assim um não interfere no visual do outro.

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
