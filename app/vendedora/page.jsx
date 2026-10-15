import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';
import ListaClientesVend from '@/components/ListaClientesVend';

export const dynamic = 'force-dynamic';

export default async function VendedoraHome() {
  const a = await getAcesso();
  if (!a || a.papel !== 'vendedora') redirect('/login');
  if (a.cd_vendedor == null) {
    return <div className="card">Seu login ainda nao esta vinculado a um codigo de vendedor. Fale com a equipe DEEP.</div>;
  }

  // Vendas da vendedora (status ativa) -> agrega por cliente
  const { data: vendas } = await supabaseAdmin
    .from('clube_vendas')
    .select('cd_cliente, dt_venda, vl_venda')
    .eq('cd_vendedor', a.cd_vendedor)
    .eq('status', 'ativa');

  const agg = {}; // cd -> { nvendas, ultima, vl_ultima }
  for (const v of (vendas || [])) {
    const c = String(v.cd_cliente);
    if (!agg[c]) agg[c] = { nvendas: 0, ultima: null, vl_ultima: null };
    agg[c].nvendas += 1;
    if (!agg[c].ultima || new Date(v.dt_venda) > new Date(agg[c].ultima)) {
      agg[c].ultima = v.dt_venda;
      agg[c].vl_ultima = v.vl_venda;
    }
  }
  const cods = Object.keys(agg);

  let rows = [];
  if (cods.length) {
    // Busca nas tabelas base: inclui cliente sem nivel (e ate inativo) desde que tenha venda com a vendedora
    const [{ data: clientes }, { data: saldos }, { data: aexp }] = await Promise.all([
      supabaseAdmin.from('clube_clientes').select('cd_cliente, nome, cidade, uf, telefone').in('cd_cliente', cods),
      supabaseAdmin.from('clube_saldos').select('cd_cliente, pontos_validos, categoria_efetiva, em_carencia').in('cd_cliente', cods),
      supabaseAdmin.from('v_clube_pontos_a_expirar').select('cd_cliente, expira_30d').in('cd_cliente', cods),
    ]);
    const sMap = {}, eMap = {};
    for (const s of (saldos || [])) sMap[String(s.cd_cliente)] = s;
    for (const e of (aexp || [])) eMap[String(e.cd_cliente)] = e;

    rows = (clientes || []).map(c => {
      const key = String(c.cd_cliente);
      const s = sMap[key] || {};
      const e = eMap[key] || {};
      const g = agg[key] || {};
      return {
        cd_cliente: c.cd_cliente,
        nome: c.nome,
        cidade: c.cidade,
        uf: c.uf,
        telefone: c.telefone,
        pontos_validos: Number(s.pontos_validos || 0),
        categoria: s.categoria_efetiva || 'sem_categoria',
        em_carencia: !!s.em_carencia,
        expira_30d: Number(e.expira_30d || 0),
        nvendas: g.nvendas || 0,
        ultima: g.ultima || null,
        vl_ultima: g.vl_ultima,
      };
    }).sort((x, y) => (y.pontos_validos || 0) - (x.pontos_validos || 0));
  }

  const totalExpira = rows.reduce((s, r) => s + (r.expira_30d > 0 ? 1 : 0), 0);

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

      {totalExpira > 0 && (
        <div className="banner warn" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12.5 }}>
            <b>{totalExpira} cliente(s)</b> com pontos a expirar nos próximos 30 dias. Um bom momento pra chamar no WhatsApp.
          </div>
        </div>
      )}

      <ListaClientesVend rows={rows} />
    </>
  );
}
