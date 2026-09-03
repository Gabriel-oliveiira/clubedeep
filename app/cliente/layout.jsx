import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';
import SidebarCliente from '@/components/SidebarCliente';
import ContaBloqueada from '@/components/ContaBloqueada';

export const dynamic = 'force-dynamic';

export default async function ClienteLayout({ children }) {
  const a = await getAcesso();
  if (!a) redirect('/login');
  if (!a.papel) redirect('/acesso-negado');
  if (a.papel === 'admin' || a.papel === 'comercial') redirect('/dashboard');
  if (a.papel === 'loja') redirect('/loja');

  // cliente inativo/bloqueado: loga, mas fica travado numa tela de bloqueio
  const { data: cli } = await supabaseAdmin.from('clube_clientes').select('situacao').eq('cd_cliente', a.cd_cliente).maybeSingle();
  if (cli?.situacao && cli.situacao !== 'Ativo') {
    return <ContaBloqueada nome={a.nome} />;
  }

  return (
    <div className="shell cli-shell">
      <SidebarCliente nome={a.nome} email={a.email} />
      <div className="main">
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
