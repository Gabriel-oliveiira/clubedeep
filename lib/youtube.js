// Extrai o ID (11 chars) de varias formas de URL do YouTube, ou aceita o ID direto.
export function extrairYoutubeId(entrada) {
  const s = String(entrada || '').trim();
  if (!s) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s; // ja e o id
  const padroes = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/live\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of padroes) { const m = s.match(p); if (m) return m[1]; }
  return null;
}
