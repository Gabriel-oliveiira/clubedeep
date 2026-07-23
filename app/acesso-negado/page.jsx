export default function AcessoNegado() {
  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-logo">
          <img src="/deep-logo.png" alt="DEEP" />
          <small>Clube Deep &middot; Painel de pontos</small>
        </div>
        <div className="login-card" style={{textAlign:'center'}}>
          <h1 style={{fontSize:19,margin:'0 0 8px'}}>Sem acesso</h1>
          <p className="muted" style={{marginTop:0}}>Seu e-mail nao tem permissao no painel do Clube DEEP.<br/>Fale com a equipe DEEP.</p>
          <a className="btn-ghost" style={{display:'inline-flex',padding:'10px 18px',borderRadius:9,marginTop:6}} href="/login">Voltar ao login</a>
        </div>
      </div>
    </div>
  );
}
