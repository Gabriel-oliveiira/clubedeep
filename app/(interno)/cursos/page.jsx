import { supabaseAdmin } from '@/lib/supabase/admin';
import NovoCurso from '@/components/NovoCurso';
import CursosTabelaAdmin from '@/components/CursosTabelaAdmin';

export const dynamic = 'force-dynamic';

export default async function GestaoCursosPage() {
  const { data: cursos } = await supabaseAdmin.from('clube_cursos').select('*').order('ordem').order('criado_em');
  const ids = (cursos || []).map(c => c.id);
  let aulas = [];
  if (ids.length) { const { data } = await supabaseAdmin.from('clube_aulas').select('id, curso_id').in('curso_id', ids); aulas = data || []; }
  const cont = {};
  aulas.forEach(a => { cont[a.curso_id] = (cont[a.curso_id] || 0) + 1; });

  return (
    <>
      <div className="page-head"><div><h1>Cursos</h1><div className="sub">Crie cursos e adicione as aulas (videos do YouTube).</div></div></div>

      <NovoCurso />

      <CursosTabelaAdmin cursos={cursos || []} cont={cont} />
    </>
  );
}
