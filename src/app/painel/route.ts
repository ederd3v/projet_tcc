//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: Entrega a tela do CRM (o painel) em /painel.
//  ⚙️  COMO FUNCIONA: Lê o HTML do painel (src/painel/index.html) e devolve. Antes disso o middleware já conferiu o login.
//  🎓 NA BANCA: O painel só existe para quem está logado: sem sessão, volta para a tela de login.
//  ──────────────────────────────────────────────────────────────────────
import { readFile } from "node:fs/promises";
import path from "node:path";

// O painel de gestão é HTML puro (src/painel/index.html); os assets dele
// continuam em public/painel/assets.
//
// Antes ele ficava em public/painel e uma rewrite levava /painel até lá.
// No Amplify Hosting isso quebra: os arquivos de public/ são servidos pela
// CDN, fora do servidor do Next. A rewrite roda no servidor, não acha o
// arquivo e responde 404. Pior: /painel/index.html ficava aberto na CDN sem
// passar pelo login. Servindo por esta rota, o HTML só sai depois do
// middleware (sessão válida) e funciona igual em dev e em produção.
export const dynamic = "force-dynamic";

export async function GET() {
  const html = await readFile(
    path.join(process.cwd(), "src/painel/index.html"),
    "utf8",
  );
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
