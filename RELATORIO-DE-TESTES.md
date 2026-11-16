# 🧪 Relatório de testes automáticos — Bebidas Maruim

- **Gerado em:** 16/11/2026, 08:45:26 (horário de Brasília)
- **Ferramenta:** Vitest · banco **simulado** (os testes não precisam de PostgreSQL)
- **Resultado:** **153 de 153 testes passaram** · 0 falharam · 13 arquivos
- **Como gerar de novo:** `npm run test:relatorio` (VS Code → Executar Tarefa → 🧪 Relatório de testes)
- **No deploy:** o `amplify.yml` roda `npm test` antes do build — se um teste falhar, a versão nova não vai para o ar.

## Resumo por arquivo

| Arquivo de teste | Requisito coberto | Testes | Resultado |
|---|---|---|---|
| `prisma/catalogo.test.ts` | RF01 (catálogo: fotos, notas, preços) | 50 | ✅ 50/50 |
| `src/app/api/crm/estado/route.test.ts` | RF04–RF07 + RF05 no servidor | 10 | ✅ 10/10 |
| `src/app/api/pedido-do-site/route.test.ts` | RF02 + segurança (preço do banco) | 12 | ✅ 12/12 |
| `src/lib/auth.test.ts` | RF03 / RNF03 (login do dono) | 8 | ✅ 8/8 |
| `src/lib/categorias.test.ts` | RF01 (linhas de produto e menu) | 3 | ✅ 3/3 |
| `src/lib/maisPedido.test.ts` | RF01 (selo 'Mais pedido') | 4 | ✅ 4/4 |
| `src/lib/regrasPedido.test.ts` | RF05 (pedido com cliente e itens) | 20 | ✅ 20/20 |
| `src/lib/status.test.ts` | RF05 (etapas do pedido) | 3 | ✅ 3/3 |
| `src/lib/whatsapp.test.ts` | RF02 (WhatsApp com mensagem pronta) | 5 | ✅ 5/5 |
| `src/middleware.test.ts` | RNF03 (CRM só com login) | 5 | ✅ 5/5 |
| `src/painel/dados.test.ts` | RF04 (clientes), RF05, RF07 (estoque) | 14 | ✅ 14/14 |
| `src/painel/graficos.test.ts` | painel (relatórios visuais) | 7 | ✅ 7/7 |
| `src/painel/util.test.ts` | segurança (XSS), telefone, datas | 12 | ✅ 12/12 |

## Cobertura (quanto do código os testes exercitam)

| Arquivo | Linhas | Funções | Ramificações |
|---|---|---|---|
| `src/app/api/auth/[...nextauth]/route.ts` | 0% | 0% | 0% |
| `src/app/api/crm/estado/route.ts` | 92.02% | 100% | 67.5% |
| `src/app/api/pedido-do-site/route.ts` | 100% | 100% | 87.5% |
| `src/lib/auth.ts` | 100% | 100% | 100% |
| `src/lib/categorias.ts` | 100% | 100% | 100% |
| `src/lib/maisPedido.ts` | 100% | 100% | 80% |
| `src/lib/notas.ts` | 100% | 100% | 66.66% |
| `src/lib/prisma.ts` | 0% | 100% | 100% |
| `src/lib/regrasPedido.ts` | 100% | 100% | 100% |
| `src/lib/status.ts` | 100% | 100% | 100% |
| `src/lib/whatsapp.ts` | 100% | 100% | 100% |
| `src/painel/dados.ts` | 96.77% | 86.36% | 93.26% |
| `src/painel/graficos.ts` | 81.15% | 60.71% | 73% |
| `src/painel/nucleo.ts` | 0% | 100% | 100% |
| `src/painel/telas.ts` | 0% | 100% | 100% |
| `src/painel/util.ts` | 91.66% | 91.66% | 89.28% |
| **Total** | **53.12%** | **80.24%** | **84.3%** |

> `src/painel/nucleo.ts` e `telas.ts` são a interface do painel (cliques e telas): são cobertos pelo **teste de ponta a ponta** no navegador (login → 5 telas → regra do pedido → excluir cliente → celular), não por teste unitário.

## Todos os testes

### `prisma/catalogo.test.ts` — RF01 (catálogo: fotos, notas, preços)

