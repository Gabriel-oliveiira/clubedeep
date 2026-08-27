import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import { carregarDados } from '@/lib/dados';
import ExtratoPontos from '@/components/ExtratoPontos';

export const dynamic = 'force-dynamic';

export default async function ClienteExtrato() {
  const a = await getAcesso();
  if (!a) redirect('/login');
  if (a.papel !== 'cliente') redirect('/');

  const dados = await carregarDados(a.cd_cliente);

  return (
    <>
      <div className="page-head">
        <div><h1>Extrato de pontos</h1><div className="sub">Todos os lancamentos que somam ou expiram do seu saldo.</div></div>
      </div>
      <ExtratoPontos extrato={dados.extrato} />
    </>
  );
}
