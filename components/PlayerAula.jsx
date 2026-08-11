'use client';
import { useEffect, useRef, useState } from 'react';

// Player simples do YouTube com rastreio de progresso (marca a aula concluida ~95%).
export default function PlayerAula({ youtubeId, onProgresso, onConcluir }) {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const timerRef = useRef(null);
  const concluiuRef = useRef(false);

  useEffect(() => {
    concluiuRef.current = false;
    let cancelado = false;

    function criar() {
      if (cancelado || !hostRef.current) return;
      const alvo = document.createElement('div');
      hostRef.current.appendChild(alvo);
      playerRef.current = new window.YT.Player(alvo, {
        videoId: youtubeId,
        playerVars: { rel: 0, playsinline: 1, modestbranding: 1 },
        events: {
          onStateChange: (e) => {
            const YT = window.YT;
            if (e.data === YT.PlayerState.PLAYING) iniciarTimer();
            else if (e.data === YT.PlayerState.ENDED) { pararTimer(); marcarConcluida(); }
            else pararTimer();
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
      playerRef.current = null;
    };
  }, [youtubeId]);

  function iniciarTimer() {
    pararTimer();
    timerRef.current = setInterval(() => {
      const p = playerRef.current; if (!p || !p.getCurrentTime) return;
      const c = p.getCurrentTime() || 0, d = p.getDuration() || 0;
      if (onProgresso) onProgresso(Math.floor(c), Math.floor(d));
      if (d > 0 && c / d >= 0.95) marcarConcluida();
    }, 1000);
  }
  function pararTimer() { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }
  function marcarConcluida() { if (!concluiuRef.current) { concluiuRef.current = true; onConcluir && onConcluir(); } }

  return (
    <div className="aula-player">
      <div className="aula-video">
        <div ref={hostRef} className="aula-iframe" />
      </div>
      <style jsx>{`
        .aula-player { border-radius:14px; overflow:hidden; background:#000; }
        .aula-video { position:relative; width:100%; padding-top:56.25%; background:#000; }
        .aula-iframe { position:absolute; inset:0; }
        .aula-video :global(iframe) { position:absolute; inset:0; width:100%; height:100%; border:0; }
      `}</style>
    </div>
  );
}
