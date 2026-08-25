import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import PerfilForm from '@/components/PerfilForm';

export const dynamic = 'force-dynamic';

export default async function Perfil() {
  const a = await getAcesso();
  if (!a || !a.papel) redirect('/login');
  const voltar = a.papel === 'cliente' ? '/cliente' : a.papel === 'loja' ? '/loja' : '/dashboard';

  return (
    <div className="container" style={{ maxWidth: 900, margin: '0 auto', padding: '28px 22px' }}>
      <div className="page-head">
        <div>
          <p style={{ margin: '0 0 6px' }}><a className="muted" href={voltar}>&larr; Voltar</a></p>
          <h1>Meu perfil</h1>
          <div className="sub">Atualize seu nome e sua senha.</div>
        </div>
      </div>
      <PerfilForm email={a.email} nomeInicial={a.nome} papel={a.papel} />
    </div>
  );
}
