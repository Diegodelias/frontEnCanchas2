import React, { useEffect, useRef, useState } from 'react';
import {
  buildHeroPosterDataUri,
  HERO_COPY,
  HERO_VIDEO_PLAYBACK_RATE,
  HERO_VIDEO_SRC,
} from '../../data/heroConfig';
import { MatchCascadingSelector } from '../match/MatchCascadingSelector';
import { Button } from '../ui/Button';

interface HeroSearchSectionProps {
  activeCityName: string;
  onPrimaryCta: () => void;
  onOwnerCta: () => void;
}

export const HeroSearchSection: React.FC<HeroSearchSectionProps> = ({
  activeCityName,
  onPrimaryCta,
  onOwnerCta,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [posterUri, setPosterUri] = useState<string>('');
  const [videoFailed, setVideoFailed] = useState<boolean>(false);

  // Configure video poster, playback rate, and reduced motion compliance
  useEffect(() => {
    setPosterUri(buildHeroPosterDataUri());

    const video = videoRef.current;
    if (!video) return;

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
  }, []);

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-pitch text-pitch-ink dark-focus min-h-[600px] lg:min-h-[700px] flex items-center"
    >
      {/* Architectural CSS-token fallback backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-pitch"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 75% 60% at 50% 35%, var(--c3-pitch-elevated) 0%, var(--c3-pitch) 78%)',
        }}
      />

      {/* Background Hero Video */}
      {!videoFailed && (
        <video
          ref={videoRef}
          src={HERO_VIDEO_SRC}
          poster={posterUri || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setVideoFailed(true)}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}

      {/* Measured Dark Gradient Scrim for >= 4.5:1 Contrast */}
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
        <div className="max-w-3xl">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-volt">
            Canchas de fútbol · {activeCityName}
          </p>

          <h1 className="mt-3 font-display text-4xl sm:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight text-pitch-ink leading-[1.03]">
            {HERO_COPY.headline}
          </h1>

          <p className="mt-4 text-base sm:text-xl text-pitch-ink/90 max-w-2xl leading-relaxed">
            {HERO_COPY.subtitle}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant="volt"
              size="lg"
              className="w-full sm:w-auto"
              onClick={onPrimaryCta}
            >
              {HERO_COPY.primaryCta}
            </Button>
            <Button
              variant="darkSecondary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={onOwnerCta}
            >
              {HERO_COPY.secondaryCta}
            </Button>
          </div>
        </div>

        {/* Protagonista Cascading Search Bar Reutilizado */}
        <div id="buscador" className="mt-8 sm:mt-10">
          <MatchCascadingSelector variant="hero" />
        </div>
      </div>
    </section>
  );
};
