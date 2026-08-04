import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { rankNivel } from '@/lib/format';
import CursoView from '@/components/CursoView';

export const dynamic = 'force-dynamic';

export default async function CursoDetalhe({ params }) {
  const a = await getAcesso();
  if (!a) redirect('/login');
  if (a.papel !== 'cliente') redirect('/');

  const { data: saldo } = await supabaseAdmin.from('clube_saldos').select('categoria_efetiva').eq('cd_cliente', a.cd_cliente).maybeSingle();
  const nivel = saldo?.categoria_efetiva || 'sem_categoria';
  if (rankNivel(nivel) < 1) redirect('/cliente/cursos');

  const { data: curso } = await supabaseAdmin.from('clube_cursos').select('*').eq('id', params.id).eq('ativo', true).maybeSingle();
  if (!curso || rankNivel(curso.nivel_minimo) > rankNivel(nivel)) redirect('/cliente/cursos');

  const [{ data: aulas }, { data: prog }] = await Promise.all([
    supabaseAdmin.from('clube_aulas').select('id, titulo, descricao, youtube_id, ordem').eq('curso_id', curso.id).eq('ativo', true).order('ordem').order('criado_em'),
    supabaseAdmin.from('clube_aula_progresso').select('aula_id').eq('cd_cliente', a.cd_cliente).eq('concluida', true),
  ]);
  const concluidas = (prog || []).map(p => p.aula_id);

  return (
    <>
      <div className="page-head">
        <div>
          <p style={{ margin: '0 0 6px' }}><a className="muted" href="/cliente/cursos">&larr; Cursos</a></p>
          <h1>{curso.titulo}</h1>
          {curso.descricao && <div className="sub">{curso.descricao}</div>}
        </div>
      </div>
      <CursoView curso={curso} aulas={aulas || []} concluidasIniciais={concluidas} />
    </>
  );
}
