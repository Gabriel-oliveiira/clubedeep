import { NextResponse } from 'next/server';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const int = (v, d = 0) => Math.round(num(v, d));

function limparTicket(arr) {
  return (Array.isArray(arr) ? arr : [])
    .map(f => ({ min: num(f.min), pontos: num(f.pontos) }))
    .filter(f => f.min > 0 && f.pontos > 0)
    .sort((a, b) => a.min - b.min);
}
function limparRecorrencia(arr) {
  return (Array.isArray(arr) ? arr : [])
    .map(f => ({ meses: int(f.meses), pontos: num(f.pontos) }))
    .filter(f => f.meses >= 1 && f.pontos > 0)
    .sort((a, b) => a.meses - b.meses);
}

export async function POST(request) {
  const a = await getAcesso();
  if (!a || a.papel !== 'admin') return NextResponse.json({ erro: 'sem_permissao' }, { status: 403 });

  const b = await request.json().catch(() => ({}));
  const op = b?.op;
  try {
    if (op === 'config_salvar') {
      const patch = {
        min_transacao: num(b.min_transacao, 2500),
        validade_dias: int(b.validade_dias, 180),
        carencia_dias: int(b.carencia_dias, 15),
        nivel_bronze: num(b.nivel_bronze, 2500),
        nivel_prata: num(b.nivel_prata, 30000),
        nivel_ouro: num(b.nivel_ouro, 48000),
        nivel_platina: num(b.nivel_platina, 72000),
        boas_vindas_ativo: !!b.boas_vindas_ativo,
        boas_vindas_pontos: num(b.boas_vindas_pontos, 0),
        ticket_faixas: limparTicket(b.ticket_faixas),
        recorrencia_faixas: limparRecorrencia(b.recorrencia_faixas),
        atualizado_em: new Date().toISOString(),
      };
      const { error } = await supabaseAdmin.from('clube_motor_config').update(patch).eq('id', 1);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (op === 'gatilho_criar') {
      if (!b.nome?.trim()) return NextResponse.json({ erro: 'nome_obrigatorio' }, { status: 400 });
      const { error } = await supabaseAdmin.from('clube_gatilhos').insert({
        nome: b.nome.trim(),
        tipo: ['boas_vindas', 'campanha'].includes(b.tipo) ? b.tipo : 'boas_vindas',
        pontos: num(b.pontos, 0),
        min_venda: b.min_venda === '' || b.min_venda == null ? null : num(b.min_venda),
        data_inicio: b.data_inicio || null,
        data_fim: b.data_fim || null,
        ativo: b.ativo == null ? true : !!b.ativo,
      });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (op === 'gatilho_editar') {
      if (!b.id) return NextResponse.json({ erro: 'id' }, { status: 400 });
      const patch = {};
      if (b.nome != null) patch.nome = String(b.nome).trim();
      if (b.tipo != null) patch.tipo = ['boas_vindas', 'campanha'].includes(b.tipo) ? b.tipo : 'boas_vindas';
      if (b.pontos != null) patch.pontos = num(b.pontos, 0);
      if (b.min_venda !== undefined) patch.min_venda = b.min_venda === '' || b.min_venda == null ? null : num(b.min_venda);
      if (b.data_inicio !== undefined) patch.data_inicio = b.data_inicio || null;
      if (b.data_fim !== undefined) patch.data_fim = b.data_fim || null;
      if (b.ativo != null) patch.ativo = !!b.ativo;
      const { error } = await supabaseAdmin.from('clube_gatilhos').update(patch).eq('id', b.id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (op === 'gatilho_excluir') {
      if (!b.id) return NextResponse.json({ erro: 'id' }, { status: 400 });
      const { error } = await supabaseAdmin.from('clube_gatilhos').delete().eq('id', b.id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (op === 'recalcular') {
      const { error } = await supabaseAdmin.rpc('recalcular_motor');
      if (error) throw error;
      const { data } = await supabaseAdmin.from('clube_saldos').select('categoria_efetiva');
      const dist = { sem_categoria: 0, bronze: 0, prata: 0, ouro: 0, platina: 0 };
      (data || []).forEach(r => { const k = r.categoria_efetiva || 'sem_categoria'; dist[k] = (dist[k] || 0) + 1; });
      return NextResponse.json({ ok: true, distribuicao: dist });
    }

    return NextResponse.json({ erro: 'op_invalida' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ erro: 'falha', detalhe: e.message }, { status: 400 });
  }
}
