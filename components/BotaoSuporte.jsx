// Botao flutuante de contato com o CS da DEEP (WhatsApp), em todas as telas do cliente.
export default function BotaoSuporte() {
  const wpp = process.env.NEXT_PUBLIC_WHATSAPP_SUPORTE || '5585999999999';
  const link = `https://wa.me/${wpp}?text=${encodeURIComponent('Ola! Preciso de ajuda com o Clube Deep.')}`;
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" aria-label="Falar com o suporte no WhatsApp"
       title="Falar com o suporte"
       style={{
         position: 'fixed', right: 18, bottom: 18, zIndex: 45,
         width: 56, height: 56, borderRadius: '50%', background: '#1da851',
         display: 'flex', alignItems: 'center', justifyContent: 'center',
         boxShadow: '0 8px 24px -6px rgba(29,168,81,.55)',
       }}>
      <svg viewBox="0 0 24 24" width="30" height="30" fill="#fff">
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.83 14.12c-.25.7-1.45 1.34-2.01 1.42-.51.08-1.16.11-1.87-.12-.43-.14-.99-.32-1.7-.63-2.99-1.29-4.94-4.3-5.09-4.5-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.59-.37.79-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.25.59.84 2.05.91 2.2.07.15.12.33.02.53-.1.2-.15.32-.29.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.3.77 1.27 1.65 2.06 1.13 1.01 2.09 1.32 2.39 1.47.3.15.47.12.65-.07.17-.2.74-.87.94-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.07.12.07.72-.17 1.43z" />
      </svg>
    </a>
  );
}
