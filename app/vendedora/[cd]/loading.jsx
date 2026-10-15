export default function LoadingFicha() {
  return (
    <>
      <div className="page-head">
        <div>
          <p style={{ margin: '0 0 6px' }}><span className="muted">&larr; Meus clientes</span></p>
          <div className="sk sk-title" />
        </div>
      </div>

      <div className="tabs ftabs-top">
        {['Ficha', 'Vendas', 'Extrato', 'Trajetoria', 'Beneficios'].map(t => (
          <button key={t} type="button" disabled>{t}</button>
        ))}
      </div>

      <div className="grid cols-4">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="card kpi-card"><div><div className="sk sk-kpi" /><div className="sk sk-line" style={{ marginTop: 8 }} /></div></div>
        ))}
      </div>

      <div className="card">
        <div className="sk sk-line" style={{ width: 160, height: 16 }} />
        <div className="grid cols-3" style={{ marginTop: 14 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}><div className="sk sk-line" style={{ width: 90, height: 10 }} /><div className="sk sk-line" style={{ marginTop: 6 }} /></div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', padding: '10px 0', color: 'var(--muted)', fontSize: 13 }}>
        <span className="spin" /> Carregando cliente...
      </div>
    </>
  );
}
