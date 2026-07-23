'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/client';

export default function Login() {
  const router = useRouter();
  const [modo, setModo] = useState('equipe'); // 'equipe' | 'loja'
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

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
          <small>Clube Deep &middot; Painel de pontos</small>
        </div>
        <div className="login-card">
          <div className="tabs">
            <button type="button" className={modo==='equipe'?'active':''} onClick={()=>{setModo('equipe');setMsg(null);}}>Equipe</button>
            <button type="button" className={modo==='loja'?'active':''} onClick={()=>{setModo('loja');setMsg(null);}}>Minha loja</button>
          </div>

          {modo==='equipe' ? (
            <form onSubmit={entrarEquipe}>
              <div className="field"><label>E-mail</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="username" placeholder="voce@grupodeep.com.br" /></div>
              <div className="field"><label>Senha</label>
                <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} required autoComplete="current-password" placeholder="********" /></div>
              <button type="submit" style={{width:'100%',padding:'12px'}} disabled={loading}>{loading?'Entrando...':'Entrar'}</button>
            </form>
          ) : (
            <form onSubmit={entrarLoja}>
              <p className="muted" style={{fontSize:13,marginTop:0}}>Digite o e-mail cadastrado na DEEP. Enviaremos um link seguro de acesso — sem senha.</p>
              <div className="field"><label>E-mail</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="sualoja@email.com" /></div>
              <button type="submit" style={{width:'100%',padding:'12px'}} disabled={loading}>{loading?'Enviando...':'Receber link de acesso'}</button>
            </form>
          )}

          {msg && <div className={`msg ${msg.t}`}>{msg.m}</div>}
        </div>
      </div>
    </div>
  );
}
