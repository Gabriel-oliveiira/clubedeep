'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { labelCategoria, dataBR } from '@/lib/format';

export default function CursosTabelaAdmin({ cursos = [], cont = {} }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [abrindo, setAbrindo] = useState(null);

  function abrir(id) {
    setAbrindo(String(id));
    startTransition(() => router.push(`/cursos/${id}`));
  }

  return (
    <div className="card flush" style={{ marginTop: 16 }}>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr><th>Curso</th><th>Nivel minimo</th><th style={{ textAlign: 'center' }}>Aulas</th><th>Status</th><th>Criado</th></tr>
          </thead>
          <tbody>
            {cursos.map(c => {
              const carregando = abrindo === String(c.id) && pending;
              return (
                <tr key={c.id} className="row-click" onClick={() => abrir(c.id)}
                  style={{ cursor: 'pointer', opacity: carregando ? 0.55 : 1 }} title="Abrir curso">
                  <td>
                    <b>{c.titulo}</b>
                    {carregando && <span className="spin" aria-label="Carregando" />}
                    {c.descricao && <span className="sub">{c.descricao}</span>}
                  </td>
                  <td>{labelCategoria(c.nivel_minimo)}+</td>
                  <td style={{ textAlign: 'center' }}>{cont[c.id] || 0}</td>
                  <td>
                    {c.em_breve && <span className="chip" style={{ background: 'var(--brand,#6b4e3d)', color: '#fff', marginRight: 6 }}>em breve</span>}
                    {c.ativo
                      ? <span className="chip" style={{ background: '#e6f4ea', color: '#1da851' }}>ativo</span>
                      : <span className="chip">inativo</span>}
                  </td>
                  <td className="muted">{dataBR(c.criado_em)}</td>
                </tr>
              );
            })}
            {cursos.length === 0 && <tr><td colSpan={5}><div className="empty">Nenhum curso ainda. Crie o primeiro acima.</div></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
