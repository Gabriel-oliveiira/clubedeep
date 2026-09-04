'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { labelPeriodicidade, labelFormaEntrega, labelCategoria, dataBR } from '@/lib/format';
import { periodoAtual, labelPeriodoRef } from '@/lib/periodo';

export default function BeneficiosClienteAdmin({ cdCliente, nivel, beneficios = [], resgatesIniciais = [] }) {
  const router = useRouter();
  const [resgates, setResgates] = useState(resgatesIniciais);
  const [busy, setBusy] = useState(null);

  const temResgate = (bid, per) => resgates.some(r => r.beneficio_id === bid && r.periodo_ref === per);

  async function marcar(b) {
    const per = periodoAtual(b.periodicidade);
    setBusy(b.id);
    const r = await fetch('/api/beneficios/resgate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ beneficio_id: b.id, cd_cliente: cdCliente }),
    });
    setBusy(null);
    if (r.ok) { setResgates(prev => [{ beneficio_id: b.id, periodo_ref: per, dt_resgate: new Date().toISOString() }, ...prev.filter(x => !(x.beneficio_id === b.id && x.periodo_ref === per))]); router.refresh(); }
    else alert('Nao foi possivel registrar.');
  }
  async function desfazer(b) {
    const per = periodoAtual(b.periodicidade);
    if (!confirm('Desfazer a baixa deste beneficio no periodo atual?')) return;
    setBusy(b.id);
    const r = await fetch('/api/beneficios/resgate', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ beneficio_id: b.id, cd_cliente: cdCliente, periodo_ref: per }),
    });
    setBusy(null);
    if (r.ok) { setResgates(prev => prev.filter(x => !(x.beneficio_id === b.id && x.periodo_ref === per))); router.refresh(); }
    else alert('Nao foi possivel desfazer.');
  }

  const titulos = Object.fromEntries(beneficios.map(b => [b.id, b.titulo]));
  const historico = [...resgates].sort((a, b) => new Date(b.dt_resgate) - new Date(a.dt_resgate));

  return (
    <div className="card flush">
      <div className="card-pad"><h2 style={{ margin: 0 }}>Beneficios do cliente ({labelCategoria(nivel)})</h2></div>

      {beneficios.length === 0 ? (
        <div className="empty" style={{ padding: 20 }}>Cliente sem nivel ou sem beneficios cadastrados para o nivel.</div>
      ) : beneficios.map((b, i) => {
        const per = periodoAtual(b.periodicidade);
        const ok = temResgate(b.id, per);
        const forma = b.forma_entrega || 'equipe';
        return (
          <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '12px 16px', borderTop: i ? '1px solid var(--linha,#f0eae2)' : 0 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <b>{b.titulo}</b> <span className="chip" style={{ background: '#efe6db', color: 'var(--brand)' }}>{labelPeriodicidade(b.periodicidade)}</span> <span className="chip" style={{ background: '#eef2f6', color: '#3a5673' }}>{labelFormaEntrega(forma)}</span>
              {forma === 'equipe' && <span className="sub">Periodo atual: {labelPeriodoRef(per)}{ok ? ' · entregue' : ' · pendente'}</span>}
            </div>
            {forma !== 'equipe' ? (
              <span className="chip" style={{ background: '#f4ede5', color: 'var(--muted)' }}>
                {forma === 'automatico' ? 'Automático — não requer baixa' : 'Resgate pela cliente'}
              </span>
            ) : ok ? (
              <>
                <span className="chip ativa">✓ Entregue</span>
                <button type="button" className="btn-ghost" disabled={busy === b.id} onClick={() => desfazer(b)}>Desfazer</button>
              </>
            ) : (
              <button type="button" disabled={busy === b.id} onClick={() => marcar(b)}>{busy === b.id ? '...' : 'Marcar entregue'}</button>
            )}
          </div>
        );
      })}

      {historico.length > 0 && (
        <div style={{ padding: '14px 16px', borderTop: '2px solid var(--linha,#f0eae2)' }}>
          <div className="sub" style={{ fontWeight: 700, marginBottom: 8, color: 'var(--muted)' }}>HISTORICO DE RESGATES</div>
          {historico.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12.5, padding: '4px 0' }}>
              <span>{titulos[r.beneficio_id] || 'Beneficio'} · <span className="muted">{labelPeriodoRef(r.periodo_ref)}</span></span>
              <span className="muted num">{dataBR(r.dt_resgate)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
