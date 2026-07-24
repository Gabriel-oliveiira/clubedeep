'use client';
import { useEffect, useState } from 'react';
import { brl, pontos, labelCategoria } from '@/lib/format';
import { IcUsers, IcStar, IcTrend, IcClock } from '@/components/Icons';

const CORES_CAT = {
  platina: 'var(--platina)', ouro: 'var(--ouro)', prata: 'var(--prata)',
  bronze: 'var(--bronze)', sem_categoria: 'var(--semcat)',
};
const ORDEM_CAT = ['platina', 'ouro', 'prata', 'bronze', 'sem_categoria'];
const NOMES_MES = { '01':'Jan','02':'Fev','03':'Mar','04':'Abr','05':'Mai','06':'Jun','07':'Jul','08':'Ago','09':'Set','10':'Out','11':'Nov','12':'Dez' };
const mesLabel = (m) => `${NOMES_MES[m.slice(5)] || m}/${m.slice(2, 4)}`;

export default function DashboardInterativo() {
  const [cat, setCat] = useState(null);
  const [loja, setLoja] = useState(null);
  const [mes, setMes] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = new URLSearchParams();
    if (cat) p.set('cat', cat);
    if (loja) p.set('loja', loja);
    if (mes) p.set('mes', mes);
    setLoading(true);
    fetch(`/api/dashboard?${p.toString()}`)
      .then(r => r.json())
      .then(j => { setData(j); setLoading(false); })
      .catch(() => setLoading(false));
  }, [cat, loja, mes]);

  const temFiltro = cat || loja || mes;
  const k = data?.kpis || { clientes: 0, valor: 0, pontos: 0, transacoes: 0 };
  const saude = data?.saude || { em_carencia: 0, expira_30d: 0 };

  const donut = ORDEM_CAT
    .map(c => ({ chave: c, valor: (data?.por_categoria || []).find(x => x.chave === c)?.valor || 0 }))
    .filter(d => d.valor > 0);
  const meses = data?.mensal || [];
  const lojas = data?.por_loja || [];
  const top = data?.top_clientes || [];

  return (
    <>
      {/* barra de filtros ativos */}
      <div className="filter-bar">
        {cat && <span className="fchip">Nivel: {labelCategoria(cat)} <button className="x" onClick={() => setCat(null)}>&times;</button></span>}
        {loja && <span className="fchip">Loja: {loja} <button className="x" onClick={() => setLoja(null)}>&times;</button></span>}
        {mes && <span className="fchip">Mes: {mesLabel(mes)} <button className="x" onClick={() => setMes(null)}>&times;</button></span>}
        {temFiltro && <button className="limpar" onClick={() => { setCat(null); setLoja(null); setMes(null); }}>Limpar filtros</button>}
      </div>

      <div className={loading ? 'loading-fade' : ''}>
        {/* KPIs */}
        <div className="grid cols-4">
          <div className="card kpi-card">
            <div className="kpi-top"><div className="kpi-ico"><IcUsers /></div></div>
            <div><div className="kpi-val num">{pontos(k.clientes)}</div><div className="kpi-lbl">Clientes com compra {temFiltro ? '(filtro)' : '(180d)'}</div></div>
          </div>
          <div className="card kpi-card ok">
            <div className="kpi-top"><div className="kpi-ico"><IcTrend /></div></div>
            <div><div className="kpi-val num" style={{ fontSize: 24 }}>{brl(k.valor)}</div><div className="kpi-lbl">Faturamento clube</div></div>
          </div>
          <div className="card kpi-card gold">
            <div className="kpi-top"><div className="kpi-ico"><IcStar /></div></div>
            <div><div className="kpi-val num">{pontos(k.pontos)}</div><div className="kpi-lbl">Pontos gerados</div></div>
          </div>
          <div className="card kpi-card">
            <div className="kpi-top"><div className="kpi-ico"><IcClock /></div></div>
            <div><div className="kpi-val num">{pontos(k.transacoes)}</div><div className="kpi-lbl">Transacoes</div></div>
          </div>
        </div>

        <div className="grid dash">
          {/* mensal */}
          <div className="card">
            <h2>Movimento de pontos por mes</h2>
            {meses.length === 0 ? <div className="empty">Sem movimento no periodo.</div> : (
              <>
                <div className="bars">
                  {meses.map((m, i) => {
                    const max = Math.max(...meses.map(x => Math.max(x.ganhos, x.abatidos)), 1);
                    const selecionado = mes === m.mes;
                    const apagado = mes && !selecionado;
                    return (
                      <div key={i} className={`bar-col clickable ${apagado ? 'dim' : ''}`}
                        onClick={() => setMes(selecionado ? null : m.mes)}
                        title={`${mesLabel(m.mes)} — Ganhos: ${pontos(m.ganhos)} · Devolucoes: ${pontos(m.abatidos)}`}>
                        <div className="bar-duo">
                          <div className="bar ganho" style={{ height: `${(m.ganhos / max) * 100}%`, ...(m.ganhos <= 0 ? { minHeight: 0 } : {}) }} />
                          <div className="bar abatido" style={{ height: `${(m.abatidos / max) * 100}%`, ...(m.abatidos <= 0 ? { minHeight: 0 } : {}) }} />
                        </div>
                        <span className="bar-lbl" style={selecionado ? { fontWeight: 700, color: 'var(--brand)' } : {}}>{mesLabel(m.mes)}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 18, marginTop: 14, fontSize: 12, color: 'var(--muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--brand-2)', display: 'inline-block' }} /> Pontos ganhos</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: '#e3d2c0', display: 'inline-block' }} /> Abatidos (devolucoes)</span>
                </div>
              </>
            )}
          </div>

          {/* donut categorias */}
          <div className="card">
            <h2>Clientes por nivel</h2>
            {donut.length === 0 ? <div className="empty">Sem dados no filtro atual.</div> : (
              <DonutInterativo dados={donut} sel={cat} onSel={c => setCat(cat === c ? null : c)} />
            )}
          </div>
        </div>

        <div className="grid cols-2">
          {/* top clientes */}
          <div className="card">
            <h2>Top clientes por pontos {temFiltro ? '(filtro)' : '(180d)'}</h2>
            {top.length === 0 ? <div className="empty">Sem dados no filtro atual.</div> : (
              <div>
                {top.map((t, i) => {
                  const max = Math.max(...top.map(x => x.valor), 1);
                  return (
                    <a key={i} className="hbar-row clickable" href={`/clientes/${encodeURIComponent(t.cd)}`} title="Abrir ficha do cliente" style={{ textDecoration: 'none' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.label}</span>
                      <div className="hbar-track"><div className="hbar-fill" style={{ width: `${(t.valor / max) * 100}%` }} /></div>
                      <b>{pontos(t.valor)}</b>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* lojas */}
          <div className="card">
            <h2>Faturamento clube por loja</h2>
            {lojas.length === 0 ? <div className="empty">Sem dados no filtro atual.</div> : (
              <div>
                {lojas.map((l, i) => {
                  const max = Math.max(...lojas.map(x => x.valor), 1);
                  const selecionada = loja === l.label;
                  const apagada = loja && !selecionada;
                  return (
                    <div key={i} className={`hbar-row clickable ${apagada ? 'dim' : ''}`}
                      onClick={() => setLoja(selecionada ? null : l.label)} title="Clique para filtrar por esta loja">
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: selecionada ? 700 : 400 }}>{l.label}</span>
                      <div className="hbar-track"><div className="hbar-fill" style={{ width: `${(l.valor / max) * 100}%` }} /></div>
                      <b>{brl(l.valor)}</b>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* saude do clube (segue o filtro de categoria) */}
        <div className="grid cols-2">
          <div className="card kpi-card alert" style={{ marginBottom: 0 }}>
            <div><div className="kpi-val num">{pontos(saude.em_carencia)}</div><div className="kpi-lbl">Clientes em carencia {cat ? `(${labelCategoria(cat)})` : ''}</div></div>
          </div>
          <div className="card kpi-card gold" style={{ marginBottom: 0 }}>
            <div><div className="kpi-val num">{pontos(saude.expira_30d)}</div><div className="kpi-lbl">Pontos a expirar em 30 dias {cat ? `(${labelCategoria(cat)})` : ''}</div></div>
          </div>
        </div>
      </div>
    </>
  );
}

function DonutInterativo({ dados, sel, onSel }) {
  const total = dados.reduce((a, d) => a + d.valor, 0);
  const R = 62, C = 2 * Math.PI * R;
  let acc = 0;
  const segs = dados.map(d => {
    const frac = d.valor / total;
    const s = { ...d, dash: frac * C, off: -acc * C };
    acc += frac;
    return s;
  });
  return (
    <div className="chart-wrap">
      <svg width="170" height="170" viewBox="0 0 170 170">
        <circle cx="85" cy="85" r={R} fill="none" stroke="#f0eae2" strokeWidth="20" />
        {segs.map((s, i) => (
          <circle key={i} cx="85" cy="85" r={R} fill="none" className={`clickable ${sel && sel !== s.chave ? 'dim' : ''}`}
            stroke={CORES_CAT[s.chave] || 'var(--brand-2)'} strokeWidth={sel === s.chave ? 24 : 20}
            strokeDasharray={`${Math.max(s.dash - 1.5, 0.1)} ${C}`} strokeDashoffset={s.off}
            transform="rotate(-90 85 85)" onClick={() => onSel(s.chave)}>
            <title>{labelCategoria(s.chave)}: {pontos(s.valor)} — clique para filtrar</title>
          </circle>
        ))}
        <text x="85" y="82" textAnchor="middle" fill="var(--ink)" fontSize="24" fontWeight="700">{pontos(total)}</text>
        <text x="85" y="100" textAnchor="middle" fill="var(--muted)" fontSize="10.5">clientes</text>
      </svg>
      <div className="legend">
        {dados.map((d, i) => (
          <div className={`li clickable ${sel && sel !== d.chave ? 'dim' : ''}`} key={i} onClick={() => onSel(d.chave)}>
            <span className="dot" style={{ background: CORES_CAT[d.chave] || 'var(--brand-2)' }} />
            <span style={{ fontWeight: sel === d.chave ? 700 : 400 }}>{labelCategoria(d.chave)}</span>
            <b>{pontos(d.valor)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
