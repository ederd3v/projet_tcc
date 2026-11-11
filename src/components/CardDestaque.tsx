import Image from "next/image";
import Link from "next/link";

type Props = {
  nome: string;
  preco: number;
  fotoUrl: string;
  /** "Especial", "⭐ Top", "Bestseller"… vem do banco (campo `selo`). */
  selo: string | null;
  /** Rota da categoria — o card inteiro leva para o cardápio completo. */
  href: string;
};

// Card de destaque da home, no padrão da vitrine da loja de perfumes do Eder:
// quatro por fileira (dois no celular), foto num quadro 4:5 e, embaixo, o nome
// e o preço. O card leva ao cardápio completo da linha, onde o pedido acontece.
export function CardDestaque({ nome, preco, fotoUrl, selo, href }: Props) {
  // Na home o nome aparece curto: "Licor de Jabuticaba" vira "Jabuticaba".
  const nomeCurto = nome.replace(/^(Licor|Kombucha|Ice)\s+(de\s+)?/i, "");
  const precoFormatado = preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Link href={href} className="group flex min-w-0 flex-col gap-4">
      <div className="relative aspect-[4/5] overflow-hidden border border-maruim-line bg-black transition-colors group-hover:border-maruim-amber/40">
        <Image
          src={fotoUrl}
          alt={nome}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          quality={85}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {selo && (
          <span className="absolute left-3 top-3 bg-black/60 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-maruim-amber backdrop-blur-sm">
            {selo}
          </span>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 font-display text-lg leading-tight text-maruim-cream md:text-xl">{nomeCurto}</p>
        <p className="shrink-0 font-display text-base text-maruim-amber md:text-lg">{precoFormatado}</p>
      </div>
    </Link>
  );
}
