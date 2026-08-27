import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import { carregarDados } from '@/lib/dados';
import { pontos, labelCategoria, labelEvento, dataBR } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function ClienteTrajetoria() {
  const a = await getAcesso();
  if (!a) redirect('/login');
  if (a.papel !== 'cliente') redirect('/');

  const dados = await carregarDados(a.cd_cliente);
  const trajetoria = dados.trajetoria || [];

  return (
    <>
      <div className="page-head">
        <div><h1>Minha trajetoria</h1><div className="sub">Como seu nivel evoluiu ao longo do tempo.</div></div>
      </div>

      <div className="card flush">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Quando</th><th>Evento</th><th>De</th><th>Para</th><th style={{ textAlign: 'right' }}>Pontos</th></tr></thead>
            <tbody>
              {trajetoria.map((h, i) => (
                <tr key={i}>
                  <td className="num">{dataBR(h.criado_em)}</td>
                  <td>{labelEvento(h.evento)}</td>
                  <td>{h.categoria_anterior ? <span className={`badge ${h.categoria_anterior}`}>{labelCategoria(h.categoria_anterior)}</span> : '-'}</td>
                  <td><span className={`badge ${h.categoria_nova}`}>{labelCategoria(h.categoria_nova)}</span></td>
                  <td style={{ textAlign: 'right' }} className="num">{pontos(h.pontos_no_momento)}</td>
                </tr>
              ))}
              {trajetoria.length === 0 && <tr><td colSpan={5}><div className="empty">Sem mudancas de nivel registradas ainda.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
