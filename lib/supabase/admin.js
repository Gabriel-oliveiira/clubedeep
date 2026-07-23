import { createClient } from '@supabase/supabase-js';

// Cliente com service_role: ignora RLS. USAR SO NO SERVIDOR, apos checar o papel do usuario.
// Instanciado de forma "preguicosa" para nao quebrar o build quando as envs nao existem.
let _client = null;
function client() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return _client;
}

export const supabaseAdmin = new Proxy({}, {
  get(_t, prop) {
    const c = client();
    const v = c[prop];
    return typeof v === 'function' ? v.bind(c) : v;
  },
});
