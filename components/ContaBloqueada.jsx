import LogoutButton from '@/components/LogoutButton';

export default function ContaBloqueada({ nome }) {
  const wpp = process.env.NEXT_PUBLIC_WHATSAPP_SUPORTE || '5585999999999';
  const link = `https://wa.me/${wpp}?text=${encodeURIComponent('Ola! Minha conta do Clube Deep esta bloqueada, pode me ajudar?')}`;
  const primeiro = (nome || 'cliente').split(' ')[0];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="topbar">
        <div className="topbar-in">
          <img src="/deep-logo.png" alt="DEEP" />
          <div className="nav"><LogoutButton /></div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="card" style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--warn-bg,#fdf3e0)', color: 'var(--warn,#b07b1e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 30 }}>&#9888;</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: '0 0 8px' }}>Ola, {primeiro}. Sua conta esta bloqueada.</h1>
          <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
            No momento seu acesso ao Clube Deep esta suspenso, entao os beneficios e cursos ficam indisponiveis.
            Para regularizar e voltar a aproveitar tudo, fale com a nossa equipe.
          </p>
          <a href={link} target="_blank" rel="noopener noreferrer"
             style={{ display: 'inline-block', background: '#1da851', color: '#fff', padding: '12px 22px', borderRadius: 10, textDecoration: 'none', marginTop: 8, fontWeight: 600 }}>
            Falar com o suporte
          </a>
        </div>
      </div>
    </div>
  );
}
