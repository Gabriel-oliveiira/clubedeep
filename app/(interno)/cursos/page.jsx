import { supabaseAdmin } from '@/lib/supabase/admin';
import { labelCategoria, dataBR } from '@/lib/format';
import NovoCurso from '@/components/NovoCurso';

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

      <div className="card flush" style={{ marginTop: 16 }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Curso</th><th>Nivel minimo</th><th style={{ textAlign: 'center' }}>Aulas</th><th>Status</th><th>Criado</th></tr></thead>
            <tbody>
              {(cursos || []).map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }}>
                  <td><a href={`/cursos/${c.id}`} style={{ fontWeight: 600, color: 'inherit', textDecoration: 'none' }}>{c.titulo}</a>
                    {c.descricao && <span className="sub">{c.descricao}</span>}</td>
                  <td>{labelCategoria(c.nivel_minimo)}+</td>
                  <td style={{ textAlign: 'center' }}>{cont[c.id] || 0}</td>
                  <td>{c.ativo ? <span className="chip" style={{ background: '#e6f4ea', color: '#1da851' }}>ativo</span> : <span className="chip">inativo</span>}</td>
                  <td className="muted">{dataBR(c.criado_em)}</td>
                </tr>
              ))}
              {(!cursos || cursos.length === 0) && <tr><td colSpan={5}><div className="empty">Nenhum curso ainda. Crie o primeiro acima.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
