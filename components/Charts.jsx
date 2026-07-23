// Graficos SVG server-rendered, sem dependencias
import { pontos } from '@/lib/format';

const CORES_CAT = {
  platina: 'var(--platina)', ouro: 'var(--ouro)', prata: 'var(--prata)',
  bronze: 'var(--bronze)', sem_categoria: 'var(--semcat)',
};

// Donut de distribuicao por categoria
export function DonutCategorias({ dados, labelFn }) {
  const total = dados.reduce((a, d) => a + d.valor, 0);
  if (!total) return <div className="empty">Sem dados ainda.</div>;
  const R = 62, C = 2 * Math.PI * R;
  let acc = 0;
  const segs = dados.filter(d => d.valor > 0).map(d => {
    const frac = d.valor / total;
    const seg = { ...d, dash: frac * C, off: -acc * C };
    acc += frac;
    return seg;
  });
  return (
    <div className="chart-wrap">
      <svg width="170" height="170" viewBox="0 0 170 170">
        <circle cx="85" cy="85" r={R} fill="none" stroke="#f0eae2" strokeWidth="20" />
        {segs.map((s, i) => (
          <circle key={i} cx="85" cy="85" r={R} fill="none"
            stroke={CORES_CAT[s.chave] || 'var(--brand-2)'} strokeWidth="20"
            strokeDasharray={`${Math.max(s.dash - 1.5, 0.1)} ${C}`} strokeDashoffset={s.off}
            transform="rotate(-90 85 85)" strokeLinecap="butt" />
        ))}
        <text x="85" y="82" textAnchor="middle" className="donut-center" fill="var(--ink)" fontSize="24" fontWeight="700">{pontos(total)}</text>
        <text x="85" y="100" textAnchor="middle" fill="var(--muted)" fontSize="10.5">clientes</text>
      </svg>
      <div className="legend">
        {dados.map((d, i) => (
          <div className="li" key={i}>
            <span className="dot" style={{ background: CORES_CAT[d.chave] || 'var(--brand-2)' }} />
            {labelFn ? labelFn(d.chave) : d.chave}
            <b>{pontos(d.valor)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

// Barras mensais (pontos ganhos x abatidos)
export function BarrasMensais({ meses }) {
  if (!meses.length) return <div className="empty">Sem movimento nos ultimos meses.</div>;
  const max = Math.max(...meses.map(m => Math.max(m.ganhos, m.abatidos)), 1);
  const NOMES = { '01':'Jan','02':'Fev','03':'Mar','04':'Abr','05':'Mai','06':'Jun','07':'Jul','08':'Ago','09':'Set','10':'Out','11':'Nov','12':'Dez' };
  return (
    <>
      <div className="bars">
        {meses.map((m, i) => (
          <div className="bar-col" key={i} title={`${NOMES[m.mes.slice(5)] || m.mes}/${m.mes.slice(0, 4)} — Ganhos: ${pontos(m.ganhos)} · Devolucoes: ${pontos(m.abatidos)}`}>
            <div className="bar-duo">
              <div className="bar ganho" style={{ height: `${(m.ganhos / max) * 100}%` }} />
              <div className="bar abatido" style={{ height: `${(m.abatidos / max) * 100}%` }} />
            </div>
            <span className="bar-lbl">{NOMES[m.mes.slice(5)] || m.mes}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 18, marginTop: 14, fontSize: 12, color: 'var(--muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span className="dot" style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--brand-2)', display: 'inline-block' }} /> Pontos ganhos</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span className="dot" style={{ width: 9, height: 9, borderRadius: 3, background: '#e3d2c0', display: 'inline-block' }} /> Abatidos (devolucoes)</span>
      </div>
    </>
  );
}

// Barras horizontais (rankings)
export function BarrasH({ itens, format }) {
  if (!itens.length) return <div className="empty">Sem dados ainda.</div>;
  const max = Math.max(...itens.map(i => i.valor), 1);
  return (
    <div>
      {itens.map((it, i) => (
        <div className="hbar-row" key={i}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={it.label}>{it.label}</span>
          <div className="hbar-track"><div className="hbar-fill" style={{ width: `${(it.valor / max) * 100}%` }} /></div>
          <b>{format ? format(it.valor) : pontos(it.valor)}</b>
        </div>
      ))}
    </div>
  );
}
