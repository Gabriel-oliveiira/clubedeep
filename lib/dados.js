import { supabaseAdmin } from '@/lib/supabase/admin';

// Carrega saldo, extrato, trajetoria e pontos a expirar de um cliente
export async function carregarDados(cd) {
  const [{ data: saldo }, { data: extrato }, { data: trajetoria }, { data: aexp }, { data: ultimaVenda }] = await Promise.all([
    supabaseAdmin.from('clube_saldos').select('*').eq('cd_cliente', cd).maybeSingle(),
    supabaseAdmin.from('v_clube_extrato').select('*').eq('cd_cliente', cd).order('dt_ponto', { ascending: true }).limit(300),
    supabaseAdmin.from('clube_saldos_historico').select('*').eq('cd_cliente', cd).order('criado_em', { ascending: false }).limit(100),
    supabaseAdmin.from('v_clube_pontos_a_expirar').select('*').eq('cd_cliente', cd).maybeSingle(),
    supabaseAdmin.from('clube_vendas').select('loja, dt_venda').eq('cd_cliente', cd).eq('status', 'ativa').order('dt_venda', { ascending: false }).limit(1).maybeSingle(),
  ]);
  // Ordem historica p/ auditoria: por data; no mesmo dia, agrupa por transacao
  // e mantem a venda antes do bonus de ticket medio que ela gerou (mesma
  // referencia e mesma dt_venda).
  const rank = { venda: 0, ticket_medio: 1 };
  const extratoOrdenado = (extrato || []).slice().sort((a, b) => {
    const d = new Date(a.dt_ponto) - new Date(b.dt_ponto);
    if (d !== 0) return d;                                   // 1o: cronologico
    const ref = String(a.referencia || '').localeCompare(String(b.referencia || ''));
    if (ref !== 0) return ref;                               // 2o: mesma transacao junta
    return (rank[a.origem] ?? 2) - (rank[b.origem] ?? 2);    // 3o: venda antes do bonus
  });
  return { saldo, extrato: extratoOrdenado, trajetoria: trajetoria || [], aexp, lojaUltima: ultimaVenda?.loja || null };
}
