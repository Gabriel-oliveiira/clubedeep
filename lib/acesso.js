import { getSupabaseServer } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Retorna { user, email, papel, cd_cliente } ou null se nao logado.
export async function getAcesso() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const email = (user.email || '').toLowerCase();
  const { data } = await supabaseAdmin
    .from('painel_acessos')
    .select('papel, cd_cliente')
    .eq('email', email)
    .maybeSingle();
  return { user, email, papel: data?.papel || null, cd_cliente: data?.cd_cliente || null };
}
