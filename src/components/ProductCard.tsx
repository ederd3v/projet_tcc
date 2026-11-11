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
    <article className="halo-bg overflow-hidden rounded-xl border border-maruim-amber/20">
      <div className="relative aspect-square">
        {/* sizes acompanha a grade do CategoryPage (1/2/3 colunas, max-w-6xl);
            sem ele o Next baixa a foto em 3840px para um card de ~370px. */}
        <Image
          src={fotoUrl}
          alt={nome}
          fill
          sizes="(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="space-y-2 p-4">
        <h3 className="font-serif text-lg text-maruim-amberLight">{nome}</h3>
        <p className="text-sm text-maruim-muted">{descricao}</p>
        <p className="text-xs uppercase tracking-wide text-maruim-muted">{volumeMl}ml</p>
        <div className="flex items-center justify-between pt-2">
          <span className="font-display text-maruim-cream">{precoFormatado}</span>
          <BotaoPedir produtoId={id} nome={nome} preco={preco} fotoUrl={fotoUrl} volumeMl={volumeMl} />
        </div>
      </div>
    </article>
  );
}
