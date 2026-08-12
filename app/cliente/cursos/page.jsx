import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { rankNivel, labelCategoria } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function CursosCliente() {
  const a = await getAcesso();
  if (!a) redirect('/login');
  if (a.papel !== 'cliente') redirect('/');

  const { data: saldo } = await supabaseAdmin.from('clube_saldos').select('categoria_efetiva').eq('cd_cliente', a.cd_cliente).maybeSingle();
  const nivel = saldo?.categoria_efetiva || 'sem_categoria';

  // Sem nivel = sem acesso a nenhum beneficio/curso
  if (rankNivel(nivel) < 1) {
    return (
      <>
        <div className="page-head"><div><p style={{ margin: '0 0 6px' }}><a className="muted" href="/cliente">&larr; Inicio</a></p><h1>Cursos e treinamentos</h1></div></div>
        <div className="card">
          <h2>Acesso liberado a partir do nivel Bronze</h2>
          <p className="muted">Assim que voce atingir o nivel <b>Bronze</b>, todos os cursos ficam liberados aqui. Continue comprando para desbloquear.</p>
        </div>
      </>
    );
  }

  const { data: cursos } = await supabaseAdmin
    .from('clube_cursos').select('*').eq('ativo', true).order('ordem').order('criado_em');
  const acessiveis = (cursos || []).filter(c => rankNivel(c.nivel_minimo) <= rankNivel(nivel));
  const ids = acessiveis.map(c => c.id);

  let aulas = [], prog = [];
  if (ids.length) {
    const [{ data: al }, { data: pr }] = await Promise.all([
      supabaseAdmin.from('clube_aulas').select('id, curso_id').eq('ativo', true).in('curso_id', ids),
      supabaseAdmin.from('clube_aula_progresso').select('aula_id, concluida').eq('cd_cliente', a.cd_cliente).eq('concluida', true),
    ]);
    aulas = al || []; prog = pr || [];
  }
  const concluidas = new Set(prog.map(p => p.aula_id));
  const porCurso = {};
  for (const al of aulas) {
    porCurso[al.curso_id] = porCurso[al.curso_id] || { total: 0, feitas: 0 };
    porCurso[al.curso_id].total++;
    if (concluidas.has(al.id)) porCurso[al.curso_id].feitas++;
  }

  return (
    <>
      <div className="page-head">
        <div>
          <p style={{ margin: '0 0 6px' }}><a className="muted" href="/cliente">&larr; Inicio</a></p>
          <h1>Cursos e treinamentos</h1><div className="sub">Seu nivel: {labelCategoria(nivel)}</div>
        </div>
      </div>

      {acessiveis.length === 0 ? (
        <div className="card"><div className="empty">Nenhum curso disponivel ainda. Em breve!</div></div>
      ) : (
        <div className="grid cols-3">
          {acessiveis.map(c => {
            const s = porCurso[c.id] || { total: 0, feitas: 0 };
            const pct = s.total ? Math.round((s.feitas / s.total) * 100) : 0;
            return (
              <a key={c.id} href={`/cliente/cursos/${c.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                {c.capa_url && <img src={c.capa_url} alt="" style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }} />}
                <h2 style={{ marginTop: 0 }}>{c.titulo}</h2>
                {c.descricao && <p className="muted" style={{ fontSize: 13.5 }}>{c.descricao}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, margin: '10px 0 6px' }}>
                  <span className="muted">{s.total} aula(s)</span><span className="muted">{pct}%</span>
                </div>
                <div style={{ height: 7, background: '#efe9e1', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--brand-2,#c99a5b)' }} />
                </div>
              </a>
            );
          })}
        </div>
      )}
    </>
  );
}
