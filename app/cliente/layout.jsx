import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import LogoutButton from '@/components/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function ClienteLayout({ children }) {
  const a = await getAcesso();
  if (!a) redirect('/login');
  if (!a.papel) redirect('/acesso-negado');
  // equipe tem a propria area
  if (a.papel === 'admin' || a.papel === 'comercial') redirect('/dashboard');
  if (a.papel === 'loja') redirect('/loja');

  return (
    <>
      <div className="topbar">
        <img src="/deep-logo.png" alt="DEEP" />
        <div className="nav">
          <span style={{ opacity: .65, fontSize: 12.5 }}>{a.nome || a.email}</span>
          <LogoutButton />
        </div>
      </div>
      <div className="container">{children}</div>
    </>
  );
}
