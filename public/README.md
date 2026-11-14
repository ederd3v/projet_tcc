# 📁 public — arquivos servidos direto (imagens e fontes)

Tudo aqui sai pelo CDN da AWS (CloudFront do Amplify) sem passar pelo código.
O caminho do arquivo é o endereço: `public/products/licor-figo.jpg` → `/products/licor-figo.jpg`.

```
public/
├── products/   fotos dos 22 produtos: .png (no banco, alta qualidade) + .jpg (vitrine, leve)
│               lineup.jpg = capa da home · faixa-rodape.jpg = faixa final da home
├── brand/      logo e selo da Maruim (usados como máscara: mudam de cor com o tema)
├── sobre/      fotos reais da página Sobre
└── painel/assets/
    ├── fonts/  fontes do painel
    └── img/    fotos antigas do painel (usadas só se o banco estiver vazio)
```

**Por que .png e .jpg do mesmo produto?** O banco guarda o `.png`; a vitrine
mostra o `.jpg`, que é muito mais leve. Isso ajudou a nota do Lighthouse.
O teste `prisma/catalogo.test.ts` garante que os dois existem para todos os produtos.
