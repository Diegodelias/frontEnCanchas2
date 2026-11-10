import React, { useEffect, useRef, useState } from 'react';
import {
  HERO_COPY,
  HERO_POSTER_SRC,
  HERO_VIDEO_PLAYBACK_RATE,
  HERO_VIDEO_SRC,
} from '../../data/heroConfig';
import { MatchCascadingSelector } from '../match/MatchCascadingSelector';

interface HeroSearchSectionProps {
  activeCityName: string;
}

export const HeroSearchSection: React.FC<HeroSearchSectionProps> = ({
  activeCityName,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState<boolean>(false);
  const [videoFailed, setVideoFailed] = useState<boolean>(false);
  const [loadVideo, setLoadVideo] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setTimeout(() => setLoadVideo(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  // Configure video poster, playback rate, and reduced motion compliance
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Si el video ya tenía un cuadro listo antes de montar el efecto, no se espera al evento.
    if (video.readyState >= 2) setVideoReady(true);

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const applyPlaybackRate = () => {
      if (prefersReducedMotion) {
        video.pause();
        return;
      }
      video.playbackRate = HERO_VIDEO_PLAYBACK_RATE;
    };

    applyPlaybackRate();
    video.addEventListener('loadedmetadata', applyPlaybackRate);
    video.addEventListener('canplay', applyPlaybackRate);

    return () => {
      video.removeEventListener('loadedmetadata', applyPlaybackRate);
      video.removeEventListener('canplay', applyPlaybackRate);
    };
  }, [loadVideo]);

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-pitch text-pitch-ink dark-focus min-h-[600px] lg:min-h-[700px] flex items-center"
    >
      {/* Architectural CSS-token fallback backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-pitch bg-cover bg-center"
        style={{
          // Primer cuadro del video detrás del video: al entrar el fundido casi no se nota el cambio.
          backgroundImage: `url(${HERO_POSTER_SRC}), radial-gradient(ellipse 75% 60% at 50% 35%, var(--c3-pitch-elevated) 0%, var(--c3-pitch) 78%)`,
        }}
      />

      {/* Background Hero Video */}
      {loadVideo && !videoFailed && (
        <video
          ref={videoRef}
          src={HERO_VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500 motion-reduce:transition-none ${
            videoReady ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Light dark-gradient scrim; contrast target >= 4.5:1, validated per openspec change tasks 3.3 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, var(--c3-scrim-top) 0%, var(--c3-scrim-mid) 46%, var(--c3-scrim-bottom) 100%)',
        }}
      />

      {/* Foreground Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-volt">
            Partidos grabados · {activeCityName}
          </p>

          <h1 className="mt-3 font-display text-[clamp(2.75rem,6vw,5.5rem)] font-extrabold tracking-tight text-pitch-ink leading-[1.03]">
            {HERO_COPY.headline}
          </h1>

          <p className="mt-4 text-base sm:text-xl text-pitch-ink/90 max-w-xl leading-relaxed">
            {HERO_COPY.subtitle}
          </p>
        </div>

        {/* Protagonista Cascading Search Bar Reutilizado */}
        <div id="buscador" className="mt-5 scroll-mt-20 sm:mt-6 sm:scroll-mt-24">
          <MatchCascadingSelector variant="hero" />
        </div>
      </div>
    </section>
  );
};
