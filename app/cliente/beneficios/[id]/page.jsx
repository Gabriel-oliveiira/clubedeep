import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { rankNivel, labelCategoria, labelPeriodicidade, labelFormaEntrega } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function BeneficioDetalhe({ params }) {
  const a = await getAcesso();
  if (!a) redirect('/login');
  if (a.papel !== 'cliente') redirect('/');

  const { data: saldo } = await supabaseAdmin.from('clube_saldos').select('categoria_efetiva').eq('cd_cliente', a.cd_cliente).maybeSingle();
  const nivel = saldo?.categoria_efetiva || 'sem_categoria';
  if (rankNivel(nivel) < 1) redirect('/cliente/beneficios');

  const { data: b } = await supabaseAdmin.from('clube_beneficios').select('*').eq('id', params.id).eq('ativo', true).maybeSingle();
  if (!b || rankNivel(b.nivel_minimo) > rankNivel(nivel)) redirect('/cliente/beneficios');

  return (
    <>
      <div className="page-head">
        <div>
          <p style={{ margin: '0 0 6px' }}><a className="muted" href="/cliente/beneficios">&larr; Beneficios</a></p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            <span className={`badge ${b.nivel_minimo}`}>{labelCategoria(b.nivel_minimo)}</span>
            <span className="chip" style={{ background: '#efe6db', color: 'var(--brand)' }}>{labelPeriodicidade(b.periodicidade)}</span>
            <span className="chip" style={{ background: '#eef2f6', color: '#3a5673' }}>{labelFormaEntrega(b.forma_entrega)}</span>
          </div>
          <h1>{b.titulo}</h1>
          {b.descricao && <div className="sub">{b.descricao}</div>}
        </div>
      </div>

      {b.imagem_url && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <img src={b.imagem_url} alt="" style={{ width: '100%', maxHeight: 360, objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {b.conteudo && (
        <div className="card">
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{b.conteudo}</div>
        </div>
      )}

      {b.como_resgatar && (
        <div className="card" style={{ borderLeft: '3px solid var(--brand-2,#c99a5b)' }}>
          <h2 style={{ marginTop: 0 }}>Como resgatar</h2>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{b.como_resgatar}</div>
        </div>
      )}

      {!b.conteudo && !b.como_resgatar && (
        <div className="card"><p className="muted" style={{ margin: 0 }}>Em breve mais detalhes sobre este beneficio.</p></div>
      )}
    </>
  );
}
