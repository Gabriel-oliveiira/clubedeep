// Periodo de resgate conforme a periodicidade do beneficio (fuso America/Fortaleza, UTC-3).
export function periodoAtual(periodicidade, base = new Date()) {
  const d = new Date(base.getTime() - 3 * 3600 * 1000); // UTC-3
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  if (periodicidade === 'mensal') return `${y}-${m}`;
  if (periodicidade === 'anual') return `${y}`;
  return 'unico';
}

const MESES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
export function labelPeriodoRef(ref) {
  if (!ref || ref === 'unico') return 'Único';
  if (/^\d{4}$/.test(ref)) return ref;                 // ano
  const [y, m] = ref.split('-');                        // YYYY-MM
  return `${MESES[Number(m)] || m}/${y}`;
}
