// Catálogo real da Bebidas Maruim, conferido no HTML publicado
// (~/Desktop/maruim-site/HANDOFF.md) — não são dados de exemplo.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const licores = [
  { nome: "Licor de Anis Estrelado", preco: 30, foto: "licor-anis-estrelado" },
  { nome: "Licor de Banana", preco: 30, foto: "licor-banana" },
  { nome: "Licor de Canela", preco: 30, foto: "licor-canela" },
  { nome: "Licor de Maracujá", preco: 30, foto: "licor-maracuja" },
  { nome: "Licor de Abacaxi", preco: 30, foto: "licor-abacaxi" },
  { nome: "Licor de Butiá", preco: 35, foto: "licor-butia" },
  { nome: "Licor de Jabuticaba", preco: 35, foto: "licor-jabuticaba" },
  { nome: "Licor de Café", preco: 40, foto: "licor-cafe" },
  { nome: "Licor de Figo", preco: 40, foto: "licor-figo" },
  { nome: "Licor de Morango", preco: 40, foto: "licor-morango" },
  { nome: "Licor de Ameixa", preco: 50, foto: "licor-ameixa" },
];

const kombuchas = [
  { nome: "Kombucha Abacaxi & Hortelã", foto: "kombucha-abacaxi-hortela" },
  { nome: "Kombucha Gengibre, Limão & Mel", foto: "kombucha-gengibre-limao-mel" },
  { nome: "Kombucha Maracujá & Cardamomo", foto: "kombucha-maracuja-cardamomo" },
  { nome: "Kombucha Morango & Hibisco", foto: "kombucha-morango-hibisco" },
  { nome: "Kombucha Pink Lemonade", foto: "kombucha-pink-lemonade" },
  { nome: "Kombucha Uva", foto: "kombucha-uva" },
  { nome: "Kombucha Uva Branca", foto: "kombucha-uva-branca" },
];

const ices = [
  { nome: "Ice Limão", foto: "ice-limao" },
  { nome: "Ice Abacaxi", foto: "ice-abacaxi" },
  { nome: "Ice Melancia", foto: "ice-melancia" },
  { nome: "Ice Maracujá", foto: "ice-maracuja" },
];

async function main() {
  await prisma.itemPedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.cliente.deleteMany();

  for (const l of licores) {
    await prisma.produto.create({
      data: {
        nome: l.nome,
        descricao: "Licor artesanal Maruim, 500ml, 18,7% vol.",
        preco: l.preco,
        fotoUrl: `/products/${l.foto}.png`,
        categoria: "licor",
        volumeMl: 500,
      },
    });
  }

  for (const k of kombuchas) {
    await prisma.produto.create({
      data: {
        nome: k.nome,
        descricao: "Kombucha artesanal Maruim, 350ml.",
        preco: 11,
        fotoUrl: `/products/${k.foto}.png`,
        categoria: "kombucha",
        volumeMl: 350,
      },
    });
  }

  for (const i of ices) {
    await prisma.produto.create({
      data: {
        nome: i.nome,
        descricao: "Bebida gelada artesanal Maruim, 350ml.",
        preco: 7.5,
        fotoUrl: `/products/${i.foto}.png`,
        categoria: "ice",
        volumeMl: 350,
      },
    });
  }


  // Destaques da home: quais dois produtos de cada linha aparecem no card
  // grande e com que selo. No site publicado isso era texto fixo no código;
  // aqui vive no banco porque o RF07 põe o catálogo sob gestão do dono.
  const DESTAQUES: Record<string, string> = {
    "Licor de Jabuticaba": "Especial",
    "Licor de Ameixa": "⭐ Top",
    "Kombucha Abacaxi & Hortelã": "Bestseller",
    "Kombucha Morango & Hibisco": "⭐ Top",
    "Ice Limão": "Clássico",
    "Ice Melancia": "⭐ Top",
  };
  for (const [nome, selo] of Object.entries(DESTAQUES)) {
    const r = await prisma.produto.updateMany({
      where: { nome },
      data: { selo, destaque: true },
    });
    if (r.count === 0) console.warn(`  aviso: produto não encontrado para o selo "${selo}": ${nome}`);
  }

  console.log(
    `Seed ok: ${licores.length} licores, ${kombuchas.length} kombuchas, ${ices.length} ices.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
