import Image from "next/image";
import { BotaoPedir } from "./BotaoPedir";

type Props = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  fotoUrl: string;
  volumeMl: number;
};

// RF01 (mostra nome/descrição/foto/preço) + RF02 (botão WhatsApp por produto,
// sempre com mensagem pré-preenchida — não fica em branco).
export function ProductCard({ id, nome, descricao, preco, fotoUrl, volumeMl }: Props) {
  const precoFormatado = preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <article className="flex min-w-0 flex-col gap-4">
      {/* Quadro 4:5 como na vitrine da loja de perfumes; sizes acompanha a grade
          do CategoryPage (2/3/4 colunas, max-w-6xl). */}
      <div className="relative aspect-[4/5] overflow-hidden border border-maruim-line bg-black">
        <Image
          src={fotoUrl}
          alt={nome}
          fill
          sizes="(min-width: 1024px) 280px, (min-width: 768px) 33vw, 50vw"
          quality={85}
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <h3 className="font-serif text-lg leading-tight text-maruim-amberLight">{nome}</h3>
        <p className="line-clamp-2 text-sm text-maruim-muted">{descricao}</p>
        <p className="text-[11px] uppercase tracking-[0.16em] text-maruim-muted">{volumeMl}ml</p>
        <div className="mt-auto flex flex-col gap-3 pt-2">
          <span className="font-display text-lg text-maruim-cream">{precoFormatado}</span>
          <BotaoPedir produtoId={id} nome={nome} preco={preco} fotoUrl={fotoUrl} volumeMl={volumeMl} />
        </div>
      </div>
    </article>
  );
}
