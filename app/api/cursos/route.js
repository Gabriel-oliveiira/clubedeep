import { NextResponse } from 'next/server';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { extrairYoutubeId } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

const NIVEIS = ['bronze', 'prata', 'ouro', 'platina'];

export async function POST(request) {
  const a = await getAcesso();
  if (!a || !['admin', 'comercial'].includes(a.papel)) return NextResponse.json({ erro: 'sem_permissao' }, { status: 403 });

  const b = await request.json().catch(() => ({}));
  const op = b?.op;
  const db = supabaseAdmin;

  try {
    if (op === 'curso_criar') {
      if (!b.titulo?.trim()) return NextResponse.json({ erro: 'titulo_obrigatorio' }, { status: 400 });
      const { data, error } = await db.from('clube_cursos').insert({
        titulo: b.titulo.trim(), descricao: b.descricao || null,
        nivel_minimo: NIVEIS.includes(b.nivel_minimo) ? b.nivel_minimo : 'bronze',
        capa_url: b.capa_url || null,
        ordem: Number(b.ordem) || 0, criado_por: a.email,
      }).select('id').single();
      if (error) throw error;
      return NextResponse.json({ ok: true, id: data.id });
    }

    if (op === 'curso_editar') {
      if (!b.id) return NextResponse.json({ erro: 'id' }, { status: 400 });
      const patch = { atualizado_em: new Date().toISOString() };
      if (b.titulo != null) patch.titulo = String(b.titulo).trim();
      if (b.descricao != null) patch.descricao = b.descricao || null;
      if (b.nivel_minimo != null) patch.nivel_minimo = NIVEIS.includes(b.nivel_minimo) ? b.nivel_minimo : 'bronze';
      if (b.capa_url != null) patch.capa_url = b.capa_url || null;
      if (b.ordem != null) patch.ordem = Number(b.ordem) || 0;
      if (b.ativo != null) patch.ativo = !!b.ativo;
      const { error } = await db.from('clube_cursos').update(patch).eq('id', b.id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (op === 'curso_excluir') {
      if (!b.id) return NextResponse.json({ erro: 'id' }, { status: 400 });
      const { error } = await db.from('clube_cursos').delete().eq('id', b.id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (op === 'aula_criar') {
      if (!b.curso_id) return NextResponse.json({ erro: 'curso' }, { status: 400 });
      if (!b.titulo?.trim()) return NextResponse.json({ erro: 'titulo_obrigatorio' }, { status: 400 });
      const yid = extrairYoutubeId(b.youtube);
      if (!yid) return NextResponse.json({ erro: 'youtube_invalido' }, { status: 400 });
      const { error } = await db.from('clube_aulas').insert({
        curso_id: b.curso_id, titulo: b.titulo.trim(), descricao: b.descricao || null,
        youtube_id: yid, ordem: Number(b.ordem) || 0,
        duracao_seg: Number.isFinite(b.duracao_seg) ? Math.floor(b.duracao_seg) : null,
      });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (op === 'aula_editar') {
      if (!b.id) return NextResponse.json({ erro: 'id' }, { status: 400 });
      const patch = {};
      if (b.titulo != null) patch.titulo = String(b.titulo).trim();
      if (b.descricao != null) patch.descricao = b.descricao || null;
      if (b.ordem != null) patch.ordem = Number(b.ordem) || 0;
      if (b.ativo != null) patch.ativo = !!b.ativo;
      if (b.youtube != null) {
        const yid = extrairYoutubeId(b.youtube);
        if (!yid) return NextResponse.json({ erro: 'youtube_invalido' }, { status: 400 });
        patch.youtube_id = yid;
      }
      const { error } = await db.from('clube_aulas').update(patch).eq('id', b.id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (op === 'aula_excluir') {
      if (!b.id) return NextResponse.json({ erro: 'id' }, { status: 400 });
      const { error } = await db.from('clube_aulas').delete().eq('id', b.id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ erro: 'op_invalida' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ erro: 'falha', detalhe: e.message }, { status: 400 });
  }
}