- ✅ catálogo › tem 22 produtos: 11 licores, 7 kombuchas, 4 ices
- ✅ catálogo › nomes e fotos não se repetem
- ✅ catálogo › todo licor tem preço positivo; kombucha e ice têm preço de linha
- ✅ catálogo › tabela de 16/11: licores e kombuchas terminam em ,90; Ice fica em R$ 7,50
- ✅ catálogo › Licor de Anis Estrelado tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Licor de Banana tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Licor de Canela tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Licor de Maracujá tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Licor de Abacaxi tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Licor de Butiá tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Licor de Jabuticaba tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Licor de Café tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Licor de Figo tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Licor de Morango tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Licor de Ameixa tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Kombucha Abacaxi & Hortelã tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Kombucha Gengibre, Limão & Mel tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Kombucha Maracujá & Cardamomo tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Kombucha Morango & Hibisco tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Kombucha Pink Lemonade tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Kombucha Uva tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Kombucha Uva Branca tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Ice Limão tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Ice Abacaxi tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Ice Melancia tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Ice Maracujá tem a foto .png (banco) e a .jpg leve (vitrine)
- ✅ catálogo › Licor de Anis Estrelado tem notas de sabor
- ✅ catálogo › Licor de Banana tem notas de sabor
- ✅ catálogo › Licor de Canela tem notas de sabor
- ✅ catálogo › Licor de Maracujá tem notas de sabor
- ✅ catálogo › Licor de Abacaxi tem notas de sabor
- ✅ catálogo › Licor de Butiá tem notas de sabor
- ✅ catálogo › Licor de Jabuticaba tem notas de sabor
- ✅ catálogo › Licor de Café tem notas de sabor
- ✅ catálogo › Licor de Figo tem notas de sabor
- ✅ catálogo › Licor de Morango tem notas de sabor
- ✅ catálogo › Licor de Ameixa tem notas de sabor
- ✅ catálogo › Kombucha Abacaxi & Hortelã tem notas de sabor
- ✅ catálogo › Kombucha Gengibre, Limão & Mel tem notas de sabor
- ✅ catálogo › Kombucha Maracujá & Cardamomo tem notas de sabor
- ✅ catálogo › Kombucha Morango & Hibisco tem notas de sabor
- ✅ catálogo › Kombucha Pink Lemonade tem notas de sabor
- ✅ catálogo › Kombucha Uva tem notas de sabor
- ✅ catálogo › Kombucha Uva Branca tem notas de sabor
- ✅ catálogo › Ice Limão tem notas de sabor
- ✅ catálogo › Ice Abacaxi tem notas de sabor
- ✅ catálogo › Ice Melancia tem notas de sabor
- ✅ catálogo › Ice Maracujá tem notas de sabor
- ✅ notasDaFoto › funciona com .png, .jpg e caminho completo
- ✅ notasDaFoto › produto sem nota devolve null (não quebra a tela)

### `src/app/api/crm/estado/route.test.ts` — RF04–RF07 + RF05 no servidor

- ✅ GET /api/crm/estado › devolve produtos, clientes e pedidos no formato do painel
- ✅ PUT /api/crm/estado — regras do RF05 no servidor › grava estado válido (dentro de uma transação)
- ✅ PUT /api/crm/estado — regras do RF05 no servidor › recusa pedido do site 'confirmado' sem cliente — e não grava nada
- ✅ PUT /api/crm/estado — regras do RF05 no servidor › aceita pedido do site 'novo' sem cliente
- ✅ PUT /api/crm/estado — regras do RF05 no servidor › recusa pedido de cliente que não existe
- ✅ PUT /api/crm/estado — regras do RF05 no servidor › recusa pedido sem itens
- ✅ PUT /api/crm/estado — regras do RF05 no servidor › status desconhecido é gravado como 'novo' (não some do quadro)
- ✅ PUT /api/crm/estado — regras do RF05 no servidor › corpo malformado (pedido sem a lista de itens) responde 400, não 500
- ✅ PUT /api/crm/estado — regras do RF05 no servidor › corpo que não é JSON responde 400
- ✅ PUT /api/crm/estado — regras do RF05 no servidor › erro do banco vira 500 com mensagem curta

### `src/app/api/pedido-do-site/route.test.ts` — RF02 + segurança (preço do banco)

