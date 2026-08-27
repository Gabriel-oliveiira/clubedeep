import { redirect } from 'next/navigation';
import { getAcesso } from '@/lib/acesso';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { carregarDados } from '@/lib/dados';
import { pontos, labelCategoria, labelTipoCliente, dataBR } from '@/lib/format';
import { nomeLoja } from '@/lib/lojas';

export const dynamic = 'force-dynamic';

export default async function ClienteFicha() {
  const a = await getAcesso();
  if (!a) redirect('/login');
  if (a.papel !== 'cliente') redirect('/');

  const [{ data: cliente }, dados] = await Promise.all([
    supabaseAdmin.from('clube_clientes').select('*').eq('cd_cliente', a.cd_cliente).maybeSingle(),
    carregarDados(a.cd_cliente),
  ]);
  const saldo = dados.saldo;
  const nivel = saldo?.categoria_efetiva || 'sem_categoria';

  return (
    <>
      <div className="page-head">
        <div><h1>Minha ficha</h1><div className="sub">Seus dados e situacao no Clube Deep.</div></div>
        <span className={`badge ${nivel}`} style={{ fontSize: 13, padding: '6px 16px' }}>{labelCategoria(nivel)}</span>
      </div>

      {saldo?.em_carencia && (
        <div className="banner warn">
          <div><b>Voce esta em carencia.</b> Mantem os beneficios de {labelCategoria(nivel)} ate <b>{dataBR(saldo?.carencia_ate)}</b>. Faca uma nova compra para manter seu nivel.</div>
        </div>
      )}

      <div className="grid cols-4">
        <div className="card kpi-card ok"><div><div className="kpi-val num">{pontos(saldo?.pontos_validos || 0)}</div><div className="kpi-lbl">Saldo de pontos</div></div></div>
        <div className="card kpi-card"><div><div className="kpi-val" style={{ fontSize: 19 }}>{dataBR(saldo?.categoria_desde)}</div><div className="kpi-lbl">Neste nivel desde</div></div></div>
        <div className="card kpi-card gold"><div><div className="kpi-val num">{pontos(dados.aexp?.expira_30d || 0)}</div><div className="kpi-lbl">A expirar em 30 dias</div></div></div>
        <div className="card kpi-card"><div><div className="kpi-val num">{pontos(dados.aexp?.expira_60d || 0)}</div><div className="kpi-lbl">A expirar em 60 dias</div></div></div>
      </div>

      <div className="card">
        <h2>Meus dados</h2>
        <div className="grid cols-3">
          <div><small className="muted">Nome</small><div>{cliente?.nome || '-'}</div></div>
          <div><small className="muted">CPF/CNPJ</small><div className="num">{cliente?.cpf_cnpj || '-'}</div></div>
          <div><small className="muted">Categoria</small><div>{labelTipoCliente(cliente?.cat_cliente)}</div></div>
          <div><small className="muted">Cidade/UF</small><div>{[cliente?.cidade, cliente?.uf].filter(Boolean).join(' / ') || '-'}</div></div>
          <div><small className="muted">Telefone</small><div className="num">{cliente?.telefone || '-'}</div></div>
          <div><small className="muted">E-mail</small><div>{cliente?.email || a.email}</div></div>
          <div><small className="muted">Ultima compra</small><div>{dataBR(cliente?.dt_ultima_compra)}</div></div>
          <div><small className="muted">Loja da ultima compra</small><div>{dados.lojaUltima || '-'}</div></div>
          <div><small className="muted">Loja de cadastro</small><div>{nomeLoja(cliente?.empresa)}</div></div>
        </div>
      </div>
    </>
  );
}
