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
