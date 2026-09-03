import { NextResponse } from 'next/server';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { gerarVoucher } from '@/lib/totvsVoucher';

export const dynamic = 'force-dynamic';

const VALOR = { prata: 100, ouro: 200, platina: 500 };

function periodoEFim() {
  const nowF = new Date(Date.now() - 3 * 3600 * 1000); // America/Fortaleza (UTC-3)
  const y = nowF.getUTCFullYear();
  const m = nowF.getUTCMonth(); // 0-based
  const periodo_ref = `${y}-${String(m + 1).padStart(2, '0')}`;
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const endDate = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59.000-03:00`;
  return { periodo_ref, endDate };
}

export async function POST() {
  const a = await getAcesso();
  if (!a || a.papel !== 'cliente' || !a.cd_cliente) return NextResponse.json({ erro: 'sem_permissao' }, { status: 403 });

  // cliente bloqueado nao resgata
  const { data: cli } = await supabaseAdmin.from('clube_clientes').select('nome, situacao').eq('cd_cliente', a.cd_cliente).maybeSingle();
  if (!cli || (cli.situacao && cli.situacao !== 'Ativo')) return NextResponse.json({ erro: 'bloqueado' }, { status: 403 });

  const { data: saldo } = await supabaseAdmin.from('clube_saldos').select('categoria_efetiva').eq('cd_cliente', a.cd_cliente).maybeSingle();
  const nivel = saldo?.categoria_efetiva || 'sem_categoria';
  const valor = VALOR[nivel];
  if (!valor) return NextResponse.json({ erro: 'sem_voucher', nivel }, { status: 400 });

  const { periodo_ref, endDate } = periodoEFim();

  // ja existe do mes?
  const { data: existente } = await supabaseAdmin.from('clube_vouchers')
    .select('*').eq('cd_cliente', a.cd_cliente).eq('periodo_ref', periodo_ref).maybeSingle();
  if (existente && existente.voucher_code) {
    return NextResponse.json({ ok: true, ja: true, voucher: existente });
  }

  // reserva o mes (trava anti-duplo-clique) antes de chamar o TOTVS
  const { data: reserva, error: eRes } = await supabaseAdmin.from('clube_vouchers')
    .insert({ cd_cliente: a.cd_cliente, nivel, valor, periodo_ref, status: 'gerando', valido_ate: endDate.slice(0, 10) })
    .select('id').single();
  if (eRes) {
    // conflito = outra requisicao esta gerando; devolve o que houver
    return NextResponse.json({ erro: 'em_processamento' }, { status: 409 });
  }

  try {
    const v = await gerarVoucher({ valor, cdCliente: a.cd_cliente, nome: cli.nome, endDate });
    const { data: atualizado } = await supabaseAdmin.from('clube_vouchers')
      .update({ voucher_code: v.codigo, voucher_number: v.voucherNumber, voucher_number_pai: v.voucherNumberPai, status: 'ativo' })
      .eq('id', reserva.id).select('*').single();
    return NextResponse.json({ ok: true, voucher: atualizado });
  } catch (e) {
    // desfaz a reserva pra permitir nova tentativa
    await supabaseAdmin.from('clube_vouchers').delete().eq('id', reserva.id);
    return NextResponse.json({ erro: 'totvs', detalhe: String(e.message).slice(0, 300) }, { status: 502 });
  }
}
