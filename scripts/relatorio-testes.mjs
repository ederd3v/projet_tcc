//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: Gera o RELATORIO-DE-TESTES.md (registro dos testes para a auditoria).
//  ⚙️  COMO FUNCIONA: `npm run test:relatorio` roda os testes (Vitest) com saída
//      em JSON e a cobertura, e este script transforma os dois numa tabela legível:
//      cada teste, se passou, o requisito do RFC que ele cobre e a cobertura.
//  🎓 NA BANCA: é a evidência de que os testes existem e passam — com data.
//  ──────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const raiz = process.cwd();
const r = JSON.parse(readFileSync(path.join(raiz, "relatorios/testes.json"), "utf8"));
const cobPath = path.join(raiz, "coverage/coverage-summary.json");
const cob = existsSync(cobPath) ? JSON.parse(readFileSync(cobPath, "utf8")) : null;

// Requisito do RFC que cada arquivo de teste cobre.
const RF = {
  "src/lib/regrasPedido.test.ts": "RF05 (pedido com cliente e itens)",
  "src/lib/auth.test.ts": "RF03 / RNF03 (login do dono)",
  "src/middleware.test.ts": "RNF03 (CRM só com login)",
  "src/lib/whatsapp.test.ts": "RF02 (WhatsApp com mensagem pronta)",
  "src/app/api/pedido-do-site/route.test.ts": "RF02 + segurança (preço do banco)",
  "src/app/api/crm/estado/route.test.ts": "RF04–RF07 + RF05 no servidor",
  "src/painel/dados.test.ts": "RF04 (clientes), RF05, RF07 (estoque)",
  "src/painel/graficos.test.ts": "painel (relatórios visuais)",
  "src/painel/util.test.ts": "segurança (XSS), telefone, datas",
  "prisma/catalogo.test.ts": "RF01 (catálogo: fotos, notas, preços)",
  "src/lib/status.test.ts": "RF05 (etapas do pedido)",
  "src/lib/maisPedido.test.ts": "RF01 (selo 'Mais pedido')",
  "src/lib/categorias.test.ts": "RF01 (linhas de produto e menu)",
};

const rel = (f) => path.relative(raiz, f).replace(/\\/g, "/");
const data = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
const arquivos = r.testResults.map((t) => ({ ...t, nome: rel(t.name) })).sort((a, b) => a.nome.localeCompare(b.nome));

let md = `# 🧪 Relatório de testes automáticos — Bebidas Maruim

- **Gerado em:** ${data} (horário de Brasília)
- **Ferramenta:** Vitest · banco **simulado** (os testes não precisam de PostgreSQL)
- **Resultado:** **${r.numPassedTests} de ${r.numTotalTests} testes passaram** · ${r.numFailedTests} falharam · ${arquivos.length} arquivos
- **Como gerar de novo:** \`npm run test:relatorio\` (VS Code → Executar Tarefa → 🧪 Relatório de testes)
- **No deploy:** o \`amplify.yml\` roda \`npm test\` antes do build — se um teste falhar, a versão nova não vai para o ar.

## Resumo por arquivo

| Arquivo de teste | Requisito coberto | Testes | Resultado |
|---|---|---|---|
`;
for (const a of arquivos) {
  const ok = a.assertionResults.filter((t) => t.status === "passed").length;
  md += `| \`${a.nome}\` | ${RF[a.nome] ?? "—"} | ${a.assertionResults.length} | ${ok === a.assertionResults.length ? "✅" : "❌"} ${ok}/${a.assertionResults.length} |\n`;
}

if (cob) {
  md += `\n## Cobertura (quanto do código os testes exercitam)\n\n| Arquivo | Linhas | Funções | Ramificações |\n|---|---|---|---|\n`;
  for (const [f, v] of Object.entries(cob)) {
    if (f === "total") continue;
    md += `| \`${rel(f)}\` | ${v.lines.pct}% | ${v.functions.pct}% | ${v.branches.pct}% |\n`;
  }
  md += `| **Total** | **${cob.total.lines.pct}%** | **${cob.total.functions.pct}%** | **${cob.total.branches.pct}%** |\n`;
  md += `\n> \`src/painel/nucleo.ts\` e \`telas.ts\` são a interface do painel (cliques e telas): são cobertos pelo **teste de ponta a ponta** no navegador (login → 5 telas → regra do pedido → excluir cliente → celular), não por teste unitário.\n`;
}

md += `\n## Todos os testes\n`;
for (const a of arquivos) {
  md += `\n### \`${a.nome}\` — ${RF[a.nome] ?? ""}\n\n`;
  for (const t of a.assertionResults) {
    const grupo = t.ancestorTitles.length ? t.ancestorTitles.join(" › ") + " › " : "";
    md += `- ${t.status === "passed" ? "✅" : "❌"} ${grupo}${t.title}\n`;
  }
}

md += `\n## Bugs que os testes encontraram (e foram corrigidos)\n
1. **API do CRM respondia erro interno (500) a dados malformados** → agora valida com Zod e responde 400 sem gravar.
2. **Telefone digitado com +55 gerava link do WhatsApp errado** (wa.me/555547…) → \`normalizarTelefone\`.
3. **Login recusava e-mail com letra maiúscula/espaço** (teclado do celular) → comparação normalizada.
`;

writeFileSync(path.join(raiz, "RELATORIO-DE-TESTES.md"), md);
console.log(`RELATORIO-DE-TESTES.md gerado: ${r.numPassedTests}/${r.numTotalTests} testes`);
