'use client';
import { useState, useMemo } from 'react';
import { pontos, dataBR, labelOrigem } from '@/lib/format';

const RANK = { venda: 0, ticket_medio: 1 };

// Ordena mantendo, no mesmo dia/transacao, a venda antes do bonus gerado por ela.
function ordenar(lista, dir) {
  return lista.slice().sort((a, b) => {
    const d = new Date(a.dt_ponto) - new Date(b.dt_ponto);
    if (d !== 0) return dir === 'asc' ? d : -d;
    const ref = String(a.referencia || '').localeCompare(String(b.referencia || ''));
    if (ref !== 0) return ref;
    return (RANK[a.origem] ?? 2) - (RANK[b.origem] ?? 2);
  });
}

export default function ExtratoPontos({ extrato = [] }) {
  const [dir, setDir] = useState('asc');       // asc = do primeiro movimento (auditoria)
  const [tam, setTam] = useState(10);          // 10 / 25 / 50
  const [pag, setPag] = useState(1);

  const ordenado = useMemo(() => ordenar(extrato, dir), [extrato, dir]);
  const totalPags = Math.max(1, Math.ceil(ordenado.length / tam));
  const pagAtual = Math.min(pag, totalPags);
  const inicio = (pagAtual - 1) * tam;
  const visiveis = ordenado.slice(inicio, inicio + tam);

  return (
    <div className="card flush">
      <div className="card-pad" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Extrato de pontos</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={dir} onChange={(e) => { setDir(e.target.value); setPag(1); }} style={{ minWidth: 170 }}>
            <option value="asc">Do primeiro ao ultimo</option>
            <option value="desc">Do ultimo ao primeiro</option>
          </select>
          <select value={tam} onChange={(e) => { setTam(Number(e.target.value)); setPag(1); }} style={{ minWidth: 110 }}>
            <option value={10}>10 por pagina</option>
            <option value={25}>25 por pagina</option>
            <option value={50}>50 por pagina</option>
          </select>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead><tr><th>Origem</th><th>Descricao</th><th>Ganho em</th><th>Expira em</th><th>Situacao</th><th style={{ textAlign: 'right' }}>Pontos</th></tr></thead>
          <tbody>
            {visiveis.map((m, i) => (
              <tr key={inicio + i}>
                <td>{labelOrigem(m.origem)}</td>
                <td className="muted">{m.descricao}</td>
                <td className="num">{dataBR(m.dt_ponto)}</td>
                <td className="num">{dataBR(m.dt_expira)}</td>
                <td className={m.situacao_ponto === 'expirado' ? 'sit-expirado' : 'sit-valido'}>{m.situacao_ponto}</td>
                <td style={{ textAlign: 'right' }} className={`num ${Number(m.pontos) >= 0 ? 'pos' : 'neg'}`}>{Number(m.pontos) >= 0 ? '+' : ''}{pontos(m.pontos)}</td>
              </tr>
            ))}
            {ordenado.length === 0 && <tr><td colSpan={6}><div className="empty">Sem lancamentos ainda.</div></td></tr>}
          </tbody>
        </table>
      </div>
      {ordenado.length > 0 && (
        <div className="pager">
          <span>{ordenado.length} lancamento(s) · pagina {pagAtual} de {totalPags}</span>
          <div className="btns">
            <button type="button" disabled={pagAtual <= 1} onClick={() => setPag(pagAtual - 1)}>&larr; Anterior</button>
            <button type="button" disabled={pagAtual >= totalPags} onClick={() => setPag(pagAtual + 1)}>Proxima &rarr;</button>
          </div>
        </div>
      )}
    </div>
  );
}
