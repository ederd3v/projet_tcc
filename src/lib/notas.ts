// Notas de degustação mostradas ao passar o mouse na foto (como a pirâmide
// olfativa da vitrine de perfumes do Eder). Chave = nome do arquivo da foto
// (/products/<chave>.png), que já é único por produto e está no banco.
//
// ⚠️ Textos de vitrine escritos a partir do sabor e dos ingredientes de cada
// rótulo; confirmar com o Jaisson antes de publicar.
export type Notas = { sabor: string; combina: string; servir: string };

const NOTAS: Record<string, Notas> = {
  // Licores
  "licor-ameixa": { sabor: "Ameixa madura, final macio e levemente adocicado", combina: "Sobremesas com chocolate, queijos curados", servir: "Gelado, puro ou com gelo" },
  "licor-figo": { sabor: "Figo maduro com notas de mel", combina: "Tábua de queijos, castanhas", servir: "Gelado, em cálice pequeno" },
  "licor-anis-estrelado": { sabor: "Anis estrelado, fresco e herbal", combina: "Café, depois do almoço", servir: "Bem gelado ou com gelo" },
  "licor-canela": { sabor: "Canela em pau, quente e aromático", combina: "Café, doces de forno, noites frias", servir: "Puro, em temperatura ambiente ou gelado" },
  "licor-cafe": { sabor: "Café torrado, encorpado e aveludado", combina: "Sorvete de creme, sobremesas", servir: "Gelado, puro ou no affogato" },
  "licor-morango": { sabor: "Morango fresco, doce e frutado", combina: "Sobremesas, espumante", servir: "Bem gelado" },
  "licor-maracuja": { sabor: "Maracujá azedinho e tropical", combina: "Drinks de verão, mousse", servir: "Bem gelado ou com gelo" },
  "licor-banana": { sabor: "Banana madura, cremoso e doce", combina: "Doces caseiros, café", servir: "Gelado, puro" },
  "licor-abacaxi": { sabor: "Abacaxi suculento, leve e refrescante", combina: "Drinks tropicais", servir: "Bem gelado" },
  "licor-butia": { sabor: "Butiá, fruta do sul: ácido e perfumado", combina: "Conversa boa e chimarrão depois", servir: "Gelado, puro" },
  "licor-jabuticaba": { sabor: "Jabuticaba intensa, encorpada e frutada", combina: "Queijos, chocolate amargo", servir: "Gelado, em cálice pequeno" },
  // Kombuchas
  "kombucha-maracuja-cardamomo": { sabor: "Maracujá com toque floral de cardamomo", combina: "Almoço leve, saladas", servir: "Bem gelada" },
  "kombucha-uva": { sabor: "Uva roxa, frutada e levemente ácida", combina: "Massas, pizza", servir: "Bem gelada" },
  "kombucha-abacaxi-hortela": { sabor: "Abacaxi com hortelã, refrescante", combina: "Dias quentes, comida leve", servir: "Bem gelada, com gelo" },
  "kombucha-pink-lemonade": { sabor: "Frutas vermelhas, baunilha e limão", combina: "Brunch, sobremesas leves", servir: "Bem gelada" },
  "kombucha-uva-branca": { sabor: "Uva branca, leve e delicada", combina: "Peixes, petiscos", servir: "Bem gelada" },
  "kombucha-morango-hibisco": { sabor: "Morango com hibisco, frutado e floral", combina: "Tarde de sol, sobremesas", servir: "Bem gelada" },
  "kombucha-gengibre-limao-mel": { sabor: "Gengibre picante, limão e mel", combina: "Comida asiática, dias frios", servir: "Gelada" },
  // Ice
  "ice-abacaxi": { sabor: "Abacaxi cremoso e doce", combina: "Festa, piscina", servir: "Trincando de gelado" },
  "ice-limao": { sabor: "Limão cítrico e refrescante", combina: "Churrasco, praia", servir: "Trincando de gelado" },
  "ice-maracuja": { sabor: "Maracujá tropical e azedinho", combina: "Fim de tarde", servir: "Trincando de gelado" },
  "ice-melancia": { sabor: "Melancia leve e doce", combina: "Verão, piscina", servir: "Trincando de gelado" },
};

export function notasDaFoto(fotoUrl: string): Notas | null {
  const chave = fotoUrl.split("/").pop()?.replace(/\.[a-z]+$/i, "") ?? "";
  return NOTAS[chave] ?? null;
}
