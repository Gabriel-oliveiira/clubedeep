import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import GestaoCurso from '@/components/GestaoCurso';

export const dynamic = 'force-dynamic';

export default async function EditarCurso({ params }) {
  const { data: curso } = await supabaseAdmin.from('clube_cursos').select('*').eq('id', params.id).maybeSingle();
  if (!curso) redirect('/cursos');
  const { data: aulas } = await supabaseAdmin.from('clube_aulas').select('*').eq('curso_id', curso.id).order('ordem').order('criado_em');

  return (
    <>
      <div className="page-head">
        <div>
          <p style={{ margin: '0 0 6px' }}><a className="muted" href="/cursos">&larr; Cursos</a></p>
          <h1>{curso.titulo}</h1>
        </div>
      </div>
      <GestaoCurso curso={curso} aulas={aulas || []} />
    </>
  );
}
