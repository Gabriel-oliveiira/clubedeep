'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { IcDashboard, IcUsers, IcClock, IcCursos, IcStar, IcInfo, IcLogout } from '@/components/Icons';

const NAV = [
  { href: '/cliente', label: 'Inicio', Icon: IcDashboard },
  { href: '/cliente/ficha', label: 'Minha ficha', Icon: IcUsers },
  { href: '/cliente/extrato', label: 'Extrato de pontos', Icon: IcClock },
  { href: '/cliente/beneficios', label: 'Beneficios', Icon: IcStar },
  { href: '/cliente/cursos', label: 'Cursos', Icon: IcCursos },
  { href: '/cliente/como-funciona', label: 'Como funciona', Icon: IcInfo },
];

export default function SidebarCliente({ nome, email }) {
  const path = usePathname();
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const inicial = ((nome || email || '?')[0] || '?').toUpperCase();
  const ativo = (h) => (h === '/cliente' ? path === '/cliente' : path.startsWith(h));

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
        <a href="/cliente" style={{ display: 'inline-flex' }}><img src="/deep-logo.png" alt="DEEP" /></a>
      </div>
      {aberto && <div className="m-overlay" onClick={() => setAberto(false)} />}

      <aside className={`sidebar cli ${aberto ? 'aberto' : ''}`}>
        <div className="logo"><a href="/cliente" style={{ display: 'inline-flex' }}><img src="/deep-logo.png" alt="DEEP" /></a></div>
        <nav>
          <div className="sec">Menu</div>
          {NAV.map(({ href, label, Icon }) => (
            <a key={href} href={href} className={`nav-item ${ativo(href) ? 'active' : ''}`} onClick={() => setAberto(false)}>
              <Icon /> {label}
            </a>
          ))}
        </nav>
        <div className="foot">
          <a href="/perfil" className="who" style={{ textDecoration: 'none', color: 'inherit' }} title="Meu perfil">
            <div className="avatar">{inicial}</div>
            <div><b>{nome || email}</b><span>ver perfil</span></div>
          </a>
          <a href="#" onClick={sair}><IcLogout style={{ width: 14, height: 14 }} /> Sair</a>
        </div>
      </aside>
    </>
  );
}
