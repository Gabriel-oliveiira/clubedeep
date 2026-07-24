import { supabaseAdmin } from '@/lib/supabase/admin';
import { pontos, labelCategoria, labelTipoCliente } from '@/lib/format';
import ClientesTabela from '@/components/ClientesTabela';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;
const CATS = ['platina', 'ouro', 'prata', 'bronze', 'sem_categoria'];
const TIPOS = ['REVENDEDOR', 'LOJISTA', 'REPRESENTANTE'];
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
  const tipo = searchParams?.tipo || '';
  const mov = searchParams?.mov || '';
  const lj = searchParams?.lj || '';
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
  if (tipo) query = query.eq('cat_cliente', tipo);
  if (mov === '1') query = query.not('loja_ultima', 'is', null);
  if (lj) query = query.eq('loja_ultima', lj);
  query = query.order(o.col, { ascending: o.asc, nullsFirst: false }).range(from, to);

  const [{ data: rows, count }, { data: lojasOpts }] = await Promise.all([
    query,
    supabaseAdmin.from('v_clube_lojas').select('loja'),
  ]);
  const total = count || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Clientes</h1>
          <div className="sub">{pontos(total)} cliente(s) {cat ? `· ${labelCategoria(cat)}` : ''}{tipo ? ` · ${labelTipoCliente(tipo)}` : ''}{q ? ` · busca: "${q}"` : ''}</div>
        </div>
      </div>

      <div className="card">
        <form method="get">
          <div className="toolbar">
            <input name="q" defaultValue={q} placeholder="Nome, CPF/CNPJ ou codigo" style={{ flex: 2, minWidth: 220 }} />
            <select name="cat" defaultValue={cat} style={{ flex: 1, minWidth: 150 }}>
              <option value="">Todos os niveis</option>
              {CATS.map(c => <option key={c} value={c}>{labelCategoria(c)}</option>)}
            </select>
            <select name="tipo" defaultValue={tipo} style={{ flex: 1, minWidth: 150 }}>
              <option value="">Todas as categorias</option>
              {TIPOS.map(t => <option key={t} value={t}>{labelTipoCliente(t)}</option>)}
            </select>
            <select name="lj" defaultValue={lj} style={{ flex: 1, minWidth: 170 }}>
              <option value="">Todas as lojas</option>
              {(lojasOpts || []).map(l => <option key={l.loja} value={l.loja}>{l.loja}</option>)}
            </select>
            <select name="mov" defaultValue={mov} style={{ flex: 1, minWidth: 170 }}>
              <option value="">Todos os clientes</option>
              <option value="1">Com movimento no clube</option>
            </select>
            <select name="ordem" defaultValue={ordem} style={{ flex: 1, minWidth: 150 }}>
              {Object.entries(ORDENS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button type="submit">Filtrar</button>
          </div>
        </form>
      </div>

      <div className="card flush">
        <ClientesTabela rows={rows || []} />
        <div className="pager">
          <span>Pagina {page} de {totalPages}</span>
          <div className="btns">
            {page > 1 && <a href={`/clientes${qs({ q, cat, tipo, lj, mov, ordem, page: String(page - 1) })}`}>&larr; Anterior</a>}
            {page < totalPages && <a href={`/clientes${qs({ q, cat, tipo, lj, mov, ordem, page: String(page + 1) })}`}>Proxima &rarr;</a>}
          </div>
        </div>
      </div>
    </>
  );
}
