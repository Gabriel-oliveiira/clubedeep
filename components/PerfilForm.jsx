'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/client';

export default function PerfilForm({ email, nomeInicial, papel }) {
  const router = useRouter();
  const [nome, setNome] = useState(nomeInicial || '');
  const [msgNome, setMsgNome] = useState(null);
  const [senha, setSenha] = useState('');
  const [senha2, setSenha2] = useState('');
  const [msgSenha, setMsgSenha] = useState(null);
  const [l1, setL1] = useState(false);
  const [l2, setL2] = useState(false);

  async function salvarNome(e) {
    e.preventDefault(); setMsgNome(null); setL1(true);
    const r = await fetch('/api/perfil', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome }) });
    setL1(false);
    setMsgNome(r.ok ? { t: 'ok', m: 'Nome atualizado!' } : { t: 'err', m: 'Erro ao salvar o nome.' });
    if (r.ok) router.refresh();
  }

  async function trocarSenha(e) {
    e.preventDefault(); setMsgSenha(null);
    if (senha.length < 6) { setMsgSenha({ t: 'err', m: 'A senha precisa ter ao menos 6 caracteres.' }); return; }
    if (senha !== senha2) { setMsgSenha({ t: 'err', m: 'As senhas nao conferem.' }); return; }
    setL2(true);
    const { error } = await getSupabaseBrowser().auth.updateUser({ password: senha });
    setL2(false);
    if (error) { setMsgSenha({ t: 'err', m: 'Nao foi possivel trocar a senha. Saia e entre de novo e tente outra vez.' }); return; }
    setSenha(''); setSenha2(''); setMsgSenha({ t: 'ok', m: 'Senha alterada com sucesso!' });
  }

  return (
    <div className="grid cols-2">
      <form onSubmit={salvarNome} className="card">
        <h2 style={{ marginTop: 0 }}>Meus dados</h2>
        <div className="field"><label>E-mail</label><input value={email} readOnly style={{ background: '#f4ede5' }} /></div>
        <div className="field"><label>Nome</label><input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" /></div>
        <button type="submit" disabled={l1}>{l1 ? 'Salvando...' : 'Salvar nome'}</button>
        {msgNome && <div className={`msg ${msgNome.t}`} style={{ marginTop: 10 }}>{msgNome.m}</div>}
      </form>

      <form onSubmit={trocarSenha} className="card">
        <h2 style={{ marginTop: 0 }}>Trocar senha</h2>
        <div className="field"><label>Nova senha</label><input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Minimo 6 caracteres" /></div>
        <div className="field"><label>Confirmar nova senha</label><input type="password" value={senha2} onChange={e => setSenha2(e.target.value)} placeholder="Repita a senha" /></div>
        <button type="submit" disabled={l2}>{l2 ? 'Alterando...' : 'Alterar senha'}</button>
        {msgSenha && <div className={`msg ${msgSenha.t}`} style={{ marginTop: 10 }}>{msgSenha.m}</div>}
      </form>
    </div>
  );
}
