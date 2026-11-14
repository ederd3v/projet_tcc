# 📁 src/painel — o CRM do Jaisson (toda a lógica, em TypeScript)

A página `/painel` (em `src/app/painel/page.tsx`) só coloca o esqueleto na
tela e chama `iniciarPainel()`. **Todo o resto acontece aqui:**

```
painel/
├── tipos.ts       📐 o formato dos dados: Produto, Cliente, Pedido, Estado
├── dados.ts       💾 conversa com a API (GET/PUT /api/crm/estado) e guarda o estado
├── nucleo.ts      🎛️ o "maestro": menu, período, janelas, avisos e a Visão geral
├── telas.ts       🖥️ Pedidos (quadro), Clientes, Produtos, Origem e formulários
├── graficos.ts    📊 gráficos em SVG, sem biblioteca
├── util.ts        🔧 dinheiro, datas, telefone e esc() (proteção contra XSS)
├── estrutura.ts   🧱 o HTML do painel (menu, 5 telas, janelas)
└── painel.css     🎨 o visual do painel (também no celular)
```

## Como uma ação percorre o código (exemplo: excluir um cliente)

1. O dono clica em **Excluir cliente**, na ficha (`telas.ts → detalheCliente`).
2. A tela confirma e chama `excluirCliente(id)` em `dados.ts`.
3. `dados.ts` tira o cliente (e os pedidos dele) do estado e chama `salvar()`.
4. `salvar()` manda tudo para `PUT /api/crm/estado`.
5. A API confere as regras (`src/lib/regrasPedido.ts`) e grava no PostgreSQL.
6. A tela redesenha (`nucleo.ts → render()`).

## Requisitos do RFC que moram aqui

| Requisito | Onde |
|---|---|
| RF04 clientes: cadastrar, editar e remover | `telas.ts`: `formCliente`, `detalheCliente` → Excluir |
| RF05 pedido com cliente e itens | `telas.ts`: `formPedido`, `mudarStatus` + `src/lib/regrasPedido.ts` |
| RF06 histórico do cliente | `telas.ts`: `detalheCliente` (mais recente primeiro) |
| RF07 catálogo (ligar/desligar, preço, estoque) | `telas.ts`: `renderProdutos` |
| RF08 celular | `painel.css` (media queries) |

Testes: `dados.test.ts`, `graficos.test.ts` e `util.test.ts`.
