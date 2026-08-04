import { supabaseAdmin } from '@/lib/supabase/admin';

// Le um valor da tabela clube_config (chave/valor). Uso no servidor.
export async function getConfig(chave, padrao = null) {
  const { data } = await supabaseAdmin.from('clube_config').select('valor').eq('chave', chave).maybeSingle();
  return data?.valor ?? padrao;
}
