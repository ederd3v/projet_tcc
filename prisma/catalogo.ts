//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: O CATÁLOGO REAL da Bebidas Maruim (22 produtos), em um lugar só.
//  ⚙️  COMO FUNCIONA: O seed.ts lê daqui para cadastrar no banco; os testes
//      leem daqui para conferir que toda foto e toda nota de sabor existem.
//  🎓 NA BANCA: Separar o dado (catálogo) do script que grava (seed) permite
//      testar o catálogo sem apagar o banco.
//  ──────────────────────────────────────────────────────────────────────
// Conferido no HTML do site publicado — não são dados de exemplo.

export type ItemCatalogo = { nome: string; foto: string; preco?: number };

export const licores: ItemCatalogo[] = [
  { nome: "Licor de Anis Estrelado", preco: 29.9, foto: "licor-anis-estrelado" },
  { nome: "Licor de Banana", preco: 29.9, foto: "licor-banana" },
  { nome: "Licor de Canela", preco: 29.9, foto: "licor-canela" },
  { nome: "Licor de Maracujá", preco: 29.9, foto: "licor-maracuja" },
  { nome: "Licor de Abacaxi", preco: 29.9, foto: "licor-abacaxi" },
  { nome: "Licor de Butiá", preco: 34.9, foto: "licor-butia" },
  { nome: "Licor de Jabuticaba", preco: 34.9, foto: "licor-jabuticaba" },
  { nome: "Licor de Café", preco: 39.9, foto: "licor-cafe" },
  { nome: "Licor de Figo", preco: 39.9, foto: "licor-figo" },
  { nome: "Licor de Morango", preco: 39.9, foto: "licor-morango" },
  { nome: "Licor de Ameixa", preco: 49.9, foto: "licor-ameixa" },
];

export const kombuchas: ItemCatalogo[] = [
  { nome: "Kombucha Abacaxi & Hortelã", foto: "kombucha-abacaxi-hortela" },
  { nome: "Kombucha Gengibre, Limão & Mel", foto: "kombucha-gengibre-limao-mel" },
  { nome: "Kombucha Maracujá & Cardamomo", foto: "kombucha-maracuja-cardamomo" },
  { nome: "Kombucha Morango & Hibisco", foto: "kombucha-morango-hibisco" },
  { nome: "Kombucha Pink Lemonade", foto: "kombucha-pink-lemonade" },
  { nome: "Kombucha Uva", foto: "kombucha-uva" },
  { nome: "Kombucha Uva Branca", foto: "kombucha-uva-branca" },
];

export const ices: ItemCatalogo[] = [
  { nome: "Ice Limão", foto: "ice-limao" },
  { nome: "Ice Abacaxi", foto: "ice-abacaxi" },
  { nome: "Ice Melancia", foto: "ice-melancia" },
  { nome: "Ice Maracujá", foto: "ice-maracuja" },
];

/** Preços fixos por linha (kombucha e ice têm preço único).
 *  Tabela de 16/11/2026: licores e kombuchas com final ,90; Ice mantido em R$ 7,50. */
export const PRECO_KOMBUCHA = 10.9;
export const PRECO_ICE = 7.5;
