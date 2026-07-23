import { supabaseAdmin } from '@/lib/supabase/admin';
import { pontos, labelCategoria, dataBR } from '@/lib/format';

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
                <th>Cliente</th><th>CPF/CNPJ</th><th>Cidade/UF</th>
                <th>Categoria</th><th style={{ textAlign: 'right' }}>Saldo</th>
                <th style={{ textAlign: 'right' }}>Expira 30d</th><th>Ultima compra</th><th></th>
              </tr>
            </thead>
            <tbody>
              {(rows || []).map(c => (
                <tr key={c.cd_cliente}>
                  <td>
                    {c.nome} {c.em_carencia && <span className="chip carencia">carencia</span>}
                    <span className="sub">#{c.cd_cliente}</span>
                  </td>
                  <td className="muted num">{c.cpf_cnpj || '-'}</td>
                  <td className="muted">{[c.cidade, c.uf].filter(Boolean).join('/') || '-'}</td>
                  <td><span className={`badge ${c.categoria}`}>{labelCategoria(c.categoria)}</span></td>
                  <td style={{ textAlign: 'right' }} className="num"><b>{pontos(c.pontos_validos)}</b></td>
                  <td style={{ textAlign: 'right' }} className={`num ${Number(c.expira_30d) > 0 ? 'neg' : 'muted'}`}>{pontos(c.expira_30d)}</td>
                  <td className="muted">{dataBR(c.dt_ultima_compra)}</td>
                  <td><a className="btn-ghost" style={{ padding: '6px 12px', borderRadius: 8 }} href={`/clientes/${encodeURIComponent(c.cd_cliente)}`}>Ficha</a></td>
                </tr>
              ))}
              {(!rows || rows.length === 0) && <tr><td colSpan={8}><div className="empty">Nenhum cliente encontrado.</div></td></tr>}
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
