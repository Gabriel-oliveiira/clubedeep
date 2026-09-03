import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { rankNivel, labelCategoria, labelPeriodicidade, dataBR } from '@/lib/format';
import { periodoAtual, labelPeriodoRef } from '@/lib/periodo';
import VoucherMes from '@/components/VoucherMes';

export const dynamic = 'force-dynamic';

export default async function BeneficiosCliente() {
  const a = await getAcesso();
  if (!a) redirect('/login');
  if (a.papel !== 'cliente') redirect('/');

  const { data: saldo } = await supabaseAdmin.from('clube_saldos').select('categoria_efetiva').eq('cd_cliente', a.cd_cliente).maybeSingle();
  const nivel = saldo?.categoria_efetiva || 'sem_categoria';

  if (rankNivel(nivel) < 1) {
    return (
      <>
        <div className="page-head"><div><p style={{ margin: '0 0 6px' }}><a className="muted" href="/cliente">&larr; Início</a></p><h1>Meus benefícios</h1></div></div>
        <div className="card">
          <h2>Benefícios liberados a partir do Bronze</h2>
          <p className="muted">Assim que você atingir o nível <b>Bronze</b>, seus benefícios aparecem aqui. Continue comprando para desbloquear.</p>
        </div>
      </>
    );
  }

  const [{ data: todos }, { data: resgates }, { data: vouchers }] = await Promise.all([
    supabaseAdmin.from('clube_beneficios').select('*').eq('ativo', true).order('ordem'),
    supabaseAdmin.from('clube_beneficio_resgates').select('beneficio_id, periodo_ref, dt_resgate').eq('cd_cliente', a.cd_cliente),
    supabaseAdmin.from('clube_vouchers').select('*').eq('cd_cliente', a.cd_cliente).order('dt_gerado', { ascending: false }),
  ]);
  const periodoMes = periodoAtual('mensal');
  const voucherAtual = (vouchers || []).find(v => v.periodo_ref === periodoMes && v.voucher_code) || null;
  const rg = resgates || [];
  const recebidoAtual = (b) => rg.some(r => r.beneficio_id === b.id && r.periodo_ref === periodoAtual(b.periodicidade));
  const tituloDe = Object.fromEntries((todos || []).map(b => [b.id, b.titulo]));
  const historico = [...rg].sort((x, y) => new Date(y.dt_resgate) - new Date(x.dt_resgate));
  const ordenar = (x, y) => (rankNivel(x.nivel_minimo) - rankNivel(y.nivel_minimo)) || (x.ordem - y.ordem);
  // cada nivel tem sua lista completa: mostra os do nivel atual do cliente
  const liberados = (todos || []).filter(b => rankNivel(b.nivel_minimo) === rankNivel(nivel)).sort(ordenar);
  const bloqueados = (todos || []).filter(b => rankNivel(b.nivel_minimo) > rankNivel(nivel)).sort(ordenar);

  return (
    <>
      <div className="page-head">
        <div>
          <p style={{ margin: '0 0 6px' }}><a className="muted" href="/cliente">&larr; Início</a></p>
          <h1>Meus benefícios</h1><div className="sub">Seu nível: {labelCategoria(nivel)}</div>
        </div>
      </div>

      <VoucherMes nivel={nivel} voucherInicial={voucherAtual} historico={vouchers || []} />

      {liberados.length === 0 ? (
        <div className="card"><div className="empty">Nenhum benefício disponível ainda. Em breve!</div></div>
      ) : (
        <div className="grid cols-3">
          {liberados.map(b => (
            <a key={b.id} href={`/cliente/beneficios/${b.id}`} className="card" style={{ borderTop: '3px solid var(--brand-2,#c99a5b)', textDecoration: 'none', color: 'inherit', display: 'block' }}>
              {b.imagem_url && <img src={b.imagem_url} alt="" style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }} />}
              <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                <span className={`badge ${b.nivel_minimo}`}>{labelCategoria(b.nivel_minimo)}</span>
                <span className="chip" style={{ background: '#efe6db', color: 'var(--brand)' }}>{labelPeriodicidade(b.periodicidade)}</span>
                {recebidoAtual(b)
                  ? <span className="chip ativa">✓ Recebido ({labelPeriodoRef(periodoAtual(b.periodicidade))})</span>
                  : <span className="chip" style={{ background: '#f4ede5', color: 'var(--muted)' }}>Disponível</span>}
              </div>
              <h2 style={{ margin: '4px 0' }}>{b.titulo}</h2>
              {b.descricao && <p className="muted" style={{ fontSize: 13.5, marginBottom: 0 }}>{b.descricao}</p>}
            </a>
          ))}
        </div>
      )}

      {historico.length > 0 && (
        <div className="card flush" style={{ marginTop: 8 }}>
          <div className="card-pad"><h2 style={{ margin: 0 }}>Histórico de resgates</h2></div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>Benefício</th><th>Período</th><th>Recebido em</th></tr></thead>
              <tbody>
                {historico.map((r, i) => (
                  <tr key={i}>
                    <td>{tituloDe[r.beneficio_id] || 'Benefício'}</td>
                    <td>{labelPeriodoRef(r.periodo_ref)}</td>
                    <td className="muted num">{dataBR(r.dt_resgate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {bloqueados.length > 0 && (
        <>
          <div className="page-head" style={{ marginTop: 24 }}><div><h2 style={{ margin: 0 }}>Desbloqueie nos próximos níveis</h2></div></div>
          <div className="grid cols-3">
            {bloqueados.map(b => (
              <div key={b.id} className="card" style={{ opacity: .6 }}>
                <span className={`badge ${b.nivel_minimo}`} style={{ marginBottom: 8, display: 'inline-block' }}>{labelCategoria(b.nivel_minimo)}</span>
                <h2 style={{ margin: '4px 0' }}>🔒 {b.titulo}</h2>
                <p className="muted" style={{ fontSize: 12.5, marginBottom: 0 }}>Disponível ao atingir {labelCategoria(b.nivel_minimo)}.</p>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
