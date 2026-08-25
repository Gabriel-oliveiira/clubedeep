import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import LogoutButton from '@/components/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function ClienteLayout({ children }) {
  const a = await getAcesso();
  if (!a) redirect('/login');
  if (!a.papel) redirect('/acesso-negado');
  // equipe tem a propria area
  if (a.papel === 'admin' || a.papel === 'comercial') redirect('/dashboard');
  if (a.papel === 'loja') redirect('/loja');

  return (
    <>
      <div className="topbar">
        <div className="topbar-in">
          <a href="/cliente" style={{ display: 'inline-flex' }}><img src="/deep-logo.png" alt="DEEP" /></a>
          <div className="nav" style={{ gap: 16 }}>
            <a href="/cliente" style={{ fontSize: 13.5 }}>Inicio</a>
            <a href="/cliente/cursos" style={{ fontSize: 13.5 }}>Cursos</a>
            <a href="/cliente/beneficios" style={{ fontSize: 13.5 }}>Beneficios</a>
            <a href="/perfil" style={{ fontSize: 12.5, opacity: .8 }} title="Meu perfil">{a.nome || a.email}</a>
            <LogoutButton />
          </div>
        </div>
      </div>
      <div className="container">{children}</div>
    </>
  );
}
