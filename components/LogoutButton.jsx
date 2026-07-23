'use client';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();
  async function sair() {
    await getSupabaseBrowser().auth.signOut();
    router.push('/login'); router.refresh();
  }
  return <a href="#" onClick={(e)=>{e.preventDefault();sair();}} style={{fontSize:14,opacity:.9}}>Sair</a>;
}
