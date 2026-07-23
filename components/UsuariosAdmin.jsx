'use client';
import { useEffect, useRef, useState } from 'react';

const PAPEL_LABEL = { admin: 'Admin', suporte: 'Equipe (suporte)', loja: 'Loja' };

export default function UsuariosAdmin({ meuEmail }) {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState('');

  // form
  const [email, setEmail] = useState('');
  const [papel, setPapel] = useState('suporte');
  const [senha, setSenha] = useState('');
  const [lojaSel, setLojaSel] = useState(null); // {cd_cliente, nome}
  const [buscaLoja, setBuscaLoja] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [msg, setMsg] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const debounce = useRef(null);

  async function carregar() {
    setCarregando(true);
    const r = await fetch('/api/usuarios');
    const j = await r.json();
    setUsuarios(j.usuarios || []);
    setCarregando(false);
  }
  useEffect(() => { carregar(); }, []);

  // busca de loja com debounce
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (buscaLoja.trim().length < 2) { setSugestoes([]); return; }
    debounce.current = setTimeout(async () => {
      const r = await fetch(`/api/clientes-busca?q=${encodeURIComponent(buscaLoja.trim())}`);
      const j = await r.json();
      setSugestoes(j.clientes || []);
    }, 300);
  }, [buscaLoja]);

  async function criar(e) {
    e.preventDefault();
    setMsg(null); setSalvando(true);
    const body = { email, papel };
    if (papel === 'loja') body.cd_cliente = lojaSel?.cd_cliente;
    else body.senha = senha;
    const r = await fetch('/api/usuarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json();
    setSalvando(false);
    if (!r.ok) { setMsg({ t: 'err', m: j.error || 'Erro ao criar usuario.' }); return; }
    setMsg({ t: 'ok', m: papel === 'loja'
      ? 'Acesso de loja criado. O cliente entra pela aba "Minha loja" com o e-mail cadastrado (link magico).'
      : 'Usuario criado. Ja pode entrar com e-mail e senha.' });
    setEmail(''); setSenha(''); setLojaSel(null); setBuscaLoja('');
    carregar();
  }

  async function revogar(em) {
    if (!confirm(`Revogar o acesso de ${em}?`)) return;
    const r = await fetch('/api/usuarios', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: em }) });
    const j = await r.json();
    if (!r.ok) { alert(j.error || 'Erro ao revogar.'); return; }
    carregar();
  }

  const lista = usuarios.filter(u => {
    if (!filtro) return true;
    const f = filtro.toLowerCase();
    return u.email.includes(f) || (u.loja_nome || '').toLowerCase().includes(f) || u.papel.includes(f);
  });

  return (
    <>
      <div className="card">
        <h2>Novo usuario</h2>
        <form onSubmit={criar}>
          <div className="toolbar" style={{ alignItems: 'flex-end' }}>
            <div className="field" style={{ flex: 2, minWidth: 220, marginBottom: 0 }}>
              <label>E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="pessoa@email.com" />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 160, marginBottom: 0 }}>
              <label>Papel</label>
              <select value={papel} onChange={e => { setPapel(e.target.value); setMsg(null); }}>
                <option value="suporte">Equipe (suporte)</option>
                <option value="admin">Admin</option>
                <option value="loja">Loja</option>
              </select>
            </div>

            {papel !== 'loja' && (
              <div className="field" style={{ flex: 1, minWidth: 180, marginBottom: 0 }}>
                <label>Senha (min. 8)</label>
                <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required minLength={8} placeholder="********" />
              </div>
            )}

            {papel === 'loja' && (
              <div className="field" style={{ flex: 2, minWidth: 240, marginBottom: 0, position: 'relative' }}>
                <label>Loja vinculada</label>
                {lojaSel ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input value={`#${lojaSel.cd_cliente} — ${lojaSel.nome}`} readOnly style={{ flex: 1, background: '#f4ede5' }} />
                    <button type="button" className="btn-ghost" onClick={() => { setLojaSel(null); setBuscaLoja(''); }}>Trocar</button>
                  </div>
                ) : (
                  <>
                    <input value={buscaLoja} onChange={e => setBuscaLoja(e.target.value)} placeholder="Buscar por nome, CPF/CNPJ ou codigo..." />
                    {sugestoes.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, background: '#fff', border: '1px solid var(--line)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', marginTop: 4, overflow: 'hidden' }}>
                        {sugestoes.map(s => (
                          <div key={s.cd_cliente} onClick={() => { setLojaSel(s); setSugestoes([]); }}
                            style={{ padding: '9px 13px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--line)' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#faf7f3'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                            <b>{s.nome}</b>
                            <span className="muted" style={{ display: 'block', fontSize: 11.5 }}>#{s.cd_cliente} · {s.cpf_cnpj || 'sem doc'} · {[s.cidade, s.uf].filter(Boolean).join('/')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <button type="submit" disabled={salvando || (papel === 'loja' && !lojaSel)} style={{ padding: '10px 22px' }}>
              {salvando ? 'Criando...' : 'Criar usuario'}
            </button>
          </div>
        </form>
        {papel === 'loja' && !msg && (
          <p className="muted" style={{ fontSize: 12.5, marginBottom: 0 }}>
            A loja entra sem senha: recebe um link magico no e-mail e ve apenas os pontos dela.
          </p>
        )}
        {msg && <div className={`msg ${msg.t}`}>{msg.m}</div>}
      </div>

      <div className="card flush">
        <div className="card-pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0 }}>Acessos ({lista.length})</h2>
          <input value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Filtrar..." style={{ width: 220 }} />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>E-mail</th><th>Papel</th><th>Loja vinculada</th><th>Criado em</th><th></th></tr></thead>
            <tbody>
              {carregando && <tr><td colSpan={5}><div className="empty">Carregando...</div></td></tr>}
              {!carregando && lista.map(u => (
                <tr key={u.email}>
                  <td>{u.email}{u.email === meuEmail && <span className="chip ativa" style={{ marginLeft: 8 }}>voce</span>}</td>
                  <td><span className="badge" style={{ background: u.papel === 'admin' ? 'var(--brand)' : u.papel === 'suporte' ? 'var(--brand-2)' : 'var(--semcat)' }}>{PAPEL_LABEL[u.papel] || u.papel}</span></td>
                  <td className="muted">{u.cd_cliente ? `#${u.cd_cliente}${u.loja_nome ? ` — ${u.loja_nome}` : ''}` : '-'}</td>
                  <td className="muted num">{u.criado_em ? new Date(u.criado_em).toLocaleDateString('pt-BR') : '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    {u.email !== meuEmail && (
                      <button type="button" className="btn-ghost" style={{ color: 'var(--bad)', borderColor: '#e8c9c9' }} onClick={() => revogar(u.email)}>Revogar</button>
                    )}
                  </td>
                </tr>
              ))}
              {!carregando && lista.length === 0 && <tr><td colSpan={5}><div className="empty">Nenhum acesso encontrado.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
