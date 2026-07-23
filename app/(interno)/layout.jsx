import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import Sidebar from '@/components/Sidebar';

export const dynamic = 'force-dynamic';

export default async function InternoLayout({ children }) {
  const a = await getAcesso();
  if (!a) redirect('/login');
  if (!a.papel) redirect('/acesso-negado');
  if (a.papel === 'loja') redirect('/loja');

  return (
    <div className="shell">
      <Sidebar email={a.email} papel={a.papel} />
      <div className="main">
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
