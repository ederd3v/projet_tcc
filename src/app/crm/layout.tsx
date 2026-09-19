import { CrmProviders } from "./providers";
import { CrmNav } from "./CrmNav";

// Proteção real de rota fica no middleware.ts (matcher /crm/:path, exceto
// /crm/login). Este layout só cuida de UI (SessionProvider + nav).
export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <CrmProviders>
      <div className="halo-bg min-h-screen">
        <CrmNav />
        <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
      </div>
    </CrmProviders>
  );
}
