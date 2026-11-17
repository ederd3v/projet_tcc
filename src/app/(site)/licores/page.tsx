//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: Página /licores: a vitrine de licores.
//  ⚙️  COMO FUNCIONA: Só chama o CategoryPage com a categoria 'licor'. A lógica fica num componente só, usado pelas 3 linhas.
//  🎓 NA BANCA: Reaproveitamento: licores, kombuchas e ice são a mesma página com dados diferentes.
//  ──────────────────────────────────────────────────────────────────────
import { CategoryPage } from "@/components/CategoryPage";

export const revalidate = 0;

export default function LicoresPage() {
  return (
    <CategoryPage
      categoria="licor"
      titulo="Licores"
      intro="Licores artesanais Maruim, 500ml, 18,7% vol. 11 sabores."
    />
  );
}
