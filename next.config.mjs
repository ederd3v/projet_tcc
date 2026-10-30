/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Amazon S3 — onde ficam as fotos de produto em produção (RFC 6.2 / RF07).
      { protocol: "https", hostname: "*.s3.*.amazonaws.com" },
      { protocol: "https", hostname: "*.cloudfront.net" },
    ],
  },

  async rewrites() {
    return [
      // O painel de gestão é HTML puro, servido de public/painel. O Next não
      // resolve index.html de pasta em /public: só entrega o caminho exato.
      // Esta reescrita faz /painel entregar o arquivo mantendo a URL limpa —
      // sem ela a rota cai em 404 depois do login.
      { source: "/painel", destination: "/painel/index.html" },
    ];
  },
};

export default nextConfig;
