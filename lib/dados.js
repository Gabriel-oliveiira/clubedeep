import { supabaseAdmin } from '@/lib/supabase/admin';

// Carrega saldo, extrato, trajetoria e pontos a expirar de um cliente
export async function carregarDados(cd) {
  const [{ data: saldo }, { data: extrato }, { data: trajetoria }, { data: aexp }, { data: ultimaVenda }] = await Promise.all([
    supabaseAdmin.from('clube_saldos').select('*').eq('cd_cliente', cd).maybeSingle(),
    supabaseAdmin.from('v_clube_extrato').select('*').eq('cd_cliente', cd).order('dt_ponto', { ascending: false }).limit(300),
    supabaseAdmin.from('clube_saldos_historico').select('*').eq('cd_cliente', cd).order('criado_em', { ascending: false }).limit(100),
    supabaseAdmin.from('v_clube_pontos_a_expirar').select('*').eq('cd_cliente', cd).maybeSingle(),
    supabaseAdmin.from('clube_vendas').select('loja, dt_venda').eq('cd_cliente', cd).eq('status', 'ativa').order('dt_venda', { ascending: false }).limit(1).maybeSingle(),
  ]);
  return { saldo, extrato: extrato || [], trajetoria: trajetoria || [], aexp, lojaUltima: ultimaVenda?.loja || null };
}
