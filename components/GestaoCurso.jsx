'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { thumbYoutube } from '@/lib/youtube';

const NIVEIS = [['bronze', 'Bronze'], ['prata', 'Prata'], ['ouro', 'Ouro'], ['platina', 'Platina']];

async function chamar(body) {
  const r = await fetch('/api/cursos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, j };
}

export default function GestaoCurso({ curso, aulas = [] }) {
  const router = useRouter();
  const [c, setC] = useState({ titulo: curso.titulo, descricao: curso.descricao || '', nivel_minimo: curso.nivel_minimo, ativo: curso.ativo, capa_url: curso.capa_url || '' });
  const [msg, setMsg] = useState(null);
  const [nova, setNova] = useState({ titulo: '', descricao: '', youtube: '' });

  async function salvarCurso(e) {
    e.preventDefault(); setMsg(null);
    const { ok, j } = await chamar({ op: 'curso_editar', id: curso.id, ...c });
    if (!ok) { setMsg('Erro ao salvar: ' + (j.detalhe || j.erro || '')); return; }
    setMsg('Salvo!'); router.refresh();
  }
  async function excluirCurso() {
    if (!confirm('Excluir este curso e todas as aulas?')) return;
    const { ok } = await chamar({ op: 'curso_excluir', id: curso.id });
    if (ok) router.push('/cursos');
  }
  async function addAula(e) {
    e.preventDefault(); setMsg(null);
    if (!nova.titulo.trim() || !nova.youtube.trim()) { setMsg('Preencha titulo e link do YouTube.'); return; }
    const { ok, j } = await chamar({ op: 'aula_criar', curso_id: curso.id, ...nova, ordem: aulas.length });
    if (!ok) { setMsg(j.erro === 'youtube_invalido' ? 'Link do YouTube invalido.' : 'Erro ao adicionar aula.'); return; }
    setNova({ titulo: '', descricao: '', youtube: '' }); router.refresh();
  }

  return (
    <>
      <form onSubmit={salvarCurso} className="card">
        <h2 style={{ marginTop: 0 }}>Dados do curso</h2>
        <div className="toolbar" style={{ flexWrap: 'wrap' }}>
          <input value={c.titulo} onChange={e => setC({ ...c, titulo: e.target.value })} placeholder="Titulo" required style={{ flex: 2, minWidth: 220 }} />
          <select value={c.nivel_minimo} onChange={e => setC({ ...c, nivel_minimo: e.target.value })} style={{ minWidth: 150 }}>
            {NIVEIS.map(([v, l]) => <option key={v} value={v}>A partir de {l}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <input type="checkbox" checked={c.ativo} onChange={e => setC({ ...c, ativo: e.target.checked })} /> Ativo
          </label>
        </div>
        <input value={c.descricao} onChange={e => setC({ ...c, descricao: e.target.value })} placeholder="Descricao" style={{ width: '100%', marginTop: 10 }} />
        <div style={{ display: 'flex', gap: 12, marginTop: 10, alignItems: 'center' }}>
          <input value={c.capa_url} onChange={e => setC({ ...c, capa_url: e.target.value })} placeholder="URL da capa (imagem) — opcional" style={{ flex: 1 }} />
          {c.capa_url && <img src={c.capa_url} alt="" style={{ width: 90, height: 52, objectFit: 'cover', borderRadius: 8 }} />}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button type="submit">Salvar curso</button>
          <button type="button" className="btn-ghost" onClick={excluirCurso} style={{ color: '#c0392b' }}>Excluir curso</button>
        </div>
        {msg && <div className={`msg ${msg === 'Salvo!' ? 'ok' : 'err'}`} style={{ marginTop: 10 }}>{msg}</div>}
      </form>

      <form onSubmit={addAula} className="card">
        <h2 style={{ marginTop: 0 }}>Adicionar aula</h2>
        <div className="toolbar" style={{ flexWrap: 'wrap' }}>
          <input value={nova.titulo} onChange={e => setNova({ ...nova, titulo: e.target.value })} placeholder="Titulo da aula" style={{ flex: 2, minWidth: 220 }} />
          <input value={nova.youtube} onChange={e => setNova({ ...nova, youtube: e.target.value })} placeholder="Link ou ID do YouTube" style={{ flex: 2, minWidth: 220 }} />
          <button type="submit">Adicionar</button>
        </div>
        <input value={nova.descricao} onChange={e => setNova({ ...nova, descricao: e.target.value })} placeholder="Descricao (opcional)" style={{ width: '100%', marginTop: 10 }} />
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 0 }}>Dica: publique o video como <b>Nao listado</b> no YouTube e cole o link aqui.</p>
      </form>

      <div className="card flush">
        <div className="card-pad"><h2 style={{ margin: 0 }}>Aulas ({aulas.length})</h2></div>
        {aulas.length === 0 ? <div className="empty" style={{ padding: 20 }}>Nenhuma aula ainda.</div> : (
          aulas.map((a, i) => <AulaLinha key={a.id} aula={a} indice={i} primeira={i === 0} />)
        )}
      </div>
    </>
  );
}

function AulaLinha({ aula, indice, primeira }) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ titulo: aula.titulo, youtube: aula.youtube_id, descricao: aula.descricao || '' });

  async function salvar() {
    const { ok, j } = await chamar({ op: 'aula_editar', id: aula.id, ...f });
    if (!ok) { alert(j.erro === 'youtube_invalido' ? 'Link invalido' : 'Erro ao salvar'); return; }
    setEdit(false); router.refresh();
  }
  async function toggle() { await chamar({ op: 'aula_editar', id: aula.id, ativo: !aula.ativo }); router.refresh(); }
  async function excluir() { if (confirm('Excluir esta aula?')) { await chamar({ op: 'aula_excluir', id: aula.id }); router.refresh(); } }

  return (
    <div style={{ padding: '12px 16px', borderTop: primeira ? 0 : '1px solid var(--linha,#f0eae2)' }}>
      {!edit ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="muted num" style={{ width: 18 }}>{indice + 1}</span>
          <img src={thumbYoutube(aula.youtube_id, 'mqdefault')} alt="" style={{ width: 72, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <b>{aula.titulo}</b> {!aula.ativo && <span className="chip">inativa</span>}
            <span className="sub num">YouTube: {aula.youtube_id}</span>
          </div>
          <button type="button" className="btn-ghost" onClick={() => setEdit(true)}>Editar</button>
          <button type="button" className="btn-ghost" onClick={toggle}>{aula.ativo ? 'Desativar' : 'Ativar'}</button>
          <button type="button" className="btn-ghost" onClick={excluir} style={{ color: '#c0392b' }}>Excluir</button>
        </div>
      ) : (
        <div className="toolbar" style={{ flexWrap: 'wrap' }}>
          <input value={f.titulo} onChange={e => setF({ ...f, titulo: e.target.value })} placeholder="Titulo" style={{ flex: 2, minWidth: 200 }} />
          <input value={f.youtube} onChange={e => setF({ ...f, youtube: e.target.value })} placeholder="Link/ID YouTube" style={{ flex: 2, minWidth: 200 }} />
          <button type="button" onClick={salvar}>Salvar</button>
          <button type="button" className="btn-ghost" onClick={() => setEdit(false)}>Cancelar</button>
        </div>
      )}
    </div>
  );
}
