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

// Card grande de destaque da home: a garrafa ocupa o card e o texto fica
// ancorado no canto inferior esquerdo, sobreposto. É o formato do site
// publicado — o card leva ao cardápio da linha, e o pedido acontece lá.
export function CardDestaque({ nome, preco, fotoUrl, selo, href }: Props) {
  // Na home o nome aparece curto: "Licor de Jabuticaba" vira "Jabuticaba".
  const nomeCurto = nome.replace(/^(Licor|Kombucha|Ice)\s+(de\s+)?/i, "");
  const precoFormatado = preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Link
      href={href}
      className="group relative flex items-center justify-center overflow-hidden border border-maruim-line bg-maruim-card p-8 transition-all hover:border-maruim-amber/40"
    >
      <Image
        src={fotoUrl}
        alt={nome}
        width={896}
        height={1200}
        className="max-h-[440px] w-auto object-contain transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute bottom-6 left-6">
        {selo && <p className="text-[10px] uppercase tracking-[0.2em] text-maruim-amber">{selo}</p>}
        <p className="font-display text-3xl text-maruim-cream">{nomeCurto}</p>
        <p className="mt-1 font-display text-xl text-maruim-amber">{precoFormatado}</p>
      </div>
    </Link>
  );
}
