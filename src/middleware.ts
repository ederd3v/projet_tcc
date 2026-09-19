import { withAuth } from "next-auth/middleware";

// RNF03 / RF03: rota do CRM sem sessão válida → redireciona pro login.
// A própria /crm/login fica liberada (senão vira loop de redirect pra ela mesma).
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
  matcher: ["/crm", "/crm/:path*"],
};
