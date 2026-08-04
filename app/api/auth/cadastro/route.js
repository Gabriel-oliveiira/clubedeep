import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { normalizarDoc, docValido } from '@/lib/doc';

export const dynamic = 'force-dynamic';

// Cadastro do cliente: so libera se o CPF/CNPJ existir em clube_clientes.
export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ erro: 'dados_invalidos' }, { status: 400 }); }
  const doc = normalizarDoc(body?.doc);
  const email = String(body?.email || '').trim().toLowerCase();
  const senha = String(body?.senha || '');
  const nome = body?.nome ? String(body.nome).trim() : null;

  if (!docValido(doc)) return NextResponse.json({ erro: 'doc_invalido' }, { status: 400 });
  if (!email.includes('@')) return NextResponse.json({ erro: 'email_invalido' }, { status: 400 });
  if (senha.length < 6) return NextResponse.json({ erro: 'senha_curta' }, { status: 400 });

  // 1) o documento existe na base do clube?
  const { data: cli } = await supabaseAdmin
    .from('clube_clientes').select('cd_cliente, nome').eq('cpf_cnpj', doc).limit(1).maybeSingle();
  if (!cli) return NextResponse.json({ erro: 'nao_encontrado' }, { status: 404 });

  // 2) ja existe acesso para esse email ou para esse cliente?
  const { data: jaEmail } = await supabaseAdmin.from('painel_acessos').select('email').eq('email', email).maybeSingle();
  if (jaEmail) return NextResponse.json({ erro: 'email_em_uso' }, { status: 409 });
  const { data: jaCli } = await supabaseAdmin
    .from('painel_acessos').select('email').eq('cd_cliente', cli.cd_cliente).eq('papel', 'cliente').maybeSingle();
  if (jaCli) return NextResponse.json({ erro: 'cliente_ja_cadastrado' }, { status: 409 });

  // 3) cria o usuario de autenticacao (email ja confirmado)
  const { data: novo, error: e1 } = await supabaseAdmin.auth.admin.createUser({
    email, password: senha, email_confirm: true,
  });
  if (e1) return NextResponse.json({ erro: 'auth', detalhe: e1.message }, { status: 400 });

  // 4) cria o acesso ligado ao cd_cliente
  const { error: e2 } = await supabaseAdmin.from('painel_acessos')
    .insert({ email, papel: 'cliente', cd_cliente: cli.cd_cliente, nome: nome || cli.nome });
  if (e2) {
    await supabaseAdmin.auth.admin.deleteUser(novo.user.id).catch(() => {});
    return NextResponse.json({ erro: 'acesso', detalhe: e2.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, email });
}
