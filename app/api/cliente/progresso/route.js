import { NextResponse } from 'next/server';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// Cliente marca progresso/conclusao de uma aula (cd_cliente vem da sessao, nunca do body).
export async function POST(request) {
  const a = await getAcesso();
  if (!a || a.papel !== 'cliente' || !a.cd_cliente) return NextResponse.json({ erro: 'sem_permissao' }, { status: 403 });

  const b = await request.json().catch(() => ({}));
  const aula_id = b?.aula_id;
  if (!aula_id) return NextResponse.json({ erro: 'aula_invalida' }, { status: 400 });

  const row = { cd_cliente: a.cd_cliente, aula_id, atualizado_em: new Date().toISOString() };
  if (Number.isFinite(b?.segundos)) row.segundos_vistos = Math.max(0, Math.floor(b.segundos));
  if (b?.concluida === true) { row.concluida = true; row.dt_conclusao = new Date().toISOString(); }
  if (b?.concluida === false) { row.concluida = false; row.dt_conclusao = null; }

  const { error } = await supabaseAdmin
    .from('clube_aula_progresso').upsert(row, { onConflict: 'cd_cliente,aula_id' });
  if (error) return NextResponse.json({ erro: 'falha', detalhe: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
