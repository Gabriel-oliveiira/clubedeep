'use client';
import { useState } from 'react';
import PlayerAula from '@/components/PlayerAula';
import { thumbYoutube } from '@/lib/youtube';

export default function CursoView({ curso, aulas = [], concluidasIniciais = [] }) {
  const [concluidas, setConcluidas] = useState(new Set(concluidasIniciais));
  const primeira = aulas.find(a => !concluidasIniciais.includes(a.id)) || aulas[0] || null;
  const [atual, setAtual] = useState(primeira);

  const pct = aulas.length ? Math.round((concluidas.size / aulas.length) * 100) : 0;

  async function salvar(aulaId, concluida) {
    try {
      await fetch('/api/cliente/progresso', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aula_id: aulaId, concluida }),
      });
    } catch (e) {}
  }

  function marcar(aulaId, concluida) {
    setConcluidas(prev => {
      const s = new Set(prev);
      if (concluida) s.add(aulaId); else s.delete(aulaId);
      return s;
    });
    salvar(aulaId, concluida);
  }

  if (!atual) return <div className="empty">Este curso ainda nao tem aulas.</div>;

  const atualConcluida = concluidas.has(atual.id);

  return (
    <div className="curso-grid">
      <div>
        <PlayerAula key={atual.id} youtubeId={atual.youtube_id} onConcluir={() => marcar(atual.id, true)} />
        <div className="card" style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0 }}>{atual.titulo}</h2>
            <button type="button" className={atualConcluida ? 'btn-ghost' : ''} onClick={() => marcar(atual.id, !atualConcluida)}>
              {atualConcluida ? '✓ Concluida' : 'Marcar como concluida'}
            </button>
          </div>
          {atual.descricao && <p className="muted" style={{ marginBottom: 0 }}>{atual.descricao}</p>}
        </div>
      </div>

      <div className="card flush">
        <div className="card-pad" style={{ borderBottom: '1px solid var(--linha,#eee)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <b>Progresso do curso</b><span className="muted">{concluidas.size}/{aulas.length} · {pct}%</span>
          </div>
          <div style={{ height: 8, background: '#efe9e1', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--brand-2,#c99a5b)' }} />
          </div>
        </div>
        <div style={{ maxHeight: 460, overflowY: 'auto' }}>
          {aulas.map((a, i) => {
            const ok = concluidas.has(a.id);
            const sel = atual.id === a.id;
            return (
              <button key={a.id} type="button" onClick={() => setAtual(a)}
                className="aula-item" style={{
                  display: 'flex', gap: 10, width: '100%', textAlign: 'left', alignItems: 'center',
                  padding: '11px 14px', border: 0, borderTop: i ? '1px solid var(--linha,#f0eae2)' : 0,
                  background: sel ? 'var(--brand-suave,#f6efe6)' : 'transparent', cursor: 'pointer',
                }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0, fontSize: 11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: ok ? '#1da851' : '#e3d9c9', color: ok ? '#fff' : '#7a6f5f',
                }}>{ok ? '✓' : i + 1}</span>
                <img src={thumbYoutube(a.youtube_id, 'mqdefault')} alt="" style={{ width: 62, height: 35, objectFit: 'cover', borderRadius: 5, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: sel ? 700 : 400, color: 'var(--ink,#2a2018)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.titulo}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
