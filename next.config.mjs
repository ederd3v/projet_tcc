/** @type {import('next').NextConfig} */
const nextConfig = {
  // O painel (src/painel/index.html) é lido do disco pela rota /painel.
  // Sem isto, o build de produção não leva o arquivo junto e o Amplify
  // responde erro ao abrir o painel.
  outputFileTracingIncludes: {
    "/painel": ["./src/painel/index.html"],
  },
};

export default nextConfig;
