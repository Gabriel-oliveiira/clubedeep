import { supabaseAdmin } from '@/lib/supabase/admin';
import GestaoBeneficios from '@/components/GestaoBeneficios';

export const dynamic = 'force-dynamic';

const ORDEM_NIVEL = { bronze: 1, prata: 2, ouro: 3, platina: 4 };

export default async function BeneficiosPage() {
  const { data } = await supabaseAdmin.from('clube_beneficios').select('*');
  const beneficios = (data || []).sort((a, b) =>
    (ORDEM_NIVEL[a.nivel_minimo] - ORDEM_NIVEL[b.nivel_minimo]) || (a.ordem - b.ordem) || a.titulo.localeCompare(b.titulo));

  return (
    <>
      <div className="page-head"><div><h1>Beneficios</h1><div className="sub">Crie beneficios e defina a partir de qual nivel ficam disponiveis.</div></div></div>
      <GestaoBeneficios beneficios={beneficios} />
    </>
  );
}
