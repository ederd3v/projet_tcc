//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: Página /ice: a vitrine das bebidas Ice.
//  ⚙️  COMO FUNCIONA: Só chama o CategoryPage com a categoria 'ice'.
//  🎓 NA BANCA: Mesmo componente das outras linhas (sem código repetido).
//  ──────────────────────────────────────────────────────────────────────
import { CategoryPage } from "@/components/CategoryPage";

export const revalidate = 0;

export default function IcePage() {
  return (
    <CategoryPage
      categoria="ice"
      titulo="Ice"
      intro="Bebidas geladas artesanais Maruim, 350ml. 4 sabores."
    />
  );
}
