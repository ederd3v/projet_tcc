// Catálogo real da Bebidas Maruim, conferido no HTML publicado
// (~/Desktop/maruim-site/HANDOFF.md) — não são dados de exemplo.
import { PrismaClient } from "@prisma/client";
import { ices, kombuchas, licores, PRECO_ICE, PRECO_KOMBUCHA } from "./catalogo";

const prisma = new PrismaClient();

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
        preco: l.preco ?? 0,
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
        preco: PRECO_KOMBUCHA,
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
        preco: PRECO_ICE,
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
