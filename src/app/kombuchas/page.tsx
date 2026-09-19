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
