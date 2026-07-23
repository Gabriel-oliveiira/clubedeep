import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import LogoutButton from '@/components/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function LojaLayout({ children }) {
  const a = await getAcesso();
  if (!a) redirect('/login');
  if (!a.papel) redirect('/acesso-negado');
  if (a.papel !== 'loja') redirect('/dashboard');
  return (
    <>
      <div className="topbar">
        <img src="/deep-logo.png" alt="DEEP" />
        <div className="nav"><span style={{opacity:.65,fontSize:12.5}}>{a.email}</span><LogoutButton /></div>
      </div>
      <div className="container">{children}</div>
    </>
  );
}
