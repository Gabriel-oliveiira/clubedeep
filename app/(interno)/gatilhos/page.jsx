import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';
import GestaoGatilhos from '@/components/GestaoGatilhos';

export const dynamic = 'force-dynamic';

export default async function GatilhosPage() {
  const a = await getAcesso();
  if (!a || a.papel !== 'admin') redirect('/dashboard');

  const [{ data: config }, { data: gatilhos }] = await Promise.all([
    supabaseAdmin.from('clube_motor_config').select('*').eq('id', 1).maybeSingle(),
    supabaseAdmin.from('clube_gatilhos').select('*').order('criado_em', { ascending: false }),
  ]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Gatilhos e regras</h1>
          <div className="sub">Configure como os pontos são gerados. Depois de alterar, clique em Recalcular.</div>
        </div>
      </div>
      <GestaoGatilhos config={config} gatilhos={gatilhos || []} />
    </>
  );
}
