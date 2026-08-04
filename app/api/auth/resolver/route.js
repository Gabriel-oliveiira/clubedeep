import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { normalizarDoc, docValido } from '@/lib/doc';

export const dynamic = 'force-dynamic';

// Recebe um CPF/CNPJ e devolve o e-mail do acesso, para permitir login por documento.
export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ erro: 'dados_invalidos' }, { status: 400 }); }
  const doc = normalizarDoc(body?.doc);
  if (!docValido(doc)) return NextResponse.json({ erro: 'doc_invalido' }, { status: 400 });

  const { data: cli } = await supabaseAdmin
    .from('clube_clientes').select('cd_cliente').eq('cpf_cnpj', doc).limit(1).maybeSingle();
  if (!cli) return NextResponse.json({ erro: 'nao_encontrado' }, { status: 404 });

  const { data: ac } = await supabaseAdmin
    .from('painel_acessos').select('email').eq('cd_cliente', cli.cd_cliente)
    .eq('papel', 'cliente').eq('ativo', true).maybeSingle();
  if (!ac) return NextResponse.json({ erro: 'sem_acesso' }, { status: 404 });

  return NextResponse.json({ email: ac.email });
}
