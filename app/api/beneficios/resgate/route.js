import { NextResponse } from 'next/server';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { periodoAtual } from '@/lib/periodo';

export const dynamic = 'force-dynamic';

async function exigeEquipe() {
  const a = await getAcesso();
  if (!a || !['admin', 'comercial', 'suporte'].includes(a.papel)) return null;
  return a;
}

// Marca um beneficio como entregue ao cliente no periodo atual: { beneficio_id, cd_cliente, observacao? }
export async function POST(request) {
  const a = await exigeEquipe();
  if (!a) return NextResponse.json({ erro: 'sem_permissao' }, { status: 403 });
  const b = await request.json().catch(() => ({}));
  if (!b?.beneficio_id || !b?.cd_cliente) return NextResponse.json({ erro: 'dados_invalidos' }, { status: 400 });

  const { data: ben } = await supabaseAdmin.from('clube_beneficios').select('periodicidade').eq('id', b.beneficio_id).maybeSingle();
  if (!ben) return NextResponse.json({ erro: 'beneficio_inexistente' }, { status: 404 });
  const periodo_ref = periodoAtual(ben.periodicidade);

  const { error } = await supabaseAdmin.from('clube_beneficio_resgates').upsert({
    beneficio_id: b.beneficio_id, cd_cliente: String(b.cd_cliente), periodo_ref,
    registrado_por: a.email, observacao: b.observacao || null, dt_resgate: new Date().toISOString(),
  }, { onConflict: 'beneficio_id,cd_cliente,periodo_ref' });
  if (error) return NextResponse.json({ erro: 'falha', detalhe: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, periodo_ref });
}

// Desfaz uma baixa: { beneficio_id, cd_cliente, periodo_ref }
export async function DELETE(request) {
  const a = await exigeEquipe();
  if (!a) return NextResponse.json({ erro: 'sem_permissao' }, { status: 403 });
  const b = await request.json().catch(() => ({}));
  if (!b?.beneficio_id || !b?.cd_cliente || !b?.periodo_ref) return NextResponse.json({ erro: 'dados_invalidos' }, { status: 400 });
  const { error } = await supabaseAdmin.from('clube_beneficio_resgates').delete()
    .eq('beneficio_id', b.beneficio_id).eq('cd_cliente', String(b.cd_cliente)).eq('periodo_ref', b.periodo_ref);
  if (error) return NextResponse.json({ erro: 'falha', detalhe: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
