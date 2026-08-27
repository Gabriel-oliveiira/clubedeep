import { supabaseAdmin } from '@/lib/supabase/admin';
import { carregarDados } from '@/lib/dados';
import { rankNivel } from '@/lib/format';
import FichaCliente from '@/components/FichaCliente';
import BeneficiosClienteAdmin from '@/components/BeneficiosClienteAdmin';

export const dynamic = 'force-dynamic';

export default async function Ficha({ params }) {
  const cd = decodeURIComponent(params.cd);
  const { data: cliente } = await supabaseAdmin.from('clube_clientes').select('*').eq('cd_cliente', cd).maybeSingle();
  if (!cliente) return <div className="card">Cliente nao encontrado.</div>;

  const [dados, { data: saldo }] = await Promise.all([
    carregarDados(cd),
    supabaseAdmin.from('clube_saldos').select('categoria_efetiva').eq('cd_cliente', cd).maybeSingle(),
  ]);
  const nivel = saldo?.categoria_efetiva || 'sem_categoria';

  // beneficios do nivel do cliente + resgates para a marcacao
  let beneficios = [], resgates = [];
  if (rankNivel(nivel) >= 1) {
    const [{ data: bens }, { data: rgs }] = await Promise.all([
      supabaseAdmin.from('clube_beneficios').select('id, titulo, periodicidade, nivel_minimo').eq('ativo', true).eq('nivel_minimo', nivel).order('ordem'),
      supabaseAdmin.from('clube_beneficio_resgates').select('beneficio_id, periodo_ref, dt_resgate').eq('cd_cliente', cd),
    ]);
    beneficios = bens || []; resgates = rgs || [];
  }

  return (
    <>
      <FichaCliente cliente={cliente} {...dados} voltar="/clientes" />
      <BeneficiosClienteAdmin cdCliente={cd} nivel={nivel} beneficios={beneficios} resgatesIniciais={resgates} />
    </>
  );
}
