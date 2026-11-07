import React from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  MapPin,
  Receipt,
  Zap,
} from 'lucide-react';
import { PLAYER_BENEFITS } from '../../data/landingContent';
import { BenefitItem } from '../../types/canchas';
import { Button } from '../ui/Button';

interface PlayerBenefitsSectionProps {
  onPrimaryCta: () => void;
}

const BENEFIT_ICONS: Record<BenefitItem['iconName'], React.ReactNode> = {
  'calendar-check': (
    <CalendarCheck className="w-5 h-5 text-turf shrink-0" aria-hidden="true" />
  ),
  zap: <Zap className="w-5 h-5 text-turf shrink-0" aria-hidden="true" />,
  receipt: (
    <Receipt className="w-5 h-5 text-turf shrink-0" aria-hidden="true" />
  ),
  'map-pin': (
    <MapPin className="w-5 h-5 text-turf shrink-0" aria-hidden="true" />
  ),
  'check-circle': (
    <CheckCircle2 className="w-5 h-5 text-turf shrink-0" aria-hidden="true" />
  ),
};

export const PlayerBenefitsSection: React.FC<PlayerBenefitsSectionProps> = ({
  onPrimaryCta,
}) => {
  return (
    <section
      id="beneficios"
      className="py-14 sm:py-20 bg-canvas border-b border-line scroll-mt-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.45fr] gap-10 lg:gap-16 items-start">
          {/* Left Editorial Column - Posición estática en el flujo natural */}
          <div className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-widest text-turf-ink">
              Para quienes juegan
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-ink">
              Todo claro antes de salir a jugar
            </h2>
            <p className="mt-3 text-sm sm:text-base text-ink-muted leading-relaxed max-w-md">
              Pensado para que organizar el partido con tu grupo sea simple,
              directo y sin idas y vueltas.
            </p>

            <div className="mt-6">
              <Button variant="volt" size="lg" onClick={onPrimaryCta}>
                Reservá tu cancha
              </Button>
            </div>
          </div>

          {/* Right Hairline-Separated Benefits List */}
          <div className="divide-y divide-line border-t border-b border-line bg-surface rounded-xl px-5 sm:px-7">
            {PLAYER_BENEFITS.map((benefit) => (
              <div
                key={benefit.id}
                className="py-5 sm:py-6 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-turf-soft flex items-center justify-center shrink-0 mt-0.5">
                  {BENEFIT_ICONS[benefit.iconName]}
                </div>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-ink">
                    {benefit.title}
                  </h3>
                  <p className="mt-1 text-sm sm:text-base text-ink-muted leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
