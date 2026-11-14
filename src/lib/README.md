# 📁 src/lib — código COMPARTILHADO (site + painel + APIs)

Funções que mais de uma parte do sistema usa. Ficam aqui para existir
**uma vez só**: mudou a regra, mudou para todo mundo.

| Arquivo | O que faz | Teste |
|---|---|---|
| `prisma.ts` | a conexão única com o banco PostgreSQL | — |
| `auth.ts` | regra de login do dono (e-mail + senha com hash bcrypt; Cognito pronto) | `auth.test.ts` |
| `regrasPedido.ts` | ⭐ regras do pedido (RF05), usadas no painel E na API | `regrasPedido.test.ts` |
| `status.ts` | as 5 etapas do pedido (novo → entregue / cancelado) | `status.test.ts` |
| `whatsapp.ts` | monta o link wa.me com a mensagem do produto (RF02) | `whatsapp.test.ts` |
| `categorias.ts` | as 3 linhas: licor, kombucha, ice (rota, título, texto) | — |
| `notas.ts` | notas de sabor de cada produto (hover da foto) | `prisma/catalogo.test.ts` |
| `maisPedido.ts` | calcula o selo "★ Mais pedido" pelos pedidos reais | `maisPedido.test.ts` |

**Na banca:** as regras de negócio são **funções puras** (recebem dados e
devolvem resposta, sem mexer em tela nem banco). Por isso dá para testar
cada uma isoladamente — é o que os arquivos `.test.ts` fazem.
