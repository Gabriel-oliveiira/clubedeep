// Nome da loja (filial) por codigo de empresa
const LOJAS = {
  1: 'Showroom', 2: 'Deep Maraponga', 3: 'Loe Dom Luis', 4: 'Loe Maraponga',
  5: 'Deep Sul', 6: 'Loe Sul', 7: 'Casa Deep', 8: 'Secret Maraponga', 9: 'Loe Metro',
  10: 'Secret Sul', 11: 'Inside Sales', 12: 'Deep Parceiro', 13: 'Deep Maringa',
  14: 'Secret Maraca', 15: 'Deep Goiania', 16: 'Ecommerce', 17: 'Deep Iguatemi',
  18: 'Loe Maringa', 19: 'Loja Pedidos', 20: 'Deep Sao Paulo',
  500: 'Deep Belem', 501: 'Deep Recife', 502: 'Deep Olinda', 503: 'Deep Vitoria',
  504: 'Deep Juazeiro', 505: 'Deep Manaus', 506: 'Deep Brasilia', 507: 'Loe Aracaju',
  508: 'Deep Salvador', 509: 'Loe Juazeiro',
};

export function nomeLoja(empresa) {
  if (empresa == null) return '-';
  const n = LOJAS[Number(empresa)];
  return n ? `${empresa} · ${n}` : String(empresa);
}

// Normaliza telefone BR e gera link do WhatsApp (wa.me exige DDI)
export function linkWhatsapp(telefone) {
  if (!telefone) return null;
  let d = String(telefone).replace(/\D/g, '');
  if (!d) return null;
  d = d.replace(/^0+/, '');                 // remove zeros a esquerda
  if (!d.startsWith('55')) d = '55' + d;    // DDI Brasil
  if (d.length < 12 || d.length > 13) return null; // 55 + DDD + 8/9 digitos
  return `https://wa.me/${d}`;
}
