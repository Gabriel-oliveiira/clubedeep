import { supabaseAdmin } from '@/lib/supabase/admin';
import { carregarDados } from '@/lib/dados';
import { rankNivel } from '@/lib/format';
import FichaTabs from '@/components/FichaTabs';

export const dynamic = 'force-dynamic';

export default async function Ficha({ params }) {
  const cd = decodeURIComponent(params.cd);
  const { data: cliente } = await supabaseAdmin.from('clube_clientes').select('*').eq('cd_cliente', cd).maybeSingle();
  if (!cliente) return <div className="card">Cliente nao encontrado.</div>;

  const dados = await carregarDados(cd);
  const nivel = dados.saldo?.categoria_efetiva || 'sem_categoria';

  // beneficios do nivel do cliente + resgates para a marcacao
  let beneficios = [], resgates = [];
  if (rankNivel(nivel) >= 1) {
    const [{ data: bens }, { data: rgs }] = await Promise.all([
      supabaseAdmin.from('clube_beneficios').select('id, titulo, periodicidade, forma_entrega, nivel_minimo').eq('ativo', true).eq('nivel_minimo', nivel).order('ordem'),
      supabaseAdmin.from('clube_beneficio_resgates').select('beneficio_id, periodo_ref, dt_resgate').eq('cd_cliente', cd),
    ]);
    beneficios = bens || []; resgates = rgs || [];
  }

  return (
    <FichaTabs
      cliente={cliente}
      saldo={dados.saldo}
      extrato={dados.extrato}
      trajetoria={dados.trajetoria}
      aexp={dados.aexp}
      lojaUltima={dados.lojaUltima}
      nivel={nivel}
      beneficios={beneficios}
      resgatesIniciais={resgates}
      voltar="/clientes"
    />
  );
}
