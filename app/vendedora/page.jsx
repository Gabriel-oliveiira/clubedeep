import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { pontos, dataBR, labelCategoria } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function VendedoraHome() {
  const a = await getAcesso();
  if (!a || a.papel !== 'vendedora') redirect('/login');
  if (a.cd_vendedor == null) {
    return <div className="card">Seu login ainda nao esta vinculado a um codigo de vendedor. Fale com a equipe DEEP.</div>;
  }

  // Vendas da vendedora (status ativa) -> clientes distintos
  const { data: vendas } = await supabaseAdmin
    .from('clube_vendas')
    .select('cd_cliente, dt_venda')
    .eq('cd_vendedor', a.cd_vendedor)
    .eq('status', 'ativa');

  const qtd = {}, ultima = {};
  for (const v of (vendas || [])) {
    const c = String(v.cd_cliente);
    qtd[c] = (qtd[c] || 0) + 1;
    if (!ultima[c] || new Date(v.dt_venda) > new Date(ultima[c])) ultima[c] = v.dt_venda;
  }
  const cods = Object.keys(qtd);

  let rows = [];
  if (cods.length) {
    const { data: clientes } = await supabaseAdmin
      .from('v_clube_painel_clientes')
      .select('cd_cliente, nome, cat_cliente, cidade, uf, pontos_validos, categoria, em_carencia')
      .in('cd_cliente', cods);
    rows = (clientes || [])
      .map(c => ({ ...c, nvendas: qtd[String(c.cd_cliente)] || 0, ultima: ultima[String(c.cd_cliente)] || null }))
      .sort((x, y) => (y.pontos_validos || 0) - (x.pontos_validos || 0));
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Meus clientes</h1>
          <div className="sub">{rows.length} cliente(s) no Clube DEEP · vendedor #{a.cd_vendedor}</div>
        </div>
      </div>

      <div className="banner" style={{ background: '#f4ede5', border: '1px solid var(--line)', marginBottom: 16 }}>
        <div style={{ fontSize: 12.5 }}>
          Aqui aparecem apenas os clientes <b>membros do Clube</b> com compra registrada no clube (nota a partir de R$ 2.500). Nao e o seu relatorio de vendas total.
        </div>
      </div>

      <div className="card flush">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Nivel</th>
                <th style={{ textAlign: 'right' }}>Saldo de pontos</th>
                <th style={{ textAlign: 'right' }}>Vendas no clube</th>
                <th>Ultima venda</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(c => (
                <tr key={c.cd_cliente} style={{ cursor: 'pointer' }}>
                  <td>
                    <a href={`/vendedora/${encodeURIComponent(c.cd_cliente)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <b>{c.nome}</b>
                      <span className="muted" style={{ display: 'block', fontSize: 11.5 }}>
                        #{c.cd_cliente}{[c.cidade, c.uf].filter(Boolean).length ? ` · ${[c.cidade, c.uf].filter(Boolean).join('/')}` : ''}
                      </span>
                    </a>
                  </td>
                  <td>
                    <a href={`/vendedora/${encodeURIComponent(c.cd_cliente)}`} style={{ textDecoration: 'none' }}>
                      <span className={`badge ${c.categoria || 'sem_categoria'}`}>{labelCategoria(c.categoria || 'sem_categoria')}</span>
                      {c.em_carencia && <span className="chip" style={{ marginLeft: 6 }}>carencia</span>}
                    </a>
                  </td>
                  <td style={{ textAlign: 'right' }} className="num">{pontos(c.pontos_validos || 0)}</td>
                  <td style={{ textAlign: 'right' }} className="num">{c.nvendas}</td>
                  <td className="num">{c.ultima ? dataBR(c.ultima) : '-'}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5}><div className="empty">Nenhum cliente seu no Clube ainda.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
