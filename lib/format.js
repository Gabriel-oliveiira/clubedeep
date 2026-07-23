export function brl(v) {
  const n = Number(v || 0);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
export function pontos(v) {
  return Math.round(Number(v || 0)).toLocaleString('pt-BR');
}
export function dataBR(d) {
  if (!d) return '-';
  try { return new Date(d).toLocaleDateString('pt-BR'); } catch (e) { return String(d); }
}
export function labelCategoria(c) {
  const m = { platina: 'Platina', ouro: 'Ouro', prata: 'Prata', bronze: 'Bronze', sem_categoria: 'Sem categoria' };
  return m[c] || c || '-';
}
export function labelEvento(e) {
  const m = {
    entrada: 'Entrada', upgrade: 'Subiu de categoria', downgrade: 'Caiu de categoria',
    carencia_iniciada: 'Entrou em carencia', carencia_revertida: 'Recuperou na carencia',
  };
  return m[e] || e;
}
