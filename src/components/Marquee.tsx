// Faixa rolando entre o hero e o catálogo, como no site publicado.
//
// A lista é duplicada de propósito: a animação desloca -50% da largura, então
// a segunda cópia entra no lugar da primeira e o laço não tem emenda visível.
const ITENS = [
  "Licor de Ameixa",
  "Kombucha Artesanal",
  "Licor de Café",
  "Maruim Ice",
  "Licor de Figo",
  "Jabuticaba",
  "Joinville · SC",
];

export function Marquee() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y border-maruim-line bg-maruim-dark py-7"
    >
      <div className="flex w-max animate-marquee gap-14">
        {[...ITENS, ...ITENS].map((item, i) => (
          <div key={`${item}-${i}`} className="flex items-center gap-6 whitespace-nowrap">
            <span className="font-display text-lg text-maruim-cream/30">{item}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-maruim-amber" />
          </div>
        ))}
      </div>
    </div>
  );
}
