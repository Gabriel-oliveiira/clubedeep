'use client';
import { useState } from 'react';
import { pontos, labelCategoria, labelTipoCliente, labelEvento, dataBR } from '@/lib/format';
import { nomeLoja } from '@/lib/lojas';
import { IcUsers, IcClock, IcTrend, IcStar } from '@/components/Icons';
import ExtratoPontos from '@/components/ExtratoPontos';
import BeneficiosClienteAdmin from '@/components/BeneficiosClienteAdmin';

const ABAS = [
  ['ficha', 'Ficha', IcUsers],
  ['extrato', 'Extrato de pontos', IcClock],
  ['trajetoria', 'Trajetoria', IcTrend],
  ['beneficios', 'Beneficios', IcStar],
];

export default function FichaTabs({ cliente, saldo, extrato = [], trajetoria = [], aexp, lojaUltima, nivel, beneficios = [], resgatesIniciais = [], voltar = '/clientes' }) {
  const [aba, setAba] = useState('ficha');
  const cat = saldo?.categoria_efetiva || nivel || 'sem_categoria';

  return (
    <>
      <div className="page-head">
        <div>
          <p style={{ margin: '0 0 6px' }}><a className="muted" href={voltar}>&larr; Clientes</a></p>
          <h1>{cliente.cd_cliente} - {cliente.nome}</h1>
        </div>
        <span className={`badge ${cat}`} style={{ fontSize: 13, padding: '6px 16px' }}>{labelCategoria(cat)}</span>
      </div>

      {/* desktop: abas com texto */}
      <div className="tabs ftabs-top">
        {ABAS.map(([k, l]) => (
          <button key={k} type="button" className={aba === k ? 'active' : ''} onClick={() => setAba(k)}>{l}</button>
        ))}
      </div>
      {/* mobile: titulo da secao atual */}
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
        <BeneficiosClienteAdmin cdCliente={cliente.cd_cliente} nivel={cat} beneficios={beneficios} resgatesIniciais={resgatesIniciais} />
      )}

      {/* mobile: barra inferior com icones */}
      <div className="ftabs-spacer" />
      <nav className="ftabs-bottom">
        {ABAS.map(([k, , Icon], i) => {
          const curto = ['Ficha', 'Extrato', 'Trajetoria', 'Beneficios'][i];
          return (
            <button key={k} type="button" className={aba === k ? 'active' : ''} onClick={() => setAba(k)} aria-label={curto}>
              <Icon /><span>{curto}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
