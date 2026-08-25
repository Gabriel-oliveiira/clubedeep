'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { IcDashboard, IcUsers, IcLogout, IcSettings, IcCursos, IcStar } from '@/components/Icons';

const NAV = [
  { href: '/dashboard', label: 'Visao geral', Icon: IcDashboard },
  { href: '/clientes', label: 'Clientes', Icon: IcUsers },
  { href: '/cursos', label: 'Cursos', Icon: IcCursos },
  { href: '/beneficios', label: 'Beneficios', Icon: IcStar },
  { href: '/configuracoes', label: 'Configuracoes', Icon: IcSettings, apenas: 'admin' },
];

export default function Sidebar({ email, papel }) {
  const path = usePathname();
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const inicial = (email || '?')[0].toUpperCase();

  async function sair(e) {
    e.preventDefault();
    await getSupabaseBrowser().auth.signOut();
    router.push('/login'); router.refresh();
  }

  return (
    <>
      {/* barra mobile com hamburger */}
      <div className="m-top">
        <button className="m-burger" aria-label="Abrir menu" onClick={() => setAberto(true)}><span /><span /><span /></button>
        <a href="/dashboard" style={{ display: 'inline-flex' }}><img src="/deep-logo.png" alt="DEEP" /></a>
      </div>
      {aberto && <div className="m-overlay" onClick={() => setAberto(false)} />}

      <aside className={`sidebar ${aberto ? 'aberto' : ''}`}>
        <div className="logo">
          <img src="/deep-logo.png" alt="DEEP" />
        </div>
        <nav>
          <div className="sec">Menu</div>
          {NAV.filter(n => !n.apenas || n.apenas === papel).map(({ href, label, Icon }) => (
            <a key={href} href={href} className={`nav-item ${path.startsWith(href) ? 'active' : ''}`} onClick={() => setAberto(false)}>
              <Icon /> {label}
            </a>
          ))}
        </nav>
        <div className="foot">
          <a href="/perfil" className="who" style={{ textDecoration: 'none', color: 'inherit' }} title="Meu perfil">
            <div className="avatar">{inicial}</div>
            <div><b>{email}</b><span>{papel} · ver perfil</span></div>
          </a>
          <a href="#" onClick={sair}><IcLogout style={{width:14,height:14}} /> Sair</a>
        </div>
      </aside>
    </>
  );
}
