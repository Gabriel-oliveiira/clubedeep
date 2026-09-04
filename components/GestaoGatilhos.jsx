'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

async function chamar(body) {
  const r = await fetch('/api/gatilhos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, j };
}

const DEFAULT = {
  min_transacao: 2500, validade_dias: 180, carencia_dias: 15,
  nivel_bronze: 2500, nivel_prata: 30000, nivel_ouro: 48000, nivel_platina: 72000,
  boas_vindas_ativo: true, boas_vindas_pontos: 500,
  ticket_faixas: [{ min: 5300, pontos: 400 }, { min: 7700, pontos: 800 }],
  recorrencia_faixas: [{ meses: 3, pontos: 1000 }, { meses: 6, pontos: 3000 }],
};

export default function GestaoGatilhos({ config, gatilhos = [] }) {
  const router = useRouter();
  const base = { ...DEFAULT, ...(config || {}) };
  const [c, setC] = useState({
    ...base,
    ticket_faixas: (base.ticket_faixas || []).map(f => ({ ...f })),
    recorrencia_faixas: (base.recorrencia_faixas || []).map(f => ({ ...f })),
  });
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState(null);
  const [recalc, setRecalc] = useState(null);
  const [rodando, setRodando] = useState(false);

  const set = (k, v) => setC(p => ({ ...p, [k]: v }));

  function setFaixa(campo, i, chave, valor) {
    setC(p => { const arr = p[campo].map((f, j) => j === i ? { ...f, [chave]: valor } : f); return { ...p, [campo]: arr }; });
  }
  const addTicket = () => setC(p => ({ ...p, ticket_faixas: [...p.ticket_faixas, { min: '', pontos: '' }] }));
  const delTicket = (i) => setC(p => ({ ...p, ticket_faixas: p.ticket_faixas.filter((_, j) => j !== i) }));
  const addRec = () => setC(p => ({ ...p, recorrencia_faixas: [...p.recorrencia_faixas, { meses: '', pontos: '' }] }));
  const delRec = (i) => setC(p => ({ ...p, recorrencia_faixas: p.recorrencia_faixas.filter((_, j) => j !== i) }));

  async function salvar() {
    setSalvando(true); setMsg(null);
    const { ok } = await chamar({ op: 'config_salvar', ...c });
    setSalvando(false);
    setMsg(ok ? { t: 'ok', m: 'Configuração salva. Clique em "Recalcular agora" para aplicar aos pontos.' } : { t: 'err', m: 'Erro ao salvar.' });
    if (ok) router.refresh();
  }

  async function recalcular() {
    if (!confirm('Recalcular reprocessa o histórico de pontos de todos os clientes com a configuração atual. Continuar?')) return;
    setRodando(true); setRecalc(null); setMsg(null);
    const { ok, j } = await chamar({ op: 'recalcular' });
    setRodando(false);
    if (ok) { setRecalc(j.distribuicao); router.refresh(); }
    else setMsg({ t: 'err', m: 'Erro ao recalcular.' });
  }

  return (
    <>
      {/* PARAMETROS GERAIS */}
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Parâmetros gerais</h2>
        <div className="grid cols-3">
          <Campo label="Compra mínima para pontuar (R$)" v={c.min_transacao} on={v => set('min_transacao', v)} />
          <Campo label="Validade dos pontos (dias)" v={c.validade_dias} on={v => set('validade_dias', v)} />
          <Campo label="Carência ao cair de nível (dias)" v={c.carencia_dias} on={v => set('carencia_dias', v)} />
        </div>
      </div>

      {/* FAIXAS DE NIVEL */}
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Faixas de nível (em pontos)</h2>
        <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>Pontuação mínima para cada nível. Bronze usa "≥"; os demais usam "acima de".</p>
        <div className="grid cols-4">
          <Campo label="Bronze (≥)" v={c.nivel_bronze} on={v => set('nivel_bronze', v)} />
          <Campo label="Prata (acima de)" v={c.nivel_prata} on={v => set('nivel_prata', v)} />
          <Campo label="Ouro (acima de)" v={c.nivel_ouro} on={v => set('nivel_ouro', v)} />
          <Campo label="Platina (acima de)" v={c.nivel_platina} on={v => set('nivel_platina', v)} />
        </div>
      </div>

      {/* BOAS VINDAS */}
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Pontos de boas-vindas</h2>
        <div className="grid cols-3" style={{ alignItems: 'end' }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" checked={!!c.boas_vindas_ativo} onChange={e => set('boas_vindas_ativo', e.target.checked)} />
            <span>Ativo</span>
          </label>
          <Campo label="Pontos ao entrar no Bronze" v={c.boas_vindas_pontos} on={v => set('boas_vindas_pontos', v)} />
        </div>
      </div>

      {/* TICKET */}
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Bônus por valor da compra (ticket)</h2>
        <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>Ganha os pontos da maior faixa atingida em cada compra.</p>
        {c.ticket_faixas.map((f, i) => (
          <div key={i} className="toolbar" style={{ gap: 10, marginTop: 8 }}>
            <label style={{ flex: 1 }}><small className="muted">Compra a partir de (R$)</small>
              <input type="number" value={f.min} onChange={e => setFaixa('ticket_faixas', i, 'min', e.target.value)} style={{ width: '100%' }} /></label>
            <label style={{ flex: 1 }}><small className="muted">Pontos extras</small>
              <input type="number" value={f.pontos} onChange={e => setFaixa('ticket_faixas', i, 'pontos', e.target.value)} style={{ width: '100%' }} /></label>
            <button type="button" className="btn-ghost" onClick={() => delTicket(i)} style={{ color: '#c0392b' }}>Remover</button>
          </div>
        ))}
        <button type="button" className="btn-ghost" onClick={addTicket} style={{ marginTop: 10 }}>+ Adicionar faixa</button>
      </div>

      {/* RECORRENCIA */}
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Bônus por recorrência (meses consecutivos)</h2>
        {c.recorrencia_faixas.map((f, i) => (
          <div key={i} className="toolbar" style={{ gap: 10, marginTop: 8 }}>
            <label style={{ flex: 1 }}><small className="muted">Meses consecutivos</small>
              <input type="number" value={f.meses} onChange={e => setFaixa('recorrencia_faixas', i, 'meses', e.target.value)} style={{ width: '100%' }} /></label>
            <label style={{ flex: 1 }}><small className="muted">Pontos</small>
              <input type="number" value={f.pontos} onChange={e => setFaixa('recorrencia_faixas', i, 'pontos', e.target.value)} style={{ width: '100%' }} /></label>
            <button type="button" className="btn-ghost" onClick={() => delRec(i)} style={{ color: '#c0392b' }}>Remover</button>
          </div>
        ))}
        <button type="button" className="btn-ghost" onClick={addRec} style={{ marginTop: 10 }}>+ Adicionar faixa</button>
      </div>

      <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={salvar} disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar configuração'}</button>
        {msg && <span className={`chip ${msg.t === 'ok' ? 'ativa' : ''}`} style={msg.t === 'err' ? { background: '#fdecea', color: '#c0392b' } : {}}>{msg.m}</span>}
      </div>

      {/* GATILHOS CUSTOMIZADOS */}
      <NovoGatilho router={router} />
      <div className="card flush">
        <div className="card-pad"><h2 style={{ margin: 0 }}>Gatilhos personalizados ({gatilhos.length})</h2>
          <p className="muted" style={{ fontSize: 13, margin: '4px 0 0' }}>Bônus de pontos criados por você — ex.: outro presente de boas-vindas ou campanha por período.</p></div>
        {gatilhos.length === 0 ? <div className="empty" style={{ padding: 20 }}>Nenhum gatilho personalizado ainda.</div> : (
          gatilhos.map((g, i) => <LinhaGatilho key={g.id} g={g} primeira={i === 0} router={router} />)
        )}
      </div>

      {/* RECALCULAR */}
      <div className="card" style={{ borderLeft: '3px solid var(--brand-2,#c99a5b)' }}>
        <h2 style={{ marginTop: 0 }}>Aplicar mudanças</h2>
        <p className="muted" style={{ fontSize: 13.5 }}>As alterações só passam a valer nos pontos dos clientes depois de recalcular. Você pode salvar várias mudanças e recalcular uma vez só.</p>
        <button type="button" onClick={recalcular} disabled={rodando}>{rodando ? 'Recalculando…' : 'Recalcular agora'}</button>
        {recalc && (
          <div className="grid cols-5" style={{ marginTop: 14 }}>
            {['sem_categoria', 'bronze', 'prata', 'ouro', 'platina'].map(k => (
              <div key={k} className="card kpi-card"><div>
                <div className="kpi-val num">{recalc[k] || 0}</div>
                <div className="kpi-lbl">{k === 'sem_categoria' ? 'Sem nível' : k[0].toUpperCase() + k.slice(1)}</div>
              </div></div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Campo({ label, v, on }) {
  return (
    <label style={{ display: 'block' }}>
      <small className="muted">{label}</small>
      <input type="number" value={v ?? ''} onChange={e => on(e.target.value)} style={{ width: '100%' }} />
    </label>
  );
}

const TIPOS = [['boas_vindas', 'Boas-vindas (1x por cliente)'], ['campanha', 'Campanha (período)']];

function NovoGatilho({ router }) {
  const vazio = { nome: '', tipo: 'boas_vindas', pontos: '', min_venda: '', data_inicio: '', data_fim: '', ativo: true };
  const [g, setG] = useState(vazio);
  const [msg, setMsg] = useState(null);
  async function criar(e) {
    e.preventDefault(); setMsg(null);
    if (!g.nome.trim()) { setMsg('Informe o nome.'); return; }
    const { ok } = await chamar({ op: 'gatilho_criar', ...g });
    if (!ok) { setMsg('Erro ao criar.'); return; }
    setG(vazio); router.refresh();
  }
  return (
    <form onSubmit={criar} className="card">
      <h2 style={{ marginTop: 0 }}>Novo gatilho personalizado</h2>
      <div className="toolbar" style={{ flexWrap: 'wrap' }}>
        <input value={g.nome} onChange={e => setG({ ...g, nome: e.target.value })} placeholder="Nome (ex.: Presente de aniversário do clube)" style={{ flex: 2, minWidth: 220 }} />
        <select value={g.tipo} onChange={e => setG({ ...g, tipo: e.target.value })} style={{ minWidth: 190 }}>
          {TIPOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input type="number" value={g.pontos} onChange={e => setG({ ...g, pontos: e.target.value })} placeholder="Pontos" style={{ width: 110 }} />
        <button type="submit">Adicionar</button>
      </div>
      <div className="toolbar" style={{ flexWrap: 'wrap', marginTop: 8 }}>
        <label style={{ flex: 1, minWidth: 160 }}><small className="muted">Compra mínima (R$) — opcional</small>
          <input type="number" value={g.min_venda} onChange={e => setG({ ...g, min_venda: e.target.value })} placeholder="usa o mínimo geral" style={{ width: '100%' }} /></label>
        {g.tipo === 'campanha' && <>
          <label style={{ flex: 1, minWidth: 150 }}><small className="muted">Início</small>
            <input type="date" value={g.data_inicio} onChange={e => setG({ ...g, data_inicio: e.target.value })} style={{ width: '100%' }} /></label>
          <label style={{ flex: 1, minWidth: 150 }}><small className="muted">Fim</small>
            <input type="date" value={g.data_fim} onChange={e => setG({ ...g, data_fim: e.target.value })} style={{ width: '100%' }} /></label>
        </>}
      </div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 0 }}>Crédito 1x por cliente que tiver uma compra elegível{`. `}Depois de criar, use "Recalcular agora" para aplicar.</p>
      {msg && <div className="msg err" style={{ marginTop: 10 }}>{msg}</div>}
    </form>
  );
}

function LinhaGatilho({ g, primeira, router }) {
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ nome: g.nome, tipo: g.tipo, pontos: g.pontos, min_venda: g.min_venda ?? '', data_inicio: g.data_inicio || '', data_fim: g.data_fim || '', ativo: g.ativo });
  async function salvar() { const { ok } = await chamar({ op: 'gatilho_editar', id: g.id, ...f }); if (ok) { setEdit(false); router.refresh(); } }
  async function toggle() { await chamar({ op: 'gatilho_editar', id: g.id, ativo: !g.ativo }); router.refresh(); }
  async function excluir() { if (confirm('Excluir este gatilho?')) { await chamar({ op: 'gatilho_excluir', id: g.id }); router.refresh(); } }
  const tipoLabel = g.tipo === 'campanha' ? 'Campanha' : 'Boas-vindas';
  return (
    <div style={{ padding: '12px 16px', borderTop: primeira ? 0 : '1px solid var(--linha,#f0eae2)' }}>
      {!edit ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <b>{g.nome}</b> <span className="chip" style={{ background: '#efe6db', color: 'var(--brand)' }}>{tipoLabel}</span>
            <span className="chip" style={{ background: '#eef3ee', color: '#2e7d32' }}>+{Math.round(Number(g.pontos))} pts</span>
            {!g.ativo && <span className="chip">inativo</span>}
            <span className="sub">
              {g.min_venda ? `mín. R$ ${Number(g.min_venda).toLocaleString('pt-BR')}` : 'mínimo geral'}
              {g.tipo === 'campanha' && (g.data_inicio || g.data_fim) ? ` · ${g.data_inicio || '…'} a ${g.data_fim || '…'}` : ''}
            </span>
          </div>
          <button type="button" className="btn-ghost" onClick={() => setEdit(true)}>Editar</button>
          <button type="button" className="btn-ghost" onClick={toggle}>{g.ativo ? 'Desativar' : 'Ativar'}</button>
          <button type="button" className="btn-ghost" onClick={excluir} style={{ color: '#c0392b' }}>Excluir</button>
        </div>
      ) : (
        <div>
          <div className="toolbar" style={{ flexWrap: 'wrap' }}>
            <input value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} placeholder="Nome" style={{ flex: 2, minWidth: 200 }} />
            <select value={f.tipo} onChange={e => setF({ ...f, tipo: e.target.value })} style={{ minWidth: 190 }}>
              {TIPOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input type="number" value={f.pontos} onChange={e => setF({ ...f, pontos: e.target.value })} placeholder="Pontos" style={{ width: 110 }} />
            <button type="button" onClick={salvar}>Salvar</button>
            <button type="button" className="btn-ghost" onClick={() => setEdit(false)}>Cancelar</button>
          </div>
          <div className="toolbar" style={{ flexWrap: 'wrap', marginTop: 8 }}>
            <label style={{ flex: 1, minWidth: 160 }}><small className="muted">Compra mínima (R$)</small>
              <input type="number" value={f.min_venda} onChange={e => setF({ ...f, min_venda: e.target.value })} placeholder="mínimo geral" style={{ width: '100%' }} /></label>
            {f.tipo === 'campanha' && <>
              <label style={{ flex: 1, minWidth: 150 }}><small className="muted">Início</small>
                <input type="date" value={f.data_inicio} onChange={e => setF({ ...f, data_inicio: e.target.value })} style={{ width: '100%' }} /></label>
              <label style={{ flex: 1, minWidth: 150 }}><small className="muted">Fim</small>
                <input type="date" value={f.data_fim} onChange={e => setF({ ...f, data_fim: e.target.value })} style={{ width: '100%' }} /></label>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}
