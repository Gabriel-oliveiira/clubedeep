'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/client';

export default function Cadastro() {
  const router = useRouter();
  const [doc, setDoc] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senha2, setSenha2] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [semAcesso, setSemAcesso] = useState(false);

  const WPP = process.env.NEXT_PUBLIC_WHATSAPP_SUPORTE || '5585999999999';
  const linkWpp = `https://wa.me/${WPP}?text=${encodeURIComponent('Ola! Quero entender o Clube Deep e como conseguir acesso.')}`;

  async function enviar(e) {
    e.preventDefault();
    setMsg(null); setSemAcesso(false);
    if (senha !== senha2) { setMsg({ t: 'err', m: 'As senhas nao conferem.' }); return; }
    setLoading(true);
    const r = await fetch('/api/auth/cadastro', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doc, email, senha }),
    });
    const j = await r.json().catch(() => ({}));

    if (r.ok) {
      // loga automaticamente e leva para a area do cliente
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });
      setLoading(false);
      if (error) { setMsg({ t: 'ok', m: 'Cadastro criado! Faca login para entrar.' }); router.push('/login'); return; }
      router.push('/cliente'); router.refresh();
      return;
    }

    setLoading(false);
    if (j.erro === 'nao_encontrado') { setSemAcesso(true); return; }
    const textos = {
      doc_invalido: 'CPF/CNPJ invalido.',
      email_invalido: 'E-mail invalido.',
      senha_curta: 'A senha precisa ter ao menos 6 caracteres.',
      email_em_uso: 'Este e-mail ja possui acesso. Tente fazer login.',
      cliente_ja_cadastrado: 'Este CPF/CNPJ ja tem um acesso. Tente fazer login.',
    };
    setMsg({ t: 'err', m: textos[j.erro] || 'Nao foi possivel concluir o cadastro.' });
  }

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-logo">
          <img src="/deep-logo.png" alt="DEEP" />
          <small>Clube Deep &middot; Criar acesso</small>
        </div>
        <div className="login-card">
          {semAcesso ? (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ marginTop: 0 }}>Ainda nao encontramos voce no Clube</h3>
              <p className="muted" style={{ fontSize: 14 }}>
                Seu CPF/CNPJ ainda nao esta liberado no Clube Deep. Fale com a nossa equipe
                no WhatsApp para entender como participar e conseguir acesso aos beneficios.
              </p>
              <a href={linkWpp} target="_blank" rel="noopener noreferrer"
                 className="btn" style={{ display: 'inline-block', background: '#1da851', color: '#fff', padding: '12px 20px', borderRadius: 10, textDecoration: 'none', marginTop: 6 }}>
                Falar no WhatsApp
              </a>
              <div style={{ marginTop: 16 }}>
                <button type="button" className="link" onClick={() => setSemAcesso(false)} style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer' }}>
                  Tentar outro documento
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={enviar}>
              <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
                Informe seu CPF ou CNPJ cadastrado na DEEP para criar seu acesso.
              </p>
              <div className="field"><label>CPF ou CNPJ</label>
                <input value={doc} onChange={e => setDoc(e.target.value)} required inputMode="numeric" placeholder="Somente numeros" /></div>
              <div className="field"><label>E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="voce@email.com" /></div>
              <div className="field"><label>Senha</label>
                <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required placeholder="Minimo 6 caracteres" /></div>
              <div className="field"><label>Confirmar senha</label>
                <input type="password" value={senha2} onChange={e => setSenha2(e.target.value)} required placeholder="Repita a senha" /></div>
              <button type="submit" style={{ width: '100%', padding: '12px' }} disabled={loading}>{loading ? 'Criando...' : 'Criar acesso'}</button>
              <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13 }}>
                Ja tem acesso? <a href="/login" style={{ color: 'var(--brand)' }}>Entrar</a>
              </div>
            </form>
          )}
          {msg && <div className={`msg ${msg.t}`}>{msg.m}</div>}
        </div>
      </div>
    </div>
  );
}
