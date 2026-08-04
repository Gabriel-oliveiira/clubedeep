// Helpers de CPF/CNPJ (armazenados na base so com digitos)
export function normalizarDoc(v) {
  return String(v || '').replace(/\D/g, '');
}
export function docValido(d) {
  const s = normalizarDoc(d);
  return s.length === 11 || s.length === 14;
}
// Heuristica: se tem @ e' email; senao, se tem 11+ digitos e' documento
export function pareceDocumento(v) {
  const s = String(v || '');
  if (s.includes('@')) return false;
  return normalizarDoc(s).length >= 11;
}
