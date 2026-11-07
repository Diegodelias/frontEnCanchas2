import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { MOCK_LIVE_CAMERAS } from '../../data/mockLiveCameras';
import { ROUTES } from '../../routes/paths';
import { Complex, SearchSelection, SportType } from '../../types/canchas';
import { LiveCourtCard } from '../live/LiveCourtCard';
import { Button } from '../ui/Button';
import { ComplexCard } from '../ui/ComplexCard';
import { ComplexCardSkeleton } from '../ui/ComplexCardSkeleton';

export type SportFilterOption = 'Todos' | SportType;

interface FeaturedComplexesSectionProps {
  complexes: Complex[];
  activeCityName: string;
  sportFilter: SportFilterOption;
  onSportFilterChange: (filter: SportFilterOption) => void;
  activeSearch: SearchSelection | null;
  onClearSearch: () => void;
  onResetToDefaultCity: () => void;
  onOpenOwnerModal: () => void;
  onOpenBooking: (complex: Complex, mode: 'schedule' | 'book') => void;
  isLoading: boolean;
}

const SPORT_TABS: SportFilterOption[] = [
  'Todos',
  'Fútbol 5',
  'Fútbol 7',
  'Fútbol 8',
];

export const FeaturedComplexesSection: React.FC<
  FeaturedComplexesSectionProps
> = ({
  complexes,
  activeCityName,
  sportFilter,
  onSportFilterChange,
  activeSearch,
  onClearSearch,
  onResetToDefaultCity,
  onOpenOwnerModal,
  onOpenBooking,
  isLoading,
}) => {
  const featuredLiveCamera =
    MOCK_LIVE_CAMERAS.find((c) => c.status === 'live') || MOCK_LIVE_CAMERAS[0];

  const buildMatchedHint = (complex: Complex): string | undefined => {
    if (!activeSearch || activeSearch.complexId !== complex.id) return undefined;

    const court = complex.courts.find((c) => c.id === activeSearch.courtId);
    const day = court?.availabilityByDay.find(
      (d) => d.id === activeSearch.dayId
    );
    const slot = day?.slots.find((s) => s.id === activeSearch.slotId);

    if (court && day && slot) {
      return `Turno seleccionado: ${court.name} · ${day.label} ${slot.time} hs`;
    }
    if (court && day) {
      return `Consulta: ${court.name} · ${day.label}`;
    }
    if (court) {
      return `Cancha seleccionada: ${court.name}`;
    }
    return 'Complejo seleccionado en tu búsqueda';
  };

  return (
    <section
      id="complejos"
      className="py-14 sm:py-20 bg-canvas border-b border-line scroll-mt-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-turf-ink">
              Complejos destacados · {activeCityName}
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-ink">
              Elegí cancha cerca tuyo
            </h2>
            <p className="mt-2 text-sm sm:text-base text-ink-muted max-w-xl">
              Explorá clubes disponibles, compará precios por turno y reservá en
              pocos clics.
            </p>
          </div>

          {/* Interactive Sport Filter Segmented Control */}
          <div
            role="group"
            aria-label="Filtrar complejos por modalidad"
            className="inline-flex items-center p-1 rounded-lg bg-surface-muted border border-line self-start md:self-auto max-w-full overflow-x-auto"
          >
            {SPORT_TABS.map((tab) => {
              const active = sportFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onSportFilterChange(tab)}
                  aria-pressed={active}
                  className={`min-h-[38px] px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-surface text-ink shadow-xs'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Search Filter Banner */}
        {activeSearch && (
          <div className="mt-6 p-3.5 sm:px-4 rounded-xl bg-surface border border-line flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-ink">
              Mostrando resultado filtrado desde el buscador.
            </p>
            <button
              type="button"
              onClick={onClearSearch}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-turf-ink hover:underline underline-offset-4 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Ver todos los complejos</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton Grid */}
        {isLoading ? (
          <div
            className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            aria-label="Cargando complejos disponibles"
          >
            <ComplexCardSkeleton />
            <ComplexCardSkeleton />
            <ComplexCardSkeleton />
          </div>
        ) : complexes.length === 0 ? (
          /* Empty State when city has no active complexes yet */
          <div className="mt-8 p-8 sm:p-10 rounded-xl bg-surface border border-line text-center max-w-2xl mx-auto">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink">
              Todavía no sumamos complejos en {activeCityName}
            </h3>
            <p className="mt-2.5 text-sm sm:text-base text-ink-muted leading-relaxed">
              Actualmente los complejos de ejemplo están cargados en Buenos Aires.
              Podés volver a Buenos Aires para probar reservas o postular tu club.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="volt" onClick={onResetToDefaultCity}>
                Ver complejos en Buenos Aires
              </Button>
              <Button variant="secondary" onClick={onOpenOwnerModal}>
                Soy dueño de un complejo
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complexes.map((complex) => (
              <ComplexCard
                key={complex.id}
                complex={complex}
                matchedHint={buildMatchedHint(complex)}
                onOpenBooking={onOpenBooking}
              />
            ))}
          </div>
        )}

        {/* Acceso secundario claramente diferenciado: Mirá la cancha en vivo */}
        {featuredLiveCamera && (
          <div className="mt-16 pt-12 border-t border-line">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-turf-ink mb-1">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" aria-hidden="true" />
                  <span>Transmisión en tiempo real</span>
                </div>
                <h3 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-ink">
                  Mirá la cancha en vivo
                </h3>
                <p className="mt-1 text-sm text-ink-muted max-w-xl">
                  Conectate directamente a la cámara para ver el estado de la cancha y los partidos que se están jugando ahora.
                </p>
              </div>

              <Link
                to={ROUTES.LIVE}
                className="text-xs sm:text-sm font-semibold text-turf hover:text-turf-hover transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                Ver todas las cámaras ({MOCK_LIVE_CAMERAS.length}) →
              </Link>
            </div>

            <div className="max-w-md">
              <LiveCourtCard camera={featuredLiveCamera} featuredBanner />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
