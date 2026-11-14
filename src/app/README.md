# 📁 src/app — as PÁGINAS e as ROTAS do sistema

No Next.js (App Router), **cada pasta aqui dentro vira um endereço** do site.
`page.tsx` é a tela e `route.ts` é uma API, ou seja, um endereço que devolve dados em vez de tela.

```
app/
├── layout.tsx        moldura raiz de TODAS as páginas: <html>, fontes, script do tema
├── globals.css       CSS do site (Tailwind)
├── icon.png          ícone da aba do navegador
│
├── (site)/           SITE PÚBLICO. Os parênteses não aparecem na URL
│   ├── layout.tsx    carrega o CSS do site
│   ├── page.tsx      /            → home
│   ├── licores/      /licores     → vitrine de licores
│   ├── kombuchas/    /kombuchas   → vitrine de kombuchas
│   ├── ice/          /ice         → vitrine dos Ice
│   ├── sobre/        /sobre       → história, fotos reais e contato
│   ├── contato/      /contato     → redireciona para /sobre#contato
│   ├── crm/login/    /crm/login   → tela de login do dono
│   └── lab/          /lab         → ideias de design (só no computador; no ar dá 404)
│
├── painel/           /painel      → o CRM (só com login)
│   ├── layout.tsx    carrega o CSS do painel
│   └── page.tsx      põe o painel na tela e chama iniciarPainel() (ver src/painel/)
│
└── api/              as APIs (ver api/README.md)
```

**Na banca:** o site e o painel têm visuais diferentes, por isso ficam em
grupos separados (`(site)` e `painel`), cada um com o seu CSS. Quem decide
quem pode entrar no painel é o `src/middleware.ts`, que roda antes das páginas.
