'use client';
import { useState } from 'react';
import { pontos, brl, labelCategoria, labelTipoCliente, labelEvento, labelPeriodicidade, labelFormaEntrega, dataBR } from '@/lib/format';
import { nomeLoja } from '@/lib/lojas';
import { IcUsers, IcClock, IcTrend, IcStar } from '@/components/Icons';
import ExtratoPontos from '@/components/ExtratoPontos';

const ABAS = [
  ['ficha', 'Ficha', IcUsers],
  ['vendas', 'Vendas', IcTrend],
  ['extrato', 'Extrato de pontos', IcClock],
  ['trajetoria', 'Trajetoria', IcTrend],
  ['beneficios', 'Beneficios', IcStar],
];
const CURTO = ['Ficha', 'Vendas', 'Extrato', 'Trajetoria', 'Beneficios'];

export default function FichaVendedora({ cliente, saldo, extrato = [], trajetoria = [], aexp, lojaUltima, nivel, beneficios = [], vendas = [] }) {
  const [aba, setAba] = useState('ficha');
  const cat = saldo?.categoria_efetiva || nivel || 'sem_categoria';

  return (
    <>
      <div className="page-head">
        <div>
          <p style={{ margin: '0 0 6px' }}><a className="muted" href="/vendedora">&larr; Meus clientes</a></p>
          <h1>{cliente.cd_cliente} - {cliente.nome}</h1>
        </div>
        <span className={`badge ${cat}`} style={{ fontSize: 13, padding: '6px 16px' }}>{labelCategoria(cat)}</span>
      </div>

      <div className="tabs ftabs-top">
        {ABAS.map(([k, l]) => (
          <button key={k} type="button" className={aba === k ? 'active' : ''} onClick={() => setAba(k)}>{l}</button>
        ))}
      </div>
      <h2 className="ficha-title-mobile">{(ABAS.find(x => x[0] === aba) || [])[1]}</h2>

      {aba === 'ficha' && (
        <>
          {saldo?.em_carencia && (
            <div className="banner warn">
              <div><b>Cliente em carencia.</b> Mantem os beneficios de {labelCategoria(cat)} ate <b>{dataBR(saldo?.carencia_ate)}</b>.</div>
            </div>
          )}
          <div className="grid cols-4">
            <div className="card kpi-card ok"><div><div className="kpi-val num">{pontos(saldo?.pontos_validos || 0)}</div><div className="kpi-lbl">Saldo de pontos</div></div></div>
            <div className="card kpi-card"><div><div className="kpi-val" style={{ fontSize: 19 }}>{dataBR(saldo?.categoria_desde)}</div><div className="kpi-lbl">Neste nivel desde</div></div></div>
            <div className="card kpi-card gold"><div><div className="kpi-val num">{pontos(aexp?.expira_30d || 0)}</div><div className="kpi-lbl">A expirar em 30 dias</div></div></div>
            <div className="card kpi-card"><div><div className="kpi-val num">{pontos(aexp?.expira_60d || 0)}</div><div className="kpi-lbl">A expirar em 60 dias</div></div></div>
          </div>
          <div className="card">
            <h2>Dados do cliente</h2>
            <div className="grid cols-3">
              <div><small className="muted">CPF/CNPJ</small><div className="num">{cliente.cpf_cnpj || '-'}</div></div>
              <div><small className="muted">Categoria</small><div>{labelTipoCliente(cliente.cat_cliente)}</div></div>
              <div><small className="muted">Cidade/UF</small><div>{[cliente.cidade, cliente.uf].filter(Boolean).join(' / ') || '-'}</div></div>
              <div><small className="muted">Telefone</small><div className="num">{cliente.telefone || '-'}</div></div>
              <div><small className="muted">E-mail</small><div>{cliente.email || '-'}</div></div>
              <div><small className="muted">Ultima compra</small><div>{dataBR(cliente.dt_ultima_compra)}</div></div>
              <div><small className="muted">Loja da ultima compra (clube)</small><div>{lojaUltima || '-'}</div></div>
              <div><small className="muted">Loja de cadastro</small><div>{nomeLoja(cliente.empresa)}</div></div>
            </div>
          </div>
        </>
      )}

      {aba === 'vendas' && (
        <div className="card flush">
          <div className="card-pad">
            <h2 style={{ margin: 0 }}>Vendas no clube</h2>
            <p className="muted" style={{ fontSize: 12.5, margin: '4px 0 0' }}>
              Vendas suas pra este cliente que entraram no clube (nota a partir de R$ 2.500). Nao e o total de vendas do sistema.
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Transacao</th>
                  <th>Loja</th>
                  <th style={{ textAlign: 'right' }}>Pecas</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                  <th style={{ textAlign: 'right' }}>Pontos</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((v, i) => (
                  <tr key={v.transacao || i}>
                    <td className="num">{dataBR(v.dt_venda)}</td>
                    <td className="num">{v.transacao}</td>
                    <td>{v.loja || '-'}</td>
                    <td style={{ textAlign: 'right' }} className="num">{v.qt_pecas}</td>
                    <td style={{ textAlign: 'right' }} className="num">{brl(v.vl_venda)}</td>
                    <td style={{ textAlign: 'right' }} className="num">{pontos(v.pontos || 0)}</td>
                    <td>{v.status === 'ativa' ? <span className="chip ativa">ativa</span> : <span className="chip">cancelada</span>}</td>
                  </tr>
                ))}
                {vendas.length === 0 && <tr><td colSpan={7}><div className="empty">Sem vendas no clube.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {aba === 'extrato' && <ExtratoPontos extrato={extrato} />}

      {aba === 'trajetoria' && (
        <div className="card flush">
          <div className="card-pad"><h2 style={{ margin: 0 }}>Trajetoria de nivel</h2></div>
          <div style={{ overflowX: 'auto' }}>
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
        </div>
      )}

      {aba === 'beneficios' && (
        <div className="card flush">
          <div className="card-pad"><h2 style={{ margin: 0 }}>Beneficios do nivel {labelCategoria(cat)}</h2></div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>Beneficio</th><th>Periodicidade</th><th>Como recebe</th></tr></thead>
              <tbody>
                {beneficios.map(b => (
                  <tr key={b.id}>
                    <td><b>{b.titulo}</b></td>
                    <td>{labelPeriodicidade(b.periodicidade)}</td>
                    <td>{labelFormaEntrega(b.forma_entrega)}</td>
                  </tr>
                ))}
                {beneficios.length === 0 && <tr><td colSpan={3}><div className="empty">Este nivel ainda nao tem beneficios cadastrados.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="ftabs-spacer" />
      <nav className="ftabs-bottom">
        {ABAS.map(([k, , Icon], i) => (
          <button key={k} type="button" className={aba === k ? 'active' : ''} onClick={() => setAba(k)} aria-label={CURTO[i]}>
            <Icon /><span>{CURTO[i]}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
