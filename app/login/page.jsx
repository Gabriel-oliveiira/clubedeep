'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { pareceDocumento, normalizarDoc } from '@/lib/doc';

export default function Login() {
  const router = useRouter();
  const [modo, setModo] = useState('cliente'); // 'cliente' | 'equipe' | 'loja'
  const [ident, setIdent] = useState('');       // cliente: cpf/cnpj ou email
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  async function entrarCliente(e) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    let mail = ident.trim().toLowerCase();
    // se digitou um documento, resolve para o e-mail do acesso
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
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email: mail, password: senha });
    setLoading(false);
    if (error) { setMsg({ t: 'err', m: 'Login ou senha invalidos.' }); return; }
    router.push('/cliente'); router.refresh();
  }

  async function entrarEquipe(e) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });
    setLoading(false);
    if (error) { setMsg({ t: 'err', m: 'E-mail ou senha invalidos.' }); return; }
    router.push('/'); router.refresh();
  }

  async function entrarLoja(e) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const supabase = getSupabaseBrowser();
    const site = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${site}/auth/callback` },
    });
    setLoading(false);
    if (error) { setMsg({ t: 'err', m: 'Nao foi possivel enviar o link. Verifique o e-mail.' }); return; }
    setMsg({ t: 'ok', m: 'Enviamos um link de acesso para o seu e-mail. Abra e clique para entrar.' });
  }

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-logo">
          <img src="/deep-logo.png" alt="DEEP" />
          <small>Clube Deep</small>
        </div>
        <div className="login-card">
          <div className="tabs">
            <button type="button" className={modo === 'cliente' ? 'active' : ''} onClick={() => { setModo('cliente'); setMsg(null); }}>Cliente</button>
            <button type="button" className={modo === 'equipe' ? 'active' : ''} onClick={() => { setModo('equipe'); setMsg(null); }}>Equipe</button>
            <button type="button" className={modo === 'loja' ? 'active' : ''} onClick={() => { setModo('loja'); setMsg(null); }}>Minha loja</button>
          </div>

          {modo === 'cliente' && (
            <form onSubmit={entrarCliente}>
              <div className="field"><label>CPF/CNPJ ou e-mail</label>
                <input value={ident} onChange={e => setIdent(e.target.value)} required autoComplete="username" placeholder="Seu CPF, CNPJ ou e-mail" /></div>
              <div className="field"><label>Senha</label>
                <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required autoComplete="current-password" placeholder="********" /></div>
              <button type="submit" style={{ width: '100%', padding: '12px' }} disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
              <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13 }}>
                Nao tem acesso? <a href="/cadastro" style={{ color: 'var(--brand)' }}>Criar agora</a>
              </div>
            </form>
          )}

          {modo === 'equipe' && (
            <form onSubmit={entrarEquipe}>
              <div className="field"><label>E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" placeholder="voce@grupodeep.com.br" /></div>
              <div className="field"><label>Senha</label>
                <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required autoComplete="current-password" placeholder="********" /></div>
              <button type="submit" style={{ width: '100%', padding: '12px' }} disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
            </form>
          )}

          {modo === 'loja' && (
            <form onSubmit={entrarLoja}>
              <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>Digite o e-mail cadastrado na DEEP. Enviaremos um link seguro de acesso — sem senha.</p>
              <div className="field"><label>E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="sualoja@email.com" /></div>
              <button type="submit" style={{ width: '100%', padding: '12px' }} disabled={loading}>{loading ? 'Enviando...' : 'Receber link de acesso'}</button>
            </form>
          )}

          {msg && <div className={`msg ${msg.t}`}>{msg.m}</div>}
        </div>
      </div>
    </div>
  );
}
