import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { carregarDados } from '@/lib/dados';
import FichaCliente from '@/components/FichaCliente';

export const dynamic = 'force-dynamic';

export default async function Loja() {
  const a = await getAcesso();
  if (!a || a.papel !== 'loja') redirect('/login');
  if (!a.cd_cliente) return <div className="card">Sua loja ainda nao esta vinculada. Fale com a equipe DEEP.</div>;
  const { data: cliente } = await supabaseAdmin.from('clube_clientes').select('*').eq('cd_cliente', a.cd_cliente).maybeSingle();
  if (!cliente) return <div className="card">Loja nao encontrada.</div>;
  const dados = await carregarDados(a.cd_cliente);
  return <FichaCliente cliente={cliente} {...dados} loja={true} />;
}
