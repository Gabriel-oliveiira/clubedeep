import { NextResponse } from 'next/server';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// Todas as operacoes exigem papel admin
async function exigeAdmin() {
  const a = await getAcesso();
  if (!a || a.papel !== 'admin') return null;
  return a;
}

// Lista os acessos do painel
export async function GET() {
  const a = await exigeAdmin();
  if (!a) return NextResponse.json({ error: 'sem permissao' }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from('painel_acessos')
    .select('email, papel, cd_cliente, criado_em')
    .order('papel', { ascending: true })
    .order('email', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // junta o nome da loja quando houver
  const codigos = [...new Set((data || []).map(r => r.cd_cliente).filter(Boolean))];
  let nomes = {};
  if (codigos.length) {
    const { data: cli } = await supabaseAdmin.from('clube_clientes').select('cd_cliente, nome').in('cd_cliente', codigos);
    (cli || []).forEach(c => { nomes[c.cd_cliente] = c.nome; });
  }
  const rows = (data || []).map(r => ({ ...r, loja_nome: r.cd_cliente ? (nomes[r.cd_cliente] || null) : null }));
  return NextResponse.json({ usuarios: rows });
}

// Cria usuario: { email, papel, senha?, cd_cliente? }
export async function POST(request) {
  const a = await exigeAdmin();
  if (!a) return NextResponse.json({ error: 'sem permissao' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const papel = String(body.papel || '');
  const senha = String(body.senha || '');
  const cd_cliente = body.cd_cliente ? String(body.cd_cliente) : null;

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: 'E-mail invalido.' }, { status: 400 });
  if (!['admin', 'suporte', 'loja'].includes(papel)) return NextResponse.json({ error: 'Papel invalido.' }, { status: 400 });

  if (papel === 'loja') {
    if (!cd_cliente) return NextResponse.json({ error: 'Selecione a loja (cliente) para vincular.' }, { status: 400 });
    const { data: cli } = await supabaseAdmin.from('clube_clientes').select('cd_cliente').eq('cd_cliente', cd_cliente).maybeSingle();
    if (!cli) return NextResponse.json({ error: 'Cliente nao encontrado.' }, { status: 400 });
  } else {
    if (senha.length < 8) return NextResponse.json({ error: 'Senha deve ter pelo menos 8 caracteres.' }, { status: 400 });
    // cria a conta de login (equipe entra com senha)
    const { error: eAuth } = await supabaseAdmin.auth.admin.createUser({ email, password: senha, email_confirm: true });
    if (eAuth && !/already.*(registered|exists)/i.test(eAuth.message || '')) {
      return NextResponse.json({ error: `Erro ao criar login: ${eAuth.message}` }, { status: 500 });
    }
  }

  const { error: eAcc } = await supabaseAdmin
    .from('painel_acessos')
    .upsert({ email, papel, cd_cliente: papel === 'loja' ? cd_cliente : null }, { onConflict: 'email' });
  if (eAcc) return NextResponse.json({ error: eAcc.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

// Revoga acesso: { email }
export async function DELETE(request) {
  const a = await exigeAdmin();
  if (!a) return NextResponse.json({ error: 'sem permissao' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  if (!email) return NextResponse.json({ error: 'E-mail obrigatorio.' }, { status: 400 });
  if (email === a.email) return NextResponse.json({ error: 'Voce nao pode revogar o proprio acesso.' }, { status: 400 });

  const { error } = await supabaseAdmin.from('painel_acessos').delete().eq('email', email);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
