import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const a = await getAcesso();
  if (!a) redirect('/login');
  if (!a.papel) redirect('/acesso-negado');
  if (a.papel === 'loja') redirect('/loja');
  redirect('/dashboard');
}
