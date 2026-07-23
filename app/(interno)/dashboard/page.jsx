import DashboardInterativo from '@/components/DashboardInterativo';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Visao geral</h1>
          <div className="sub" style={{ textTransform: 'capitalize' }}>{hoje}</div>
        </div>
      </div>
      <DashboardInterativo />
    </>
  );
}
