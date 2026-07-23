import { supabaseAdmin } from '@/lib/supabase/admin';
import { pontos, brl, labelCategoria } from '@/lib/format';
import { DonutCategorias, BarrasMensais, BarrasH } from '@/components/Charts';
import { IcUsers, IcStar, IcAlert, IcClock } from '@/components/Icons';

export const dynamic = 'force-dynamic';

const ORDEM = ['platina', 'ouro', 'prata', 'bronze', 'sem_categoria'];

export default async function Dashboard() {
  const [{ data: cats }, { data: kpiArr }, { data: mensal }, { data: top }, { data: lojas }] = await Promise.all([
    supabaseAdmin.from('v_clube_resumo_categoria').select('*'),
    supabaseAdmin.from('v_clube_resumo_kpi').select('*'),
    supabaseAdmin.from('v_clube_dash_mensal').select('*'),
    supabaseAdmin.from('v_clube_dash_top_clientes').select('*'),
    supabaseAdmin.from('v_clube_dash_lojas').select('*').limit(8),
  ]);

  const kpi = (kpiArr && kpiArr[0]) || { clientes_total: 0, com_pontos: 0, em_carencia: 0, expira_30d: 0 };

  const porCat = {};
  (cats || []).forEach(c => { porCat[c.categoria] = c.clientes; });
  const donut = ORDEM.filter(c => porCat[c]).map(c => ({ chave: c, valor: porCat[c] }));

  const meses = (mensal || []).map(m => ({
    mes: m.mes, ganhos: Number(m.pontos_ganhos || 0), abatidos: Number(m.pontos_abatidos || 0),
  }));

  const topClientes = (top || []).map(t => ({ label: t.nome, valor: Number(t.pontos_validos || 0) }));
  const rankLojas = (lojas || []).map(l => ({ label: l.loja, valor: Number(l.valor || 0) }));

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Visao geral</h1>
          <div className="sub" style={{ textTransform: 'capitalize' }}>{hoje}</div>
        </div>
      </div>

      <div className="grid cols-4">
        <div className="card kpi-card">
          <div className="kpi-top"><div className="kpi-ico"><IcUsers /></div></div>
          <div><div className="kpi-val num">{pontos(kpi.clientes_total)}</div><div className="kpi-lbl">Clientes no clube</div></div>
        </div>
        <div className="card kpi-card ok">
          <div className="kpi-top"><div className="kpi-ico"><IcStar /></div></div>
          <div><div className="kpi-val num">{pontos(kpi.com_pontos)}</div><div className="kpi-lbl">Clientes com pontos</div></div>
        </div>
        <div className="card kpi-card alert">
          <div className="kpi-top"><div className="kpi-ico"><IcAlert /></div></div>
          <div><div className="kpi-val num">{pontos(kpi.em_carencia)}</div><div className="kpi-lbl">Em carencia</div></div>
        </div>
        <div className="card kpi-card gold">
          <div className="kpi-top"><div className="kpi-ico"><IcClock /></div></div>
          <div><div className="kpi-val num">{pontos(kpi.expira_30d)}</div><div className="kpi-lbl">Pontos a expirar (30d)</div></div>
        </div>
      </div>

      <div className="grid dash">
        <div className="card">
          <h2>Movimento de pontos por mes</h2>
          <BarrasMensais meses={meses} />
        </div>
        <div className="card">
          <h2>Clientes por categoria</h2>
          <DonutCategorias dados={donut} labelFn={labelCategoria} />
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h2>Top clientes por saldo</h2>
          <BarrasH itens={topClientes} />
        </div>
        <div className="card">
          <h2>Faturamento clube por loja (180d)</h2>
          <BarrasH itens={rankLojas} format={brl} />
        </div>
      </div>
    </>
  );
}