- ✅ POST /api/pedido-do-site › registra o pedido como 'novo', origem 'Site', sem cliente
- ✅ POST /api/pedido-do-site › usa o PREÇO DO BANCO, ignorando preço enviado pelo navegador
- ✅ POST /api/pedido-do-site › quantidade padrão é 1
- ✅ POST /api/pedido-do-site › recusa quantidade inválida (0)
- ✅ POST /api/pedido-do-site › recusa quantidade inválida (-2)
- ✅ POST /api/pedido-do-site › recusa quantidade inválida (51)
- ✅ POST /api/pedido-do-site › recusa quantidade inválida (1.5)
- ✅ POST /api/pedido-do-site › recusa quantidade inválida (abc)
- ✅ POST /api/pedido-do-site › recusa sem produto
- ✅ POST /api/pedido-do-site › produto desligado no CRM não pode ser pedido (404)
- ✅ POST /api/pedido-do-site › produto inexistente: 404
- ✅ POST /api/pedido-do-site › corpo que não é JSON: 400 (não derruba o servidor)

### `src/lib/auth.test.ts` — RF03 / RNF03 (login do dono)

- ✅ login do dono (fallback local) › e-mail e senha certos: entra como dono
- ✅ login do dono (fallback local) › senha errada: não entra
- ✅ login do dono (fallback local) › e-mail de outra pessoa: não entra (mesmo com a senha certa)
- ✅ login do dono (fallback local) › e-mail com maiúsculas ou espaços (digitado no celular) também entra
- ✅ login do dono (fallback local) › campos vazios: não entra
- ✅ login do dono (fallback local) › servidor sem senha configurada: ninguém entra (falha fechada)
- ✅ configuração › sessão em JWT e tela de login própria
- ✅ configuração › com o Cognito configurado, o login local é desligado

### `src/lib/categorias.test.ts` — RF01 (linhas de produto e menu)

- ✅ linhas de produto › são exatamente licor, kombucha e ice (o mesmo campo 'categoria' do banco)
- ✅ linhas de produto › cada linha aponta para uma página que existe (sem link quebrado no menu)
- ✅ linhas de produto › título e destaque combinam (a palavra em destaque está no título)

### `src/lib/maisPedido.test.ts` — RF01 (selo 'Mais pedido')

- ✅ maisPedidoId › devolve o produto campeão quando tem 3+ unidades
- ✅ maisPedidoId › não elege ninguém com menos de 3 unidades (pedido de teste solto)
- ✅ maisPedidoId › banco sem pedidos: sem selo
- ✅ maisPedidoId › ignora pedidos cancelados na consulta

### `src/lib/regrasPedido.test.ts` — RF05 (pedido com cliente e itens)

- ✅ validarPedido — pedido com cliente › aceita pedido completo de cliente existente
- ✅ validarPedido — pedido com cliente › aceita qualquer etapa quando há cliente
- ✅ validarPedido — pedido com cliente › recusa cliente que não existe mais (o banco recusaria pela chave estrangeira)
- ✅ validarPedido — itens › recusa pedido sem itens
- ✅ validarPedido — itens › recusa item sem produto
- ✅ validarPedido — itens › recusa quantidade inválida (0)
- ✅ validarPedido — itens › recusa quantidade inválida (-1)
- ✅ validarPedido — itens › recusa quantidade inválida (1.5)
- ✅ validarPedido — itens › recusa quantidade inválida (NaN)
- ✅ validarPedido — itens › recusa preço inválido (-0.01)
- ✅ validarPedido — itens › recusa preço inválido (NaN)
- ✅ validarPedido — itens › aceita preço zero (brinde)
- ✅ validarPedido — pedido do site sem cliente › aceita enquanto está 'novo'
- ✅ validarPedido — pedido do site sem cliente › aceita 'cancelado' (descartar um pedido que não virou venda)
- ✅ validarPedido — pedido do site sem cliente › recusa 'confirmado' sem cliente associado
- ✅ validarPedido — pedido do site sem cliente › recusa 'rota' sem cliente associado
- ✅ validarPedido — pedido do site sem cliente › recusa 'entregue' sem cliente associado
- ✅ validarPedido — pedido do site sem cliente › recusa pedido sem cliente que NÃO veio do site
- ✅ auxiliares › podeFicarSemCliente só para novo e cancelado
- ✅ auxiliares › totalDoPedido soma quantidade × preço

