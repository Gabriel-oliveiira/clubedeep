import { NextResponse } from 'next/server';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// Dados do dashboard interativo (admin e suporte)
export async function GET(request) {
  const a = await getAcesso();
  if (!a || !['admin', 'suporte'].includes(a.papel)) {
    return NextResponse.json({ error: 'sem permissao' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const cat = searchParams.get('cat') || null;
  const loja = searchParams.get('loja') || null;
  const mes = searchParams.get('mes') || null;

  const { data, error } = await supabaseAdmin.rpc('dash_clube', {
    p_cat: cat, p_loja: loja, p_mes: mes,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || {});
}
