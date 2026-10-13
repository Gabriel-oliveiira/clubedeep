import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { pontos, dataBR, labelCategoria } from '@/lib/format';
import { linkWhatsapp } from '@/lib/lojas';

export const dynamic = 'force-dynamic';

const IcoWhats = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.83 14.12c-.25.7-1.45 1.34-2.01 1.42-.51.08-1.16.11-1.87-.12-.43-.14-.99-.32-1.7-.63-2.99-1.29-4.94-4.3-5.09-4.5-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.59-.37.79-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.25.59.84 2.05.91 2.2.07.15.12.33.02.53-.1.2-.15.32-.29.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.3.77 1.27 1.65 2.06 1.13 1.01 2.09 1.32 2.39 1.47.3.15.47.12.65-.07.17-.2.74-.87.94-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.07.12.07.72-.17 1.43z" />
  </svg>
);

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
      .select('cd_cliente, nome, cat_cliente, cidade, uf, telefone, pontos_validos, categoria, em_carencia')
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
          Aqui aparecem apenas os clientes <b>membros do Clube</b> com compra registrada no clube (nota a partir de R$ 2.500). Não é o seu relatório de vendas total.
        </div>
      </div>

      <div className="card flush">
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl-vend">
            <thead>
              <tr>
                <th>Cliente</th>
                <th style={{ textAlign: 'center', width: 70 }}></th>
                <th style={{ width: 120 }}>Nivel</th>
                <th style={{ textAlign: 'right' }}>Saldo</th>
                <th style={{ textAlign: 'center' }}>Vendas</th>
                <th>Ultima venda</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(c => {
                const wa = linkWhatsapp(c.telefone);
                const href = `/vendedora/${encodeURIComponent(c.cd_cliente)}`;
                return (
                  <tr key={c.cd_cliente}>
                    <td>
                      <a href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <b>{c.nome}</b>
                        <span className="muted" style={{ display: 'block', fontSize: 11.5 }}>
                          #{c.cd_cliente}{[c.cidade, c.uf].filter(Boolean).length ? ` · ${[c.cidade, c.uf].filter(Boolean).join('/')}` : ''}
                        </span>
                      </a>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {wa ? (
                        <a href={wa} target="_blank" rel="noopener noreferrer"
                           style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 9, background: '#e8f6ec', color: '#1da851' }}
                           title={`Abrir conversa no WhatsApp (${c.telefone})`} aria-label="Abrir WhatsApp">
                          <IcoWhats />
                        </a>
                      ) : (<span className="muted">—</span>)}
                    </td>
                    <td>
                      <a href={href} style={{ textDecoration: 'none' }}>
                        <span className={`badge ${c.categoria || 'sem_categoria'}`}>{labelCategoria(c.categoria || 'sem_categoria')}</span>
                        {c.em_carencia && <span className="chip" style={{ marginLeft: 6 }}>carencia</span>}
                      </a>
                    </td>
                    <td style={{ textAlign: 'right' }} className="num">{pontos(c.pontos_validos || 0)}</td>
                    <td style={{ textAlign: 'center' }} className="num">{c.nvendas}</td>
                    <td className="num muted">{c.ultima ? dataBR(c.ultima) : '-'}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan={6}><div className="empty">Nenhum cliente seu no Clube ainda.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
