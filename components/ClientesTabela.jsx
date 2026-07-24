'use client';
import { useRouter } from 'next/navigation';
import { pontos, brl, labelCategoria, labelTipoCliente, dataBR } from '@/lib/format';
import { linkWhatsapp, nomeLoja } from '@/lib/lojas';

const IcoWhats = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.83 14.12c-.25.7-1.45 1.34-2.01 1.42-.51.08-1.16.11-1.87-.12-.43-.14-.99-.32-1.7-.63-2.99-1.29-4.94-4.3-5.09-4.5-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.59-.37.79-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.25.59.84 2.05.91 2.2.07.15.12.33.02.53-.1.2-.15.32-.29.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.3.77 1.27 1.65 2.06 1.13 1.01 2.09 1.32 2.39 1.47.3.15.47.12.65-.07.17-.2.74-.87.94-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.07.12.07.72-.17 1.43z" />
  </svg>
);

export default function ClientesTabela({ rows = [] }) {
  const router = useRouter();
  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Loja</th><th>Cliente</th><th>Categoria</th><th>WhatsApp</th><th>E-mail</th>
            <th>Nivel</th><th style={{ textAlign: 'right' }}>Saldo</th>
            <th style={{ textAlign: 'right' }}>Expira 30d</th><th>Ultima compra</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(c => {
            const wa = linkWhatsapp(c.telefone);
            return (
              <tr key={c.cd_cliente} className="row-click"
                onClick={() => router.push(`/clientes/${encodeURIComponent(c.cd_cliente)}`)}
                style={{ cursor: 'pointer' }} title="Abrir ficha do cliente">
                <td style={{ whiteSpace: 'nowrap' }}>
                  {c.loja_ultima || <span className="muted">-</span>}
                  <span className="sub">cad: {nomeLoja(c.empresa)}</span>
                </td>
                <td>
                  <b>{c.cd_cliente} - {c.nome}</b> {c.em_carencia && <span className="chip carencia">carencia</span>}
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>{labelTipoCliente(c.cat_cliente)}</td>
                <td style={{ textAlign: 'center' }}>
                  {wa ? (
                    <a href={wa} target="_blank" rel="noopener noreferrer"
                       onClick={(e) => e.stopPropagation()}
                       style={{ display: 'inline-flex', color: '#1da851' }}
                       title={`Abrir conversa no WhatsApp (${c.telefone})`} aria-label="Abrir WhatsApp">
                      <IcoWhats />
                    </a>
                  ) : (<span className="muted">-</span>)}
                </td>
                <td className="muted" style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.email || ''}>{c.email || '-'}</td>
                <td><span className={`badge ${c.categoria}`}>{labelCategoria(c.categoria)}</span></td>
                <td style={{ textAlign: 'right' }} className="num"><b>{pontos(c.pontos_validos)}</b></td>
                <td style={{ textAlign: 'right' }} className={`num ${Number(c.expira_30d) > 0 ? 'neg' : 'muted'}`}>{pontos(c.expira_30d)}</td>
                <td className="muted" style={{ whiteSpace: 'nowrap' }}>
                  {dataBR(c.dt_ultima_compra)}
                  {c.vl_ultima != null && <span className="sub">{brl(c.vl_ultima)}</span>}
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && <tr><td colSpan={9}><div className="empty">Nenhum cliente encontrado.</div></td></tr>}
        </tbody>
      </table>
    </div>
  );
}