### `src/lib/status.test.ts` — RF05 (etapas do pedido)

- ✅ status do pedido › tem as 5 etapas do quadro, na ordem
- ✅ status do pedido › pedido novo começa em 'novo'
- ✅ status do pedido › reconhece só valores da lista

### `src/lib/whatsapp.test.ts` — RF02 (WhatsApp com mensagem pronta)

- ✅ whatsappLinkForProduct › abre o wa.me do número configurado com a mensagem do produto
- ✅ whatsappLinkForProduct › codifica acentos e & no texto (não quebra a URL)
- ✅ whatsappLinkForProduct › sem variável configurada, usa o número fixo da Maruim
- ✅ WHATSAPP_DISPLAY › formata o número para exibir: (47) 9 9240-1430
- ✅ WHATSAPP_DISPLAY › número em formato inesperado aparece como veio (sem inventar)

### `src/middleware.test.ts` — RNF03 (CRM só com login)

- ✅ middleware de login › protege o painel, a área /crm e a API do CRM
- ✅ middleware de login › NÃO protege a API pública do pedido do site
- ✅ middleware de login › sem sessão: bloqueia o painel
- ✅ middleware de login › com sessão: libera
- ✅ middleware de login › a própria tela de login fica liberada (senão seria um laço)

### `src/painel/dados.test.ts` — RF04 (clientes), RF05, RF07 (estoque)

- ✅ carregar › traz o estado do banco e corrige caminho antigo de foto
- ✅ pedidos › totalPedido soma os itens
- ✅ pedidos › novo pedido recebe o próximo número, status 'novo', baixa o estoque e salva no banco
- ✅ pedidos › estoque nunca fica negativo
- ✅ pedidos › editar pedido não cria outro nem mexe no número
- ✅ pedidos › excluirPedido remove só aquele
- ✅ clientes (RF04) › cadastra cliente novo com id e data
- ✅ clientes (RF04) › edita cliente existente sem duplicar
- ✅ clientes (RF04) › excluirCliente remove o cliente e os pedidos dele (os do site sem dono ficam)
- ✅ clientes (RF04) › limparClientes mantém só os pedidos do site sem cliente
- ✅ clientes (RF04) › cliente(null) não quebra (pedido do site)
- ✅ salvar › cliques em sequência não geram fila: no máximo 1 envio extra
- ✅ salvar › erro do banco chega ao aviso da tela
- ✅ salvar › embaralhar gera dados de exemplo válidos para as regras do RF05

### `src/painel/graficos.test.ts` — painel (relatórios visuais)

- ✅ área › desenha um ponto por dia e uma área clicável por dia
- ✅ área › clicar num dia chama aoClicar com aquele dia
- ✅ área › sem dados não quebra
- ✅ barras › destaca a maior barra em âmbar
- ✅ barras › encurta rótulo longo com reticências
- ✅ rosca › uma fatia por valor maior que zero e legenda com todos
- ✅ rosca › tudo zero não quebra

### `src/painel/util.test.ts` — segurança (XSS), telefone, datas

- ✅ esc — proteção contra XSS › transforma HTML em texto
- ✅ esc — proteção contra XSS › escapa aspas simples (usadas nos atributos do painel)
- ✅ esc — proteção contra XSS › null e undefined viram texto vazio
- ✅ telefone › formata celular e fixo
- ✅ telefone › normalizarTelefone guarda só DDD + número (sem o 55 do país)
- ✅ telefone › normalizarTelefone não corta número que só começa com 55 por acaso
- ✅ formatos › dinheiro em reais
- ✅ formatos › datas dd/mm e aaaa-mm-dd
- ✅ formatos › iniciais e nome curto
- ✅ formatos › variação percentual
- ✅ achar elementos na tela › $ acha, $talvez devolve null e $$ devolve lista
- ✅ achar elementos na tela › $ dá erro claro se o HTML do painel mudar

## Bugs que os testes encontraram (e foram corrigidos)

1. **API do CRM respondia erro interno (500) a dados malformados** → agora valida com Zod e responde 400 sem gravar.
2. **Telefone digitado com +55 gerava link do WhatsApp errado** (wa.me/555547…) → `normalizarTelefone`.
3. **Login recusava e-mail com letra maiúscula/espaço** (teclado do celular) → comparação normalizada.
