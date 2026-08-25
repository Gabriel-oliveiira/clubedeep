import { cache } from 'react';
import { getSupabaseServer } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Retorna { user, email, papel, cd_cliente } ou null se nao logado.
// Envolto em cache() para rodar UMA vez por requisicao (layout + pagina compartilham).
export const getAcesso = cache(async function getAcesso() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const email = (user.email || '').toLowerCase();
  const { data } = await supabaseAdmin
    .from('painel_acessos')
    .select('papel, cd_cliente, nome, ativo')
    .eq('email', email)
    .maybeSingle();
  if (data && data.ativo === false) return { user, email, papel: null, cd_cliente: null, nome: null };
  return { user, email, papel: data?.papel || null, cd_cliente: data?.cd_cliente || null, nome: data?.nome || null };
});
