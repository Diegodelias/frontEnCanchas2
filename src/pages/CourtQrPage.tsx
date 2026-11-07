import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  MapPin,
  Play,
  QrCode,
  Search,
  Video,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { buildLiveStreamPath, buildSearchPath, ROUTES } from '../routes/paths';

export const CourtQrPage: React.FC = () => {
  const { courtId } = useParams<{ courtId: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Navbar />

      <main className="flex-1 py-10 sm:py-14 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center space-y-6">
          {/* Beacon QR Badge */}
          <div className="w-16 h-16 rounded-2xl bg-volt flex items-center justify-center mx-auto text-volt-ink shadow-lg">
            <QrCode className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-turf-soft text-turf-ink font-mono text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cámara HD Conectada</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
              Cancha 1 · Fútbol 5
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Estación Norte Fútbol · Belgrano, Buenos Aires
            </p>
          </div>

          {/* Current Live State Card */}
          <div className="p-5 rounded-2xl bg-surface border border-line text-left space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-ink-muted">ESTADO DE LA CANCHA</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                EN VIVO AHORA
              </span>
            </div>

            <p className="text-sm text-ink leading-relaxed font-medium">
              El partido de este turno se está grabando con cámara IP en 1080p a 60 fps. Podés ver la transmisión en vivo o marcar tus jugadas al instante.
            </p>

            <div className="pt-2 flex flex-col gap-2.5">
              <Link to={buildLiveStreamPath('cam-en-f5')} className="w-full">
                <Button variant="volt" size="lg" fullWidth>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Ver cancha en vivo</span>
                </Button>
              </Link>

              <Link
                to={buildSearchPath({
                  complexId: 'estacion-norte',
                  courtId: 'cancha-1',
                })}
                className="w-full"
              >
                <Button variant="secondary" size="md" fullWidth>
                  <Search className="w-4 h-4" />
                  <span>Buscar partido anterior de esta cancha</span>
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-xs text-ink-muted">
            ¿Tenés alguna duda con la cámara? Avisale al encargado de la sede en la recepción.
          </p>
        </div>
      </main>
    </div>
  );
};
