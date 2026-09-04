'use client';
import { useState } from 'react';
import { brl, dataBR } from '@/lib/format';

const VALOR = { prata: 100, ouro: 200, platina: 500 };
const MES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const labelPeriodo = (p) => { if (!p) return ''; const [y, m] = p.split('-'); return `${MES[+m] || m}/${y}`; };

export default function VoucherMes({ nivel, voucherInicial, historico = [] }) {
  const valor = VALOR[nivel];
  const [voucher, setVoucher] = useState(voucherInicial || null);
  const [lista, setLista] = useState(historico);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [copiado, setCopiado] = useState(false);

  if (!valor) return null; // Bronze / sem nivel nao tem voucher

  async function resgatar() {
    setLoading(true); setMsg(null);
    const r = await fetch('/api/cliente/voucher', { method: 'POST' });
    const j = await r.json().catch(() => ({}));
    setLoading(false);
    if (j.ok && j.voucher) {
      setVoucher(j.voucher);
      setLista(prev => [j.voucher, ...prev.filter(x => x.id !== j.voucher.id)]);
    } else {
      const t = { totvs: 'Nao foi possivel gerar agora. Tente novamente em instantes.', em_processamento: 'Gerando seu voucher, aguarde um instante...', bloqueado: 'Sua conta esta bloqueada.', sem_voucher: 'Seu nivel ainda nao tem voucher.' };
      setMsg({ txt: t[j.erro] || 'Nao foi possivel resgatar o voucher.', detalhe: j.detalhe || null });
    }
  }

  function copiar() {
    if (!voucher?.voucher_code) return;
    navigator.clipboard?.writeText(voucher.voucher_code).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 1500); }).catch(() => {});
  }

  return (
    <div className="card" style={{ borderTop: '3px solid var(--brand-2,#c99a5b)' }}>
      <h2>Voucher do mes — {brl(valor)}</h2>

      {voucher?.voucher_code ? (
        <>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 0 }}>
            Seu voucher deste mes esta pronto. Apresente o codigo no fechamento do pedido — desconto de {brl(valor)} direto na nota, para compras a partir de R$ 2.500.
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="num" style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1, background: '#f4ede5', padding: '10px 16px', borderRadius: 10 }}>{voucher.voucher_code}</span>
            <button type="button" className="btn-ghost" onClick={copiar}>{copiado ? 'Copiado!' : 'Copiar'}</button>
          </div>
          {voucher.valido_ate && <small className="muted" style={{ display: 'block', marginTop: 8 }}>Valido ate {dataBR(voucher.valido_ate)}.</small>}
        </>
      ) : (
        <>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 0 }}>
            Resgate seu voucher de {brl(valor)} de desconto direto na nota, valido este mes para compras a partir de R$ 2.500. Um por mes.
          </p>
          <button type="button" onClick={resgatar} disabled={loading}>{loading ? 'Gerando...' : `Resgatar voucher de ${brl(valor)}`}</button>
        </>
      )}
      {msg && (
        <div className="msg err" style={{ marginTop: 12 }}>
          {msg.txt}
          {msg.detalhe && <div style={{ marginTop: 6, fontSize: 11.5, opacity: .8, wordBreak: 'break-word' }}>Detalhe: {msg.detalhe}</div>}
        </div>
      )}

      {lista.length > 0 && (
        <div style={{ marginTop: 16, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
          <div className="sub" style={{ fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>MEUS VOUCHERS</div>
          {lista.map((v, i) => (
            <div key={v.id || i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12.5, padding: '4px 0' }}>
              <span className="num">{labelPeriodo(v.periodo_ref)} · {brl(v.valor)} · <b>{v.voucher_code || '—'}</b></span>
              <span className="muted">{dataBR(v.dt_gerado)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
