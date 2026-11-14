//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: Configuração dos TESTES AUTOMÁTICOS (Vitest).
//  ⚙️  COMO FUNCIONA: `npm test` acha todo arquivo *.test.ts, roda e mostra o
//      que passou/falhou. `npm run test:cobertura` mostra quanto do código foi
//      exercitado. O "@" aponta para src/, igual ao resto do projeto.
//  🎓 NA BANCA: Os testes rodam também no deploy (amplify.yml): se algum
//      falhar, a versão nova NÃO vai para o ar.
//  ──────────────────────────────────────────────────────────────────────
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    include: ["src/**/*.test.ts", "prisma/**/*.test.ts"],
    environment: "node", // arquivos que precisam de tela usam "// @vitest-environment jsdom"
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/painel/**", "src/app/api/**"],
      exclude: ["**/*.test.ts", "src/painel/estrutura.ts", "src/painel/tipos.ts"],
      reporter: ["text", "html"],
    },
  },
});
