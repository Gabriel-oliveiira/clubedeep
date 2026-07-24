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
// Nivel = tiers de pontuacao (antes chamado de "categoria")
export function labelCategoria(c) {
  const m = { platina: 'Platina', ouro: 'Ouro', prata: 'Prata', bronze: 'Bronze', sem_categoria: 'Sem nivel' };
  return m[c] || c || '-';
}
export const labelNivel = labelCategoria;
// Categoria = tipo do cliente (cat_cliente do TOTVS)
export function labelTipoCliente(c) {
  if (!c) return '-';
  const s = String(c).toLowerCase();
  const m = { revendedor: 'Revendedor', lojista: 'Lojista', representante: 'Representante' };
  return m[s] || (s.charAt(0).toUpperCase() + s.slice(1));
}
// Origem do lancamento no extrato
export function labelOrigem(o) {
  const m = { venda: 'Venda', ticket_medio: 'Bônus', recorrencia_3m: 'Bônus recorrência (3m)', recorrencia_6m: 'Bônus recorrência (6m)' };
  return m[o] || String(o || '').replace(/_/g, ' ');
}
export function labelEvento(e) {
  const m = {
    entrada: 'Entrada', upgrade: 'Subiu de nivel', downgrade: 'Caiu de nivel',
    carencia_iniciada: 'Entrou em carencia', carencia_revertida: 'Recuperou na carencia',
  };
  return m[e] || e;
}
