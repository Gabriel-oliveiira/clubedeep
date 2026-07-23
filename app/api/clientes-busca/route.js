import { NextResponse } from 'next/server';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// Busca de clientes para o seletor de loja (so admin)
export async function GET(request) {
  const a = await getAcesso();
  if (!a || a.papel !== 'admin') return NextResponse.json({ error: 'sem permissao' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  if (q.length < 2) return NextResponse.json({ clientes: [] });

  const termo = q.replace(/[,%()*]/g, ' ').trim();
  const { data } = await supabaseAdmin
    .from('clube_clientes')
    .select('cd_cliente, nome, cpf_cnpj, cidade, uf')
    .or(`nome.ilike.%${termo}%,cpf_cnpj.ilike.%${termo}%,cd_cliente.ilike.%${termo}%`)
    .limit(10);
  return NextResponse.json({ clientes: data || [] });
}
