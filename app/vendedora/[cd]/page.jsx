import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { carregarDados } from '@/lib/dados';
import { rankNivel } from '@/lib/format';
import FichaVendedora from '@/components/FichaVendedora';

export const dynamic = 'force-dynamic';

export default async function FichaDaVendedora({ params }) {
  const a = await getAcesso();
  if (!a || a.papel !== 'vendedora') redirect('/login');
  if (a.cd_vendedor == null) redirect('/vendedora');
  const cd = decodeURIComponent(params.cd);

  // Seguranca: o cliente so abre se tiver venda com ESTA vendedora
  const { data: vendas } = await supabaseAdmin
    .from('clube_vendas')
    .select('transacao, dt_venda, loja, qt_pecas, vl_venda, pontos, status, cd_operacao, modalidade')
    .eq('cd_vendedor', a.cd_vendedor)
    .eq('cd_cliente', cd)
    .order('dt_venda', { ascending: false });

  if (!vendas || vendas.length === 0) {
    return (
      <div className="card">
        <p style={{ marginTop: 0 }}><a className="muted" href="/vendedora">&larr; Meus clientes</a></p>
        Este cliente nao esta na sua carteira.
      </div>
    );
  }

  const { data: cliente } = await supabaseAdmin.from('clube_clientes').select('*').eq('cd_cliente', cd).maybeSingle();
  if (!cliente) return <div className="card">Cliente nao encontrado.</div>;

  const dados = await carregarDados(cd);
  const nivel = dados.saldo?.categoria_efetiva || 'sem_categoria';

  let beneficios = [];
  if (rankNivel(nivel) >= 1) {
    const { data: bens } = await supabaseAdmin
      .from('clube_beneficios')
      .select('id, titulo, periodicidade, forma_entrega, nivel_minimo')
      .eq('ativo', true).eq('nivel_minimo', nivel).order('ordem');
    beneficios = bens || [];
  }

  return (
    <FichaVendedora
      cliente={cliente}
      saldo={dados.saldo}
      extrato={dados.extrato}
      trajetoria={dados.trajetoria}
      aexp={dados.aexp}
      lojaUltima={dados.lojaUltima}
      nivel={nivel}
      beneficios={beneficios}
      vendas={vendas}
    />
  );
}
