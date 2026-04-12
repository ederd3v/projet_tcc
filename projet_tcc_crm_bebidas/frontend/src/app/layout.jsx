export const metadata = {
  title: 'CRM de Bebidas',
  description: 'Projeto TCC - CRM + Site Comercial',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
