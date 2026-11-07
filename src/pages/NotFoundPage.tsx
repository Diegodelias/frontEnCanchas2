import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { BrandWordmark } from '../components/ui/BrandWordmark';
import { Button } from '../components/ui/Button';
import { ROUTES } from '../routes/paths';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center p-6 text-center">
      <Link to={ROUTES.HOME} className="mb-8">
        <BrandWordmark tone="light" />
      </Link>

      <div className="max-w-md bg-surface border border-line rounded-2xl p-8 sm:p-10 shadow-sm space-y-4">
        <span className="font-mono text-4xl sm:text-5xl font-extrabold text-turf tabular-nums">
          404
        </span>
        <h1 className="font-display text-3xl font-extrabold text-ink">
          Página no encontrada
        </h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          La jugada o el enlace que estás buscando no existe o fue movido.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={ROUTES.HOME} className="w-full sm:w-auto">
            <Button variant="volt" fullWidth>
              <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Volver a la página principal</span>
            </Button>
          </Link>
          <Link to={ROUTES.LIVE} className="w-full sm:w-auto">
            <Button variant="secondary" fullWidth>
              <span>Ver canchas en vivo</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
