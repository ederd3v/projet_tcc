import { withAuth } from "next-auth/middleware";

// RNF03 / RF03: área interna sem sessão válida → redireciona pro login.
//
// Cobre três coisas:
//  • /painel      — o painel de gestão (HTML servido de public/painel)
//  • /crm         — a tela de login e o que restar da área antiga
//  • /api/crm/*   — a API que o painel consome; sem isto, proteger a tela
//                   seria teatro, porque os dados sairiam pela API mesmo.
//
// A própria /crm/login fica liberada, senão vira laço de redirecionamento.
export default withAuth({
  pages: { signIn: "/crm/login" },
  callbacks: {
    authorized: ({ token, req }) => {
      if (req.nextUrl.pathname.startsWith("/crm/login")) return true;
      return !!token;
    },
  },
});

export const config = {
  matcher: ["/crm", "/crm/:path*", "/painel", "/painel/:path*", "/api/crm/:path*"],
};
