'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NovoCurso() {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [nivel, setNivel] = useState('bronze');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  async function criar(e) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const r = await fetch('/api/cursos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ op: 'curso_criar', titulo, descricao, nivel_minimo: nivel }),
    });
    const j = await r.json().catch(() => ({}));
    setLoading(false);
    if (!r.ok) { setMsg('Nao foi possivel criar. ' + (j.detalhe || '')); return; }
    setTitulo(''); setDescricao(''); setNivel('bronze');
    router.push(`/cursos/${j.id}`);
  }

  return (
    <form onSubmit={criar} className="card">
      <h2 style={{ marginTop: 0 }}>Novo curso</h2>
      <div className="toolbar" style={{ flexWrap: 'wrap' }}>
        <input placeholder="Titulo do curso" value={titulo} onChange={e => setTitulo(e.target.value)} required style={{ flex: 2, minWidth: 220 }} />
        <select value={nivel} onChange={e => setNivel(e.target.value)} style={{ minWidth: 150 }}>
          <option value="bronze">A partir de Bronze</option>
          <option value="prata">A partir de Prata</option>
          <option value="ouro">A partir de Ouro</option>
          <option value="platina">A partir de Platina</option>
        </select>
        <button type="submit" disabled={loading}>{loading ? 'Criando...' : 'Criar curso'}</button>
      </div>
      <input placeholder="Descricao (opcional)" value={descricao} onChange={e => setDescricao(e.target.value)} style={{ width: '100%', marginTop: 10 }} />
      {msg && <div className="msg err" style={{ marginTop: 10 }}>{msg}</div>}
    </form>
  );
}
