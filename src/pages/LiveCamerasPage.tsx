import React, { useEffect, useState } from 'react';
import { Camera, Radio, Sparkles } from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { useSite } from '../context/SiteContext';
import { LiveCourtCard } from '../components/live/LiveCourtCard';
import { liveCameraService } from '../services/liveCameraService';
import { LiveCamera } from '../types/liveCamera';

export const LiveCamerasPage: React.FC = () => {
  const { name: siteName } = useSite();
  const [cameras, setCameras] = useState<LiveCamera[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const list = await liveCameraService.getLiveCameras();
        if (!cancelled) setCameras(list);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <AppHeader cta={{ label: 'Reservá tu cancha', compactLabel: 'Reservá', to: '/#complejos' }} />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-turf-ink mb-1.5">
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" aria-hidden="true" />
              <span>Cámaras conectadas</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-ink">
              Canchas con transmisión en vivo
            </h1>
            <p className="mt-2.5 text-sm sm:text-base text-ink-muted leading-relaxed">
              Mirá en tiempo real lo que está pasando en las canchas equipadas con cámaras automáticas.
              Accedé a cada transmisión o probá los diferentes estados de conexión del sistema.
            </p>
          </div>

          {/* Discreet Demo Info Strip */}
          <div className="mt-6 p-3.5 rounded-xl bg-surface border border-line flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-ink-muted">
              <Sparkles className="w-4 h-4 text-volt-ink shrink-0" aria-hidden="true" />
              <span className="font-medium text-ink">
                Demostración de streaming simulado para evaluación de frontend {siteName}.
              </span>
            </div>
            <span className="font-mono text-ink-muted">
              Probá cualquier cámara con <code className="px-1.5 py-0.5 rounded bg-surface-muted text-ink">?estado=error</code> para simular fallas.
            </span>
          </div>

          {/* Grid of LiveCourtCard: 2 to 3 columns on desktop */}
          <div className="mt-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="flex flex-col bg-surface border border-line rounded-xl overflow-hidden animate-pulse"
                  >
                    <div className="w-full aspect-[16/10] bg-surface-muted" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 w-28 bg-surface-muted rounded" />
                      <div className="h-6 w-48 bg-surface-muted rounded" />
                      <div className="h-4 w-36 bg-surface-muted rounded" />
                      <div className="h-10 w-full bg-surface-muted rounded-lg pt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cameras.map((camera) => (
                  <LiveCourtCard key={camera.id} camera={camera} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
