import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import UsuariosAdmin from '@/components/UsuariosAdmin';

export const dynamic = 'force-dynamic';

export default async function Configuracoes() {
  const a = await getAcesso();
  if (!a || a.papel !== 'admin') redirect('/dashboard');

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Configuracoes</h1>
          <div className="sub">Gestao do painel do Clube DEEP</div>
        </div>
      </div>
      <UsuariosAdmin meuEmail={a.email} />
    </>
  );
}
