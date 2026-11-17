//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: Layout do SITE PÚBLICO (home, licores, kombuchas, ice, sobre, login).
//  ⚙️  COMO FUNCIONA: Só carrega o CSS do site (Tailwind). O "(site)" entre
//      parênteses é um "grupo de rotas" do Next: organiza as pastas sem mudar
//      as URLs — /licores continua sendo /licores.
//  🎓 NA BANCA: Separa o visual do site do visual do painel (/painel), que tem
//      o próprio CSS. Um não quebra o outro.
//  ──────────────────────────────────────────────────────────────────────
import "../globals.css";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
