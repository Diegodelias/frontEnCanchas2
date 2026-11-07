import React, { useState } from 'react';
import { HOW_IT_WORKS_STEPS } from '../../data/landingContent';
import { Button } from '../ui/Button';

interface HowItWorksSectionProps {
  onPrimaryCta: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  onPrimaryCta,
}) => {
  return (
    <section
      id="como-funciona"
      className="py-14 sm:py-20 bg-surface border-b border-line scroll-mt-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-turf-ink">
              Cómo funciona
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-ink">
              De la idea a la cancha en tres pasos
            </h2>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={onPrimaryCta}
            className="self-start md:self-auto"
          >
            Reservá tu cancha
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7 divide-y sm:divide-y-0 lg:divide-x divide-line border-t border-b border-line">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <article
              key={step.number}
              className="py-8 sm:py-9 sm:px-5 lg:px-7 first:sm:pl-0 last:sm:pr-0 flex flex-col"
            >
              <StepImage src={step.imageSrc} alt={step.imageAlt} />

              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-3xl font-extrabold text-turf tabular-nums">
                  {step.number}
                </span>
                <h3 className="font-display text-2xl font-bold tracking-tight text-ink">
                  {step.title}
                </h3>
              </div>

              <p className="mt-2.5 text-sm sm:text-base text-ink-muted leading-relaxed">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const StepImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-pitch border border-pitch-line/80 shadow-md group transition-all duration-200 hover:border-volt/40">
      {failed ? (
        <div
          aria-hidden="true"
          className="w-full h-full"
          style={{
            background:
              'radial-gradient(ellipse 75% 70% at 50% 35%, var(--c3-pitch-elevated) 0%, var(--c3-pitch) 78%)',
          }}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          width={1200}
          height={675}
          onError={() => setFailed(true)}
          className="how-it-works-photo w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      )}
    </div>
  );
};
