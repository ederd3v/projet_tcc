/** @type {import('next').NextConfig} */
const nextConfig = {
  // Qualidades usadas pelo <Image> (capa/faixa 90, cards 85, padrão 75).
  images: { qualities: [75, 85, 90] },
  // O painel (src/painel/index.html) é lido do disco pela rota /painel.
  // Sem isto, o build de produção não leva o arquivo junto e o Amplify
  // responde erro ao abrir o painel.
  outputFileTracingIncludes: {
    "/painel": ["./src/painel/index.html"],
  },
};

export default nextConfig;
