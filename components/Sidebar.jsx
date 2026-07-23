'use client';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { IcDashboard, IcUsers, IcLogout, IcSettings } from '@/components/Icons';

const NAV = [
  { href: '/dashboard', label: 'Visao geral', Icon: IcDashboard },
  { href: '/clientes', label: 'Clientes', Icon: IcUsers },
  { href: '/configuracoes', label: 'Configuracoes', Icon: IcSettings, apenas: 'admin' },
];

export default function Sidebar({ email, papel }) {
  const path = usePathname();
  const router = useRouter();
  const inicial = (email || '?')[0].toUpperCase();

  async function sair(e) {
    e.preventDefault();
    await getSupabaseBrowser().auth.signOut();
    router.push('/login'); router.refresh();
  }

  return (
    <aside className="sidebar">
      <div className="logo">
        <img src="/deep-logo.png" alt="DEEP" />
        <small>Clube Deep</small>
      </div>
      <nav>
        <div className="sec">Menu</div>
        {NAV.filter(n => !n.apenas || n.apenas === papel).map(({ href, label, Icon }) => (
          <a key={href} href={href} className={`nav-item ${path.startsWith(href) ? 'active' : ''}`}>
            <Icon /> {label}
          </a>
        ))}
      </nav>
      <div className="foot">
        <div className="who">
          <div className="avatar">{inicial}</div>
          <div><b>{email}</b><span>{papel}</span></div>
        </div>
        <a href="#" onClick={sair}><IcLogout style={{width:14,height:14}} /> Sair</a>
      </div>
    </aside>
  );
}
