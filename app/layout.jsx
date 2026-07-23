import './globals.css';

export const metadata = { title: 'Clube DEEP - Painel', description: 'Painel do Clube DEEP' };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR"><body>{children}</body></html>
  );
}
