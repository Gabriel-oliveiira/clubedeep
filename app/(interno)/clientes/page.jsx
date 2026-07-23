import { supabaseAdmin } from '@/lib/supabase/admin';
import { pontos, labelCategoria, dataBR } from '@/lib/format';
import { nomeLoja, linkWhatsapp } from '@/lib/lojas';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;
const CATS = ['platina', 'ouro', 'prata', 'bronze', 'sem_categoria'];
const ORDENS = {
  saldo: { col: 'pontos_validos', asc: false, label: 'Maior saldo' },
  expira: { col: 'expira_30d', asc: false, label: 'A expirar (30d)' },
  nome: { col: 'nome', asc: true, label: 'Nome (A-Z)' },
  ultima: { col: 'dt_ultima_compra', asc: false, label: 'Ultima compra' },
};

function qs(params) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) p.set(k, v); });
  const s = p.toString();
  return s ? `?${s}` : '';
}

const IcoWhats = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.83 14.12c-.25.7-1.45 1.34-2.01 1.42-.51.08-1.16.11-1.87-.12-.43-.14-.99-.32-1.7-.63-2.99-1.29-4.94-4.3-5.09-4.5-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.59-.37.79-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.25.59.84 2.05.91 2.2.07.15.12.33.02.53-.1.2-.15.32-.29.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.3.77 1.27 1.65 2.06 1.13 1.01 2.09 1.32 2.39 1.47.3.15.47.12.65-.07.17-.2.74-.87.94-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.07.12.07.72-.17 1.43z"/>
  </svg>
);

export default async function Clientes({ searchParams }) {
  const q = (searchParams?.q || '').trim();
  const cat = searchParams?.cat || '';
  const ordem = ORDENS[searchParams?.ordem] ? searchParams.ordem : 'saldo';
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const o = ORDENS[ordem];

  let query = supabaseAdmin.from('v_clube_painel_clientes').select('*', { count: 'exact' });
  if (q) {
    const termo = q.replace(/[,%()*]/g, ' ').trim();
    query = query.or(`nome.ilike.%${termo}%,cpf_cnpj.ilike.%${termo}%,cd_cliente.ilike.%${termo}%`);
  }
  if (cat) query = query.eq('categoria', cat);
  query = query.order(o.col, { ascending: o.asc, nullsFirst: false }).range(from, to);

  const { data: rows, count } = await query;
  const total = count || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Clientes</h1>
          <div className="sub">{pontos(total)} cliente(s) {cat ? `· ${labelCategoria(cat)}` : ''}{q ? ` · busca: "${q}"` : ''}</div>
        </div>
      </div>

      <div className="card">
        <form method="get">
          <div className="toolbar">
            <input name="q" defaultValue={q} placeholder="Nome, CPF/CNPJ ou codigo" style={{ flex: 2, minWidth: 220 }} />
            <select name="cat" defaultValue={cat} style={{ flex: 1, minWidth: 150 }}>
              <option value="">Todas categorias</option>
              {CATS.map(c => <option key={c} value={c}>{labelCategoria(c)}</option>)}
            </select>
            <select name="ordem" defaultValue={ordem} style={{ flex: 1, minWidth: 150 }}>
              {Object.entries(ORDENS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button type="submit">Filtrar</button>
          </div>
        </form>
      </div>

      <div className="card flush">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Loja</th><th>Cliente</th><th>WhatsApp</th><th>E-mail</th>
                <th>Categoria</th><th style={{ textAlign: 'right' }}>Saldo</th>
                <th style={{ textAlign: 'right' }}>Expira 30d</th><th>Ultima compra</th><th></th>
              </tr>
            </thead>
            <tbody>
              {(rows || []).map(c => {
                const wa = linkWhatsapp(c.telefone);
                return (
                  <tr key={c.cd_cliente}>
                    <td className="muted" style={{ whiteSpace: 'nowrap' }}>{c.loja_ultima || nomeLoja(c.empresa)}</td>
                    <td>
                      {c.nome} {c.em_carencia && <span className="chip carencia">carencia</span>}
                      <span className="sub">#{c.cd_cliente}</span>
                    </td>
                    <td>
                      {wa ? (
                        <a href={wa} target="_blank" rel="noopener noreferrer"
                           style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1da851', fontWeight: 600, whiteSpace: 'nowrap' }}
                           title="Abrir conversa no WhatsApp">
                          <IcoWhats /> <span className="num">{c.telefone}</span>
                        </a>
                      ) : (
                        <span className="muted num">{c.telefone || '-'}</span>
                      )}
                    </td>
                    <td className="muted" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.email || ''}>{c.email || '-'}</td>
                    <td><span className={`badge ${c.categoria}`}>{labelCategoria(c.categoria)}</span></td>
                    <td style={{ textAlign: 'right' }} className="num"><b>{pontos(c.pontos_validos)}</b></td>
                    <td style={{ textAlign: 'right' }} className={`num ${Number(c.expira_30d) > 0 ? 'neg' : 'muted'}`}>{pontos(c.expira_30d)}</td>
                    <td className="muted">{dataBR(c.dt_ultima_compra)}</td>
                    <td><a className="btn-ghost" style={{ padding: '6px 12px', borderRadius: 8 }} href={`/clientes/${encodeURIComponent(c.cd_cliente)}`}>Ficha</a></td>
                  </tr>
                );
              })}
              {(!rows || rows.length === 0) && <tr><td colSpan={9}><div className="empty">Nenhum cliente encontrado.</div></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="pager">
          <span>Pagina {page} de {totalPages}</span>
          <div className="btns">
            {page > 1 && <a href={`/clientes${qs({ q, cat, ordem, page: String(page - 1) })}`}>&larr; Anterior</a>}
            {page < totalPages && <a href={`/clientes${qs({ q, cat, ordem, page: String(page + 1) })}`}>Proxima &rarr;</a>}
          </div>
        </div>
      </div>
    </>
  );
}
