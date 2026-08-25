import { NextResponse } from 'next/server';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// Atualiza o proprio nome. (A senha e trocada no cliente via supabase.auth.updateUser)
export async function POST(request) {
  const a = await getAcesso();
  if (!a || !a.papel) return NextResponse.json({ erro: 'sem_permissao' }, { status: 403 });
  const b = await request.json().catch(() => ({}));
  const nome = b?.nome != null ? String(b.nome).trim() : null;
  const { error } = await supabaseAdmin.from('painel_acessos').update({ nome: nome || null }).eq('email', a.email);
  if (error) return NextResponse.json({ erro: 'falha', detalhe: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
