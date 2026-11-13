/** @type {import('next').NextConfig} */

// Cache das imagens públicas (fotos e logo). Um dia de cache + uma semana
// servindo a cópia antiga enquanto revalida: se uma foto for trocada mantendo
// o nome, ela aparece no dia seguinte, sem precisar mudar código.
const CACHE_PUBLICO = "public, max-age=86400, stale-while-revalidate=604800";

const nextConfig = {
  images: {
    // Qualidades usadas pelo <Image> (capa 75, faixa 90, cards 85, padrão 75).
    qualities: [75, 85, 90],
    // AVIF primeiro (bem menor que WebP); quem não suporta recebe WebP.
    formats: ["image/avif", "image/webp"],
    // As versões otimizadas ficam um dia em cache (antes: 60 s).
    minimumCacheTTL: 86400,
  },
  async headers() {
    return [
      { source: "/brand/:path*", headers: [{ key: "Cache-Control", value: CACHE_PUBLICO }] },
      { source: "/products/:path*", headers: [{ key: "Cache-Control", value: CACHE_PUBLICO }] },
      { source: "/sobre/:path*", headers: [{ key: "Cache-Control", value: CACHE_PUBLICO }] },
    ];
  },
  // O painel (src/painel/index.html) é lido do disco pela rota /painel.
  // Sem isto, o build de produção não leva o arquivo junto e o Amplify
  // responde erro ao abrir o painel.
  outputFileTracingIncludes: {
    "/painel": ["./src/painel/index.html"],
  },
};

export default nextConfig;
