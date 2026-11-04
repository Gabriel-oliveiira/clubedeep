'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { pareceDocumento, normalizarDoc } from '@/lib/doc';

export default function Login() {
  const router = useRouter();
  const [ident, setIdent] = useState('');
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    let mail = ident.trim().toLowerCase();
    if (pareceDocumento(ident)) {
      const r = await fetch('/api/auth/resolver', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc: normalizarDoc(ident) }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.email) {
        setLoading(false);
        setMsg({ t: 'err', m: j.erro === 'sem_acesso' ? 'Este CPF/CNPJ ainda nao tem acesso. Crie o seu.' : 'CPF/CNPJ nao encontrado.' });
        return;
      }
      mail = j.email;
    }
    const { error } = await getSupabaseBrowser().auth.signInWithPassword({ email: mail, password: senha });
    setLoading(false);
    if (error) { setMsg({ t: 'err', m: 'Login ou senha invalidos.' }); return; }
    router.push('/'); router.refresh();
  }

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-logo">
          <img src="/deep-logo.png" alt="DEEP" />
        </div>
        <div className="login-card">
          <div className="login-head">
            <h1>Bem-vindo de volta</h1>
            <p>Acesse sua conta do Clube DEEP.</p>
          </div>

          <form onSubmit={entrar}>
            <div className="field">
              <label>CPF/CNPJ ou e-mail</label>
              <input value={ident} onChange={e => setIdent(e.target.value)} required autoComplete="username" placeholder="Seu CPF, CNPJ ou e-mail" />
            </div>
            <div className="field">
              <label>Senha</label>
              <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required autoComplete="current-password" placeholder="********" />
            </div>
            <button type="submit" style={{ width: '100%', padding: '13px' }} disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
          </form>

          {msg && <div className={`msg ${msg.t}`}>{msg.m}</div>}

          <div className="login-foot">
            Não tem acesso? <a href="/cadastro">Criar agora</a>
          </div>
        </div>
      </div>
    </div>
  );
}
