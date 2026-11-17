//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: Página /kombuchas: a vitrine de kombuchas.
//  ⚙️  COMO FUNCIONA: Só chama o CategoryPage com a categoria 'kombucha'.
//  🎓 NA BANCA: Mesmo componente das outras linhas (sem código repetido).
//  ──────────────────────────────────────────────────────────────────────
import { CategoryPage } from "@/components/CategoryPage";

export const revalidate = 0;

export default function KombuchasPage() {
  return (
    <CategoryPage
      categoria="kombucha"
      titulo="Kombuchas"
      intro="Kombuchas artesanais Maruim, 350ml. 7 sabores."
    />
  );
}
