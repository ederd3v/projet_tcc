# 📁 src/components — os "pedaços" do site público

Cada arquivo é um bloco reutilizável da landing (componente React).
As páginas de `src/app/(site)/` montam a tela juntando estes blocos.

| Componente | O que é |
|---|---|
| `Header.tsx` | cabeçalho: logo, menu, tema claro/escuro, botão Pedir |
| `Hero.tsx` | capa da home (foto das garrafas + título) — o LCP do Lighthouse |
| `Marquee.tsx` | faixa de nomes que corre embaixo da capa |
| `SecaoTitulo.tsx` | título padrão das seções |
| `CardDestaque.tsx` | card de destaque da home (4 por linha) |
| `CategoryPage.tsx` | modelo das vitrines /licores, /kombuchas, /ice |
| `ProductCard.tsx` | card de um produto (foto, nome, preço, botão) |
| `FotoComNotas.tsx` | foto que mostra as notas de sabor ao passar o mouse |
| `BotaoPedir.tsx` | ⭐ "Pedir no WhatsApp": abre o resumo, registra no CRM e abre o WhatsApp |
| `FaixaRodape.tsx` | faixa final da home que cresce ao rolar |
| `SecaoContato.tsx` | bloco de contato (home e Sobre) |
| `Footer.tsx` | rodapé (+ botão flutuante do WhatsApp) |
| `WhatsFlutuante.tsx` | botão do WhatsApp fixo no canto |
| `BotaoTema.tsx` | sol/lua: tema claro e escuro |
| `Revela.tsx` | efeito de surgir ao rolar |
| `SeloMaruim.tsx` | logo e selo da marca (mudam de cor com o tema) |
| `IconeWhatsApp.tsx` | ícone do WhatsApp |
| `lab/LabDemos.tsx` | demonstrações do /lab (só no computador) |

**O caminho de um pedido:** `ProductCard` → `BotaoPedir` → `POST /api/pedido-do-site`
→ o pedido aparece no painel, na coluna "Novo".
