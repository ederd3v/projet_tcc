import { prisma } from "@/lib/prisma";
import { criarProduto } from "./actions";
import { ImageUpload } from "./ImageUpload";
import { CardProduto } from "./CardProduto";
import { CATEGORIAS } from "@/lib/categorias";

export const revalidate = 0;

type Props = { searchParams: { cat?: string } };

export default async function ProdutosPage({ searchParams }: Props) {
  const cat = searchParams.cat ?? "todos";
  const filtro = CATEGORIAS.some((c) => c.categoria === cat) ? { categoria: cat } : {};

  // Unidades vendidas nos últimos 30 dias, por produto. Pedidos cancelados
  // não contam — é o mesmo critério do protótipo.
  const desde = new Date(Date.now() - 30 * 864e5);
  const [produtos, vendas] = await Promise.all([
    prisma.produto.findMany({ where: filtro, orderBy: [{ categoria: "asc" }, { nome: "asc" }] }),
    prisma.itemPedido.groupBy({
      by: ["produtoId"],
      _sum: { quantidade: true },
      where: { pedido: { data: { gte: desde }, status: { not: "cancelado" } } },
    }),
  ]);
  const vendidos = new Map(vendas.map((v) => [v.produtoId, v._sum.quantidade ?? 0]));

  const abas = [{ categoria: "todos", label: "Todos" }, ...CATEGORIAS.map((c) => ({ categoria: c.categoria, label: c.label }))];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-maruim-cream">Produtos</h1>
        <p className="mt-1 text-sm text-maruim-muted">
          Preço e estoque salvam sozinhos ao sair do campo. O interruptor tira o produto da landing
          (RF07 → RF01).
        </p>
      </div>

      <nav className="flex flex-wrap gap-2">
        {abas.map((a) => {
          const ativo = a.categoria === cat;
          return (
            <a
              key={a.categoria}
              href={a.categoria === "todos" ? "/crm/produtos" : `/crm/produtos?cat=${a.categoria}`}
              className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.1em] transition-colors ${
                ativo
                  ? "border-maruim-amber bg-maruim-amber text-maruim-bg"
                  : "border-maruim-line text-maruim-muted hover:text-maruim-cream"
              }`}
            >
              {a.label}
            </a>
          );
        })}
      </nav>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {produtos.map((p) => (
          <CardProduto
            key={p.id}
            id={p.id}
            nome={p.nome}
            categoria={p.categoria}
            fotoUrl={p.fotoUrl}
            preco={p.preco}
            estoque={p.estoque}
            ativo={p.ativo}
            vendidos={vendidos.get(p.id) ?? 0}
          />
        ))}
      </div>

      <details className="rounded-xl border border-maruim-line bg-maruim-card p-6">
        <summary className="cursor-pointer font-display text-maruim-cream">
          Adicionar produto ao catálogo
        </summary>
        <form action={criarProduto} className="mt-5 grid gap-3 sm:grid-cols-2">
          <input name="nome" placeholder="Nome" required className="rounded-md border border-maruim-line bg-maruim-bg px-3 py-2 text-maruim-cream" />
          <select name="categoria" required className="rounded-md border border-maruim-line bg-maruim-bg px-3 py-2 text-maruim-cream">
            {CATEGORIAS.map((c) => (
              <option key={c.categoria} value={c.categoria}>{c.label}</option>
            ))}
          </select>
          <input name="preco" type="number" step="0.01" placeholder="Preço" required className="rounded-md border border-maruim-line bg-maruim-bg px-3 py-2 text-maruim-cream" />
          <input name="volumeMl" type="number" placeholder="Volume (ml)" required className="rounded-md border border-maruim-line bg-maruim-bg px-3 py-2 text-maruim-cream" />
          <textarea name="descricao" placeholder="Descrição" required className="rounded-md border border-maruim-line bg-maruim-bg px-3 py-2 text-maruim-cream sm:col-span-2" />
          <div className="sm:col-span-2">
            <ImageUpload />
          </div>
          <button type="submit" className="rounded-sm bg-maruim-amber px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.1em] text-maruim-bg sm:col-span-2">
            Adicionar produto
          </button>
        </form>
      </details>
    </div>
  );
}
