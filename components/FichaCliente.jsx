import { brl, pontos, dataBR, labelCategoria, labelEvento } from '@/lib/format';
import { IcStar, IcClock, IcTrend, IcAlert } from '@/components/Icons';

export default function FichaCliente({ cliente, saldo, extrato = [], trajetoria = [], aexp, voltar, loja = false }) {
  const cat = saldo?.categoria_efetiva || 'sem_categoria';
  const catReal = saldo?.categoria || 'sem_categoria';
  return (
    <>
      <div className="page-head">
        <div>
          {voltar && <p style={{ margin: '0 0 6px' }}><a className="muted" href={voltar}>&larr; Clientes</a></p>}
          <h1>{cliente.nome}</h1>
          {!loja && <div className="sub num">#{cliente.cd_cliente} {cliente.cpf_cnpj ? `· ${cliente.cpf_cnpj}` : ''}</div>}
        </div>
        <span className={`badge ${cat}`} style={{ fontSize: 13, padding: '6px 16px' }}>{labelCategoria(cat)}</span>
      </div>

      {saldo?.em_carencia && (
        <div className="banner warn">
          <IcAlert style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1 }} />
          <div>
            <b>Cliente em carencia.</b> Os pontos cairam abaixo de {labelCategoria(cat)} (hoje seria {labelCategoria(catReal)}).
            Mantem os beneficios ate <b>{dataBR(saldo?.carencia_ate)}</b>.
          </div>
        </div>
      )}

      <div className="grid cols-4">
        <div className="card kpi-card ok">
          <div className="kpi-top"><div className="kpi-ico"><IcStar /></div></div>
          <div><div className="kpi-val num">{pontos(saldo?.pontos_validos || 0)}</div><div className="kpi-lbl">Saldo de pontos</div></div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-top"><div className="kpi-ico"><IcTrend /></div></div>
          <div><div className="kpi-val" style={{ fontSize: 19 }}>{dataBR(saldo?.categoria_desde)}</div><div className="kpi-lbl">Nesta categoria desde</div></div>
        </div>
        <div className="card kpi-card gold">
          <div className="kpi-top"><div className="kpi-ico"><IcClock /></div></div>
          <div><div className="kpi-val num">{pontos(aexp?.expira_30d || 0)}</div><div className="kpi-lbl">A expirar em 30 dias</div></div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-top"><div className="kpi-ico"><IcClock /></div></div>
          <div><div className="kpi-val num">{pontos(aexp?.expira_60d || 0)}</div><div className="kpi-lbl">A expirar em 60 dias</div></div>
        </div>
      </div>

      {!loja && (
        <div className="card">
          <h2>Dados do cliente</h2>
          <div className="grid cols-3">
            <div><small className="muted">CPF/CNPJ</small><div className="num">{cliente.cpf_cnpj || '-'}</div></div>
            <div><small className="muted">Classificacao (TOTVS)</small><div>{cliente.cat_cliente || '-'}</div></div>
            <div><small className="muted">Cidade/UF</small><div>{[cliente.cidade, cliente.uf].filter(Boolean).join(' / ') || '-'}</div></div>
            <div><small className="muted">Telefone</small><div className="num">{cliente.telefone || '-'}</div></div>
            <div><small className="muted">E-mail</small><div>{cliente.email || '-'}</div></div>
            <div><small className="muted">Ultima compra</small><div>{dataBR(cliente.dt_ultima_compra)}</div></div>
          </div>
        </div>
      )}

      <div className="card flush">
        <div className="card-pad"><h2 style={{ margin: 0 }}>Extrato de pontos</h2></div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Origem</th><th>Descricao</th><th>Ganho em</th><th>Expira em</th><th>Situacao</th><th style={{ textAlign: 'right' }}>Pontos</th></tr></thead>
            <tbody>
              {extrato.map((m, i) => (
                <tr key={i}>
                  <td style={{ textTransform: 'capitalize' }}>{String(m.origem || '').replace('_', ' ')}</td>
                  <td className="muted">{m.descricao}</td>
                  <td className="num">{dataBR(m.dt_ponto)}</td>
                  <td className="num">{dataBR(m.dt_expira)}</td>
                  <td className={m.situacao_ponto === 'expirado' ? 'sit-expirado' : 'sit-valido'}>{m.situacao_ponto}</td>
                  <td style={{ textAlign: 'right' }} className={`num ${Number(m.pontos) >= 0 ? 'pos' : 'neg'}`}>{Number(m.pontos) >= 0 ? '+' : ''}{pontos(m.pontos)}</td>
                </tr>
              ))}
              {extrato.length === 0 && <tr><td colSpan={6}><div className="empty">Sem lancamentos ainda.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {!loja && (
        <div className="card flush">
          <div className="card-pad"><h2 style={{ margin: 0 }}>Trajetoria de categoria</h2></div>
          <table>
            <thead><tr><th>Quando</th><th>Evento</th><th>De</th><th>Para</th><th style={{ textAlign: 'right' }}>Pontos</th></tr></thead>
            <tbody>
              {trajetoria.map((h, i) => (
                <tr key={i}>
                  <td className="num">{dataBR(h.criado_em)}</td>
                  <td>{labelEvento(h.evento)}</td>
                  <td>{h.categoria_anterior ? <span className={`badge ${h.categoria_anterior}`}>{labelCategoria(h.categoria_anterior)}</span> : '-'}</td>
                  <td><span className={`badge ${h.categoria_nova}`}>{labelCategoria(h.categoria_nova)}</span></td>
                  <td style={{ textAlign: 'right' }} className="num">{pontos(h.pontos_no_momento)}</td>
                </tr>
              ))}
              {trajetoria.length === 0 && <tr><td colSpan={5}><div className="empty">Sem mudancas registradas.</div></td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
