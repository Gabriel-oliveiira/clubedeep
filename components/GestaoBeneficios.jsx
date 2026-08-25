'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { labelCategoria } from '@/lib/format';

const NIVEIS = [['bronze', 'Bronze'], ['prata', 'Prata'], ['ouro', 'Ouro'], ['platina', 'Platina']];

async function chamar(body) {
  const r = await fetch('/api/beneficios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, j };
}

export default function GestaoBeneficios({ beneficios = [] }) {
  const router = useRouter();
  const [novo, setNovo] = useState({ titulo: '', descricao: '', nivel_minimo: 'bronze' });
  const [msg, setMsg] = useState(null);

  async function criar(e) {
    e.preventDefault(); setMsg(null);
    if (!novo.titulo.trim()) { setMsg('Informe o titulo.'); return; }
    const { ok } = await chamar({ op: 'beneficio_criar', ...novo });
    if (!ok) { setMsg('Erro ao criar.'); return; }
    setNovo({ titulo: '', descricao: '', nivel_minimo: 'bronze' }); router.refresh();
  }

  return (
    <>
      <form onSubmit={criar} className="card">
        <h2 style={{ marginTop: 0 }}>Novo beneficio</h2>
        <div className="toolbar" style={{ flexWrap: 'wrap' }}>
          <input value={novo.titulo} onChange={e => setNovo({ ...novo, titulo: e.target.value })} placeholder="Titulo (ex.: Convite para o desfile de fim de ano)" style={{ flex: 2, minWidth: 240 }} />
          <select value={novo.nivel_minimo} onChange={e => setNovo({ ...novo, nivel_minimo: e.target.value })} style={{ minWidth: 150 }}>
            {NIVEIS.map(([v, l]) => <option key={v} value={v}>A partir de {l}</option>)}
          </select>
          <button type="submit">Adicionar</button>
        </div>
        <input value={novo.descricao} onChange={e => setNovo({ ...novo, descricao: e.target.value })} placeholder="Descricao (opcional)" style={{ width: '100%', marginTop: 10 }} />
        {msg && <div className="msg err" style={{ marginTop: 10 }}>{msg}</div>}
      </form>

      <div className="card flush">
        <div className="card-pad"><h2 style={{ margin: 0 }}>Beneficios ({beneficios.length})</h2></div>
        {beneficios.length === 0 ? <div className="empty" style={{ padding: 20 }}>Nenhum beneficio ainda.</div> : (
          beneficios.map((b, i) => <Linha key={b.id} b={b} primeira={i === 0} />)
        )}
      </div>
    </>
  );
}

function Linha({ b, primeira }) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ titulo: b.titulo, descricao: b.descricao || '', nivel_minimo: b.nivel_minimo, imagem_url: b.imagem_url || '', conteudo: b.conteudo || '', como_resgatar: b.como_resgatar || '' });

  async function salvar() { const { ok } = await chamar({ op: 'beneficio_editar', id: b.id, ...f }); if (ok) { setEdit(false); router.refresh(); } }
  async function toggle() { await chamar({ op: 'beneficio_editar', id: b.id, ativo: !b.ativo }); router.refresh(); }
  async function excluir() { if (confirm('Excluir este beneficio?')) { await chamar({ op: 'beneficio_excluir', id: b.id }); router.refresh(); } }

  return (
    <div style={{ padding: '12px 16px', borderTop: primeira ? 0 : '1px solid var(--linha,#f0eae2)' }}>
      {!edit ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`badge ${b.nivel_minimo}`} style={{ flexShrink: 0 }}>{labelCategoria(b.nivel_minimo)}+</span>
          <div style={{ flex: 1 }}>
            <b>{b.titulo}</b> {!b.ativo && <span className="chip">inativo</span>}
            {b.descricao && <span className="sub">{b.descricao}</span>}
          </div>
          <button type="button" className="btn-ghost" onClick={() => setEdit(true)}>Editar</button>
          <button type="button" className="btn-ghost" onClick={toggle}>{b.ativo ? 'Desativar' : 'Ativar'}</button>
          <button type="button" className="btn-ghost" onClick={excluir} style={{ color: '#c0392b' }}>Excluir</button>
        </div>
      ) : (
        <div>
          <div className="toolbar" style={{ flexWrap: 'wrap' }}>
            <input value={f.titulo} onChange={e => setF({ ...f, titulo: e.target.value })} placeholder="Titulo" style={{ flex: 2, minWidth: 220 }} />
            <select value={f.nivel_minimo} onChange={e => setF({ ...f, nivel_minimo: e.target.value })} style={{ minWidth: 150 }}>
              {['bronze', 'prata', 'ouro', 'platina'].map(v => <option key={v} value={v}>A partir de {labelCategoria(v)}</option>)}
            </select>
            <button type="button" onClick={salvar}>Salvar</button>
            <button type="button" className="btn-ghost" onClick={() => setEdit(false)}>Cancelar</button>
          </div>
          <input value={f.descricao} onChange={e => setF({ ...f, descricao: e.target.value })} placeholder="Descricao curta (aparece no card)" style={{ width: '100%', marginTop: 8 }} />
          <input value={f.imagem_url} onChange={e => setF({ ...f, imagem_url: e.target.value })} placeholder="URL da imagem (opcional)" style={{ width: '100%', marginTop: 8 }} />
          <textarea value={f.conteudo} onChange={e => setF({ ...f, conteudo: e.target.value })} placeholder="Conteudo completo da pagina do beneficio" rows={4} style={{ width: '100%', marginTop: 8 }} />
          <textarea value={f.como_resgatar} onChange={e => setF({ ...f, como_resgatar: e.target.value })} placeholder="Como resgatar / instrucoes (opcional)" rows={2} style={{ width: '100%', marginTop: 8 }} />
        </div>
      )}
    </div>
  );
}
