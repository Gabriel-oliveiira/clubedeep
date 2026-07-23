import { supabaseAdmin } from '@/lib/supabase/admin';
import { carregarDados } from '@/lib/dados';
import FichaCliente from '@/components/FichaCliente';

export const dynamic = 'force-dynamic';

export default async function Ficha({ params }) {
  const cd = decodeURIComponent(params.cd);
  const { data: cliente } = await supabaseAdmin.from('clube_clientes').select('*').eq('cd_cliente', cd).maybeSingle();
  if (!cliente) return <div className="card">Cliente nao encontrado.</div>;
  const dados = await carregarDados(cd);
  return <FichaCliente cliente={cliente} {...dados} voltar="/clientes" />;
}
