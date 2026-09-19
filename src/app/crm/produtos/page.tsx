import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { criarProduto, alternarAtivo, removerProduto } from "./actions";
import { ImageUpload } from "./ImageUpload";

export const revalidate = 0;

export default async function ProdutosPage() {
  const produtos = await prisma.produto.findMany({ orderBy: [{ categoria: "asc" }, { nome: "asc" }] });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl text-maruim-amberLight">Produtos</h1>
        <p className="text-sm text-maruim-muted">
          RF07 — o campo &quot;ativo&quot; controla o que aparece na landing (RF01).
        </p>
      </div>

      <form action={criarProduto} className="grid gap-3 rounded-xl border border-maruim-amber/20 bg-maruim-bgAlt p-6 sm:grid-cols-2">
        <input name="nome" placeholder="Nome" required className="rounded-md border border-maruim-amber/30 bg-maruim-bg px-3 py-2 text-maruim-cream" />
        <select name="categoria" required className="rounded-md border border-maruim-amber/30 bg-maruim-bg px-3 py-2 text-maruim-cream">
          <option value="licor">Licor</option>
          <option value="kombucha">Kombucha</option>
          <option value="ice">Ice</option>
        </select>
        <input name="preco" type="number" step="0.01" placeholder="Preço" required className="rounded-md border border-maruim-amber/30 bg-maruim-bg px-3 py-2 text-maruim-cream" />
        <input name="volumeMl" type="number" placeholder="Volume (ml)" required className="rounded-md border border-maruim-amber/30 bg-maruim-bg px-3 py-2 text-maruim-cream" />
        <textarea name="descricao" placeholder="Descrição" required className="sm:col-span-2 rounded-md border border-maruim-amber/30 bg-maruim-bg px-3 py-2 text-maruim-cream" />
        <div className="sm:col-span-2">
          <ImageUpload />
        </div>
        <button type="submit" className="sm:col-span-2 rounded-full bg-maruim-amber px-4 py-2 text-maruim-bg">
          Adicionar produto
        </button>
      </form>

      <table className="w-full text-left text-sm">
        <thead className="text-maruim-muted">
          <tr>
            <th className="pb-2"></th>
            <th className="pb-2">Nome</th>
            <th className="pb-2">Categoria</th>
            <th className="pb-2">Preço</th>
            <th className="pb-2">Ativo</th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody className="text-maruim-cream">
          {produtos.map((p) => (
            <tr key={p.id} className="border-t border-maruim-amber/10">
              <td className="py-2">
                <div className="relative h-10 w-10">
                  <Image src={p.fotoUrl} alt={p.nome} fill className="object-contain" />
                </div>
              </td>
              <td className="py-2">{p.nome}</td>
              <td className="py-2 capitalize">{p.categoria}</td>
              <td className="py-2">{p.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
              <td className="py-2">
                <form
                  action={async () => {
                    "use server";
                    await alternarAtivo(p.id, !p.ativo);
                  }}
                >
                  <button type="submit" className={p.ativo ? "text-green-400" : "text-maruim-muted"}>
                    {p.ativo ? "Sim" : "Não"}
                  </button>
                </form>
              </td>
              <td className="py-2 text-right">
                <form
                  action={async () => {
                    "use server";
                    await removerProduto(p.id);
                  }}
                >
                  <button type="submit" className="text-xs text-red-400 hover:underline">
                    Remover
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
