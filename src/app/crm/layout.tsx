import { CrmProviders } from "./providers";

// Sobrou só o login aqui: o painel de gestão é servido de /painel, em HTML
// puro. Este layout existe para dar o SessionProvider à tela de login.
// A proteção de rota fica no middleware.ts.
export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <CrmProviders>
      <div className="halo-bg min-h-screen">{children}</div>
    </CrmProviders>
  );
}
