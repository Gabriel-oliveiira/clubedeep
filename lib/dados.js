import { supabaseAdmin } from '@/lib/supabase/admin';

// Carrega saldo, extrato, trajetoria e pontos a expirar de um cliente
export async function carregarDados(cd) {
  const [{ data: saldo }, { data: extrato }, { data: trajetoria }, { data: aexp }] = await Promise.all([
    supabaseAdmin.from('clube_saldos').select('*').eq('cd_cliente', cd).maybeSingle(),
    supabaseAdmin.from('v_clube_extrato').select('*').eq('cd_cliente', cd).order('dt_ponto', { ascending: false }).limit(300),
    supabaseAdmin.from('clube_saldos_historico').select('*').eq('cd_cliente', cd).order('criado_em', { ascending: false }).limit(100),
    supabaseAdmin.from('v_clube_pontos_a_expirar').select('*').eq('cd_cliente', cd).maybeSingle(),
  ]);
  return { saldo, extrato: extrato || [], trajetoria: trajetoria || [], aexp };
}
