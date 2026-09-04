import { NextResponse } from 'next/server';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
const NIVEIS = ['bronze', 'prata', 'ouro', 'platina'];
const PERIODOS = ['unico', 'mensal', 'anual'];
const FORMAS = ['automatico', 'resgate_cliente', 'equipe'];

export async function POST(request) {
  const a = await getAcesso();
  if (!a || !['admin', 'comercial'].includes(a.papel)) return NextResponse.json({ erro: 'sem_permissao' }, { status: 403 });

  const b = await request.json().catch(() => ({}));
  const op = b?.op;
  try {
    if (op === 'beneficio_criar') {
      if (!b.titulo?.trim()) return NextResponse.json({ erro: 'titulo_obrigatorio' }, { status: 400 });
      const { error } = await supabaseAdmin.from('clube_beneficios').insert({
        titulo: b.titulo.trim(), descricao: b.descricao || null,
        nivel_minimo: NIVEIS.includes(b.nivel_minimo) ? b.nivel_minimo : 'bronze',
        periodicidade: PERIODOS.includes(b.periodicidade) ? b.periodicidade : 'unico',
        forma_entrega: FORMAS.includes(b.forma_entrega) ? b.forma_entrega : 'equipe',
        imagem_url: b.imagem_url || null, conteudo: b.conteudo || null, como_resgatar: b.como_resgatar || null,
        ordem: Number(b.ordem) || 0, criado_por: a.email,
      });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }
    if (op === 'beneficio_editar') {
      if (!b.id) return NextResponse.json({ erro: 'id' }, { status: 400 });
      const patch = { atualizado_em: new Date().toISOString() };
      if (b.titulo != null) patch.titulo = String(b.titulo).trim();
      if (b.descricao != null) patch.descricao = b.descricao || null;
      if (b.nivel_minimo != null) patch.nivel_minimo = NIVEIS.includes(b.nivel_minimo) ? b.nivel_minimo : 'bronze';
      if (b.periodicidade != null) patch.periodicidade = PERIODOS.includes(b.periodicidade) ? b.periodicidade : 'unico';
      if (b.forma_entrega != null) patch.forma_entrega = FORMAS.includes(b.forma_entrega) ? b.forma_entrega : 'equipe';
      if (b.imagem_url != null) patch.imagem_url = b.imagem_url || null;
      if (b.conteudo != null) patch.conteudo = b.conteudo || null;
      if (b.como_resgatar != null) patch.como_resgatar = b.como_resgatar || null;
      if (b.ordem != null) patch.ordem = Number(b.ordem) || 0;
      if (b.ativo != null) patch.ativo = !!b.ativo;
      const { error } = await supabaseAdmin.from('clube_beneficios').update(patch).eq('id', b.id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }
    if (op === 'beneficio_excluir') {
      if (!b.id) return NextResponse.json({ erro: 'id' }, { status: 400 });
      const { error } = await supabaseAdmin.from('clube_beneficios').delete().eq('id', b.id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ erro: 'op_invalida' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ erro: 'falha', detalhe: e.message }, { status: 400 });
  }
}
