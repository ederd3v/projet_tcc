// Fonte única das três linhas de produto da Maruim.
//
// Antes, `page.tsx` e `Footer.tsx` mantinham cada um a sua lista com `href` e
// rótulo repetidos. Mudar uma rota ou acrescentar uma linha exigia lembrar dos
// dois lugares, e esquecer um não quebrava o build — o footer só passava a
// apontar para uma rota que a home não tem mais (review de @sidneyoliveiraj no
// PR #1). Agora os dois consomem daqui.
//
// `categoria` casa com o enum do campo `Produto.categoria` no schema Prisma:
// é por ele que a home consulta e conta os produtos de cada linha.

export type Categoria = "licor" | "kombucha" | "ice";

export type LinhaDeProduto = {
  categoria: Categoria;
  href: string;
  /** Rótulo curto, usado na navegação do rodapé. */
  label: string;
  /** Olho-de-boi acima do título da seção: "500ml · Licores Finos". */
  eyebrow: string;
  /** Título da seção na home, com `destaque` renderizado em cor de acento. */
  titulo: string;
  destaque: string;
  intro: string;
};

export const CATEGORIAS: readonly LinhaDeProduto[] = [
  {
    categoria: "licor",
    href: "/licores",
    label: "Licores",
    eyebrow: "500ml · Licores Finos",
    titulo: "Nossos Licores",
    destaque: "Licores",
    intro:
      "Produzidos artesanalmente com frutas frescas e técnicas tradicionais. Cada garrafa, uma experiência única.",
  },
  {
    categoria: "kombucha",
    href: "/kombuchas",
    label: "Kombuchas",
    eyebrow: "350ml · Fermentação Natural",
    titulo: "Kombuchas Vivas",
    destaque: "Vivas",
    intro:
      "Fermentadas em chá verde e preto por até 21 dias. Probióticas, vivas e naturalmente gaseificadas.",
  },
  {
    categoria: "ice",
    href: "/ice",
    label: "Ice",
    eyebrow: "350ml · Gelado",
    titulo: "Maruim Ice",
    destaque: "Ice",
    intro: "A versão mais refrescante. Pronto pra beber, em quatro sabores. Só R$ 7,50 cada.",
  },
] as const;
