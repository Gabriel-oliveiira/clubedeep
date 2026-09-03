import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { pontos, brl, labelCategoria, dataBR } from '@/lib/format';

export const dynamic = 'force-dynamic';

// Escada de niveis (limiar minimo em pontos)
const NIVEIS = [
  { chave: 'bronze', min: 2500 },
  { chave: 'prata', min: 30000 },
  { chave: 'ouro', min: 48000 },
  { chave: 'platina', min: 72000 },
];

function progresso(pts) {
  const proximo = NIVEIS.find(n => pts <= n.min);
  if (!proximo) return { proximo: null, falta: 0, pct: 100 };
  const base = NIVEIS[NIVEIS.indexOf(proximo) - 1]?.min || 0;
  const pct = Math.max(0, Math.min(100, ((pts - base) / (proximo.min - base)) * 100));
  return { proximo: proximo.chave, falta: Math.max(0, Math.ceil(proximo.min - pts)), pct };
}

export default async function AreaCliente() {
  const a = await getAcesso();
  if (!a) redirect('/login');
  if (a.papel !== 'cliente') {
    if (a.papel === 'loja') redirect('/loja');
    if (a.papel) redirect('/dashboard');
    redirect('/acesso-negado');
  }

  const [{ data: saldo }, { data: cli }] = await Promise.all([
    supabaseAdmin.from('clube_saldos').select('*').eq('cd_cliente', a.cd_cliente).maybeSingle(),
    supabaseAdmin.from('clube_clientes').select('nome, cat_cliente').eq('cd_cliente', a.cd_cliente).maybeSingle(),
  ]);

  const nivel = saldo?.categoria_efetiva || 'sem_categoria';
  const pts = Number(saldo?.pontos_validos || 0);
  const prog = progresso(pts);
  const primeiroNome = (a.nome || cli?.nome || 'cliente').split(' ')[0];

  // beneficios do proximo nivel (o que te espera)
  let proxBenef = [];
  if (prog.proximo) {
    const { data } = await supabaseAdmin.from('clube_beneficios')
      .select('titulo, descricao').eq('nivel_minimo', prog.proximo).eq('ativo', true).order('ordem').limit(4);
    proxBenef = data || [];
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Ola, {primeiroNome}!</h1>
          <div className="sub">Bem-vindo ao seu Clube Deep.</div>
        </div>
        <span className={`badge ${nivel}`} style={{ fontSize: 13, padding: '6px 16px' }}>{labelCategoria(nivel)}</span>
      </div>

      {/* Nivel + progresso */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div className="kpi-lbl">Seu saldo de pontos</div>
            <div className="num" style={{ fontSize: 34, fontWeight: 700 }}>{pontos(pts)}</div>
          </div>
          {saldo?.em_carencia && <span className="chip carencia">em carencia ate {dataBR(saldo?.carencia_ate)}</span>}
        </div>

        {prog.proximo ? (
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span className="muted">Faltam <b>{pontos(prog.falta)}</b> pontos para <b>{labelCategoria(prog.proximo)}</b></span>
              <span className="muted">{Math.round(prog.pct)}%</span>
            </div>
            <div style={{ height: 12, background: '#efe9e1', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${prog.pct}%`, height: '100%', background: 'var(--brand-2, #c99a5b)', borderRadius: 999 }} />
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
              O equivalente a <b>{brl(prog.falta)}</b> em compras. Cada R$ 1,00 comprado = 1 ponto.
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 16 }} className="muted">Voce esta no nivel maximo. Parabens!</div>
        )}
      </div>

      {/* O que te espera no proximo nivel */}
      {prog.proximo && proxBenef.length > 0 && (
        <div className="card" style={{ borderTop: '3px solid var(--brand-2,#c99a5b)' }}>
          <h2>O que te espera no {labelCategoria(prog.proximo)}</h2>
          <div className="grid cols-2" style={{ gap: 10 }}>
            {proxBenef.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--brand-2,#c99a5b)', marginTop: 2 }}>&#10003;</span>
                <div><b style={{ fontSize: 13.5 }}>{b.titulo}</b>{b.descricao && <div className="muted" style={{ fontSize: 12.5 }}>{b.descricao}</div>}</div>
              </div>
            ))}
          </div>
          <a href="/cliente/beneficios" className="chip" style={{ background: 'var(--brand,#6b4f2a)', color: '#fff', marginTop: 14, textDecoration: 'none' }}>Ver todos os beneficios &rarr;</a>
        </div>
      )}

      {/* Espacos das proximas fases */}
      <div className="grid cols-2">
        <a href="/cliente/beneficios" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <h2>Meus beneficios</h2>
          <p className="muted" style={{ fontSize: 14 }}>
            Convites para eventos, brindes e vantagens exclusivas do seu nivel.
          </p>
          <span className="chip" style={{ background: 'var(--brand,#6b4f2a)', color: '#fff' }}>Ver beneficios &rarr;</span>
        </a>
        <a href="/cliente/cursos" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <h2>Cursos e treinamentos</h2>
          <p className="muted" style={{ fontSize: 14 }}>
            Aulas de vendas e outros treinamentos para voce crescer com a DEEP.
          </p>
          <span className="chip" style={{ background: 'var(--brand,#6b4f2a)', color: '#fff' }}>Acessar cursos &rarr;</span>
        </a>
      </div>
    </>
  );
}
