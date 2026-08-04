'use client';
import { useEffect, useRef, useState } from 'react';

function mmss(s) {
  s = Math.max(0, Math.floor(s || 0));
  const m = Math.floor(s / 60), r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

// Player que embute o YouTube (nao listado) escondendo logo, controles e titulo.
// Uma camada por cima bloqueia clique/menu no iframe; usamos controles proprios.
export default function PlayerAula({ youtubeId, onProgresso, onConcluir }) {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const timerRef = useRef(null);
  const concluiuRef = useRef(false);
  const [pronto, setPronto] = useState(false);
  const [tocando, setTocando] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    concluiuRef.current = false;
    let cancelado = false;

    function criar() {
      if (cancelado || !hostRef.current) return;
      // cria um no proprio (fora do controle do React) para o YT substituir
      const alvo = document.createElement('div');
      hostRef.current.appendChild(alvo);
      playerRef.current = new window.YT.Player(alvo, {
        videoId: youtubeId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          controls: 0, modestbranding: 1, rel: 0, iv_load_policy: 3,
          disablekb: 1, fs: 0, playsinline: 1, showinfo: 0,
          origin: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
        events: {
          onReady: () => { if (!cancelado) { setPronto(true); setDur(playerRef.current.getDuration() || 0); } },
          onStateChange: (e) => {
            const YT = window.YT;
            if (e.data === YT.PlayerState.PLAYING) { setTocando(true); iniciarTimer(); }
            else if (e.data === YT.PlayerState.ENDED) { setTocando(false); pararTimer(); marcarConcluida(); }
            else { setTocando(false); pararTimer(); }
          },
        },
      });
    }

    function carregarApi() {
      if (window.YT && window.YT.Player) { criar(); return; }
      if (!document.getElementById('yt-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
      const anterior = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { anterior && anterior(); criar(); };
    }

    carregarApi();
    return () => {
      cancelado = true; pararTimer();
      try { playerRef.current && playerRef.current.destroy(); } catch (e) {}
      playerRef.current = null; setPronto(false); setTocando(false); setCur(0); setDur(0);
    };
  }, [youtubeId]);

  function iniciarTimer() {
    pararTimer();
    timerRef.current = setInterval(() => {
      const p = playerRef.current; if (!p || !p.getCurrentTime) return;
      const c = p.getCurrentTime() || 0, d = p.getDuration() || 0;
      setCur(c); setDur(d);
      if (onProgresso) onProgresso(Math.floor(c), Math.floor(d));
      if (d > 0 && c / d >= 0.95) marcarConcluida();
    }, 500);
  }
  function pararTimer() { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }
  function marcarConcluida() { if (!concluiuRef.current) { concluiuRef.current = true; onConcluir && onConcluir(); } }

  function toggle() {
    const p = playerRef.current; if (!p) return;
    if (tocando) p.pauseVideo(); else p.playVideo();
  }
  function buscar(e) {
    const p = playerRef.current; if (!p || !dur) return;
    const r = e.currentTarget.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    p.seekTo(frac * dur, true); setCur(frac * dur);
  }

  const pct = dur ? (cur / dur) * 100 : 0;

  return (
    <div className="aula-player">
      <div className="aula-video" onContextMenu={(e) => e.preventDefault()}>
        <div ref={hostRef} className="aula-iframe" />
        {/* camada que bloqueia interacao com o YouTube */}
        <div className="aula-mask" onClick={toggle} onContextMenu={(e) => e.preventDefault()}>
          {!tocando && pronto && <div className="aula-play"><span>&#9658;</span></div>}
          {!pronto && <div className="aula-load">Carregando aula...</div>}
        </div>
      </div>
      <div className="aula-controls">
        <button type="button" className="aula-btn" onClick={toggle} disabled={!pronto} aria-label={tocando ? 'Pausar' : 'Reproduzir'}>
          {tocando ? '❚❚' : '►'}
        </button>
        <div className="aula-bar" onClick={buscar}>
          <div className="aula-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="aula-time num">{mmss(cur)} / {mmss(dur)}</span>
      </div>

      <style jsx>{`
        .aula-player { background:#000; border-radius:14px; overflow:hidden; }
        .aula-video { position:relative; width:100%; padding-top:56.25%; background:#000; }
        .aula-iframe { position:absolute; inset:0; }
        .aula-video :global(iframe) { position:absolute; inset:0; width:100%; height:100%; border:0; }
        .aula-mask { position:absolute; inset:0; z-index:2; cursor:pointer; display:flex; align-items:center; justify-content:center; }
        .aula-play { width:74px; height:74px; border-radius:50%; background:rgba(0,0,0,.55); color:#fff; display:flex; align-items:center; justify-content:center; font-size:30px; padding-left:6px; }
        .aula-load { color:#fff; opacity:.8; font-size:14px; }
        .aula-controls { display:flex; align-items:center; gap:12px; padding:10px 14px; background:#0d0d0d; }
        .aula-btn { background:#1f1f1f; color:#fff; border:0; width:38px; height:34px; border-radius:8px; cursor:pointer; font-size:13px; }
        .aula-btn:disabled { opacity:.5; cursor:default; }
        .aula-bar { flex:1; height:8px; background:#333; border-radius:999px; cursor:pointer; overflow:hidden; }
        .aula-bar-fill { height:100%; background:var(--brand-2,#c99a5b); }
        .aula-time { color:#cfcfcf; font-size:12px; white-space:nowrap; }
      `}</style>
    </div>
  );
}
