import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, LayoutGrid, TrendingUp, Wallet } from 'lucide-react';
import {
  OWNER_BENEFITS,
  OWNER_SECTION_COPY,
} from '../../data/landingContent';
import { OwnerBenefitItem } from '../../types/canchas';
import { Button } from '../ui/Button';

interface ComplexOwnersSectionProps {
  onOpenOwnerModal: () => void;
}

const OWNER_ICONS: Record<OwnerBenefitItem['iconName'], React.ReactNode> = {
  'trending-up': (
    <TrendingUp className="w-5 h-5 text-volt shrink-0" aria-hidden="true" />
  ),
  'layout-grid': (
    <LayoutGrid className="w-5 h-5 text-volt shrink-0" aria-hidden="true" />
  ),
  wallet: <Wallet className="w-5 h-5 text-volt shrink-0" aria-hidden="true" />,
  'bar-chart': (
    <BarChart3 className="w-5 h-5 text-volt shrink-0" aria-hidden="true" />
  ),
};

export const ComplexOwnersSection: React.FC<ComplexOwnersSectionProps> = ({
  onOpenOwnerModal,
}) => {
  return (
    <section
      id="para-complejos"
      className="py-16 sm:py-24 bg-pitch text-pitch-ink dark-focus scroll-mt-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1.35fr] gap-10 lg:gap-14 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-volt">
              {OWNER_SECTION_COPY.kicker}
            </p>
            <h2 className="mt-2.5 font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-pitch-ink leading-[1.06]">
              {OWNER_SECTION_COPY.headline}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-pitch-muted leading-relaxed max-w-lg">
              {OWNER_SECTION_COPY.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/panel-club">
                <Button variant="volt" size="lg">
                  Ver Panel de Administración
                </Button>
              </Link>
              <Button
                variant="darkSecondary"
                size="lg"
                onClick={onOpenOwnerModal}
              >
                Sumar mi complejo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {OWNER_BENEFITS.map((item) => (
              <article
                key={item.id}
                className="bg-pitch-surface border border-pitch-line rounded-xl p-5 sm:p-6 flex flex-col"
              >
                <div className="w-10 h-10 rounded-lg bg-pitch-elevated border border-pitch-line flex items-center justify-center">
                  {OWNER_ICONS[item.iconName]}
                </div>
                <h3 className="mt-4 font-display text-xl sm:text-2xl font-bold tracking-tight text-pitch-ink">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm text-pitch-muted leading-relaxed">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
