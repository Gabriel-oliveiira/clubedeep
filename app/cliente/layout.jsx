import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import SidebarCliente from '@/components/SidebarCliente';

export const dynamic = 'force-dynamic';

export default async function ClienteLayout({ children }) {
  const a = await getAcesso();
  if (!a) redirect('/login');
  if (!a.papel) redirect('/acesso-negado');
  if (a.papel === 'admin' || a.papel === 'comercial') redirect('/dashboard');
  if (a.papel === 'loja') redirect('/loja');

  return (
    <div className="shell cli-shell">
      <SidebarCliente nome={a.nome} email={a.email} />
      <div className="main">
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
