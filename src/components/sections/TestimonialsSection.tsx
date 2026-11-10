import React from 'react';
import { EXAMPLE_TESTIMONIALS } from '../../data/landingContent';

export const TestimonialsSection: React.FC = () => {
  return (
    <section
      id="testimonios"
      className="py-14 sm:py-20 bg-canvas border-b border-line scroll-mt-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-turf-ink">
            Experiencias de uso
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
            Así se vive cada turno
          </h2>
          <p className="mt-2 text-base text-ink-muted leading-relaxed">
            Testimonios de ejemplo, mientras sumamos opiniones reales.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {EXAMPLE_TESTIMONIALS.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between bg-surface border border-line rounded-xl p-6 sm:p-7"
            >
              <div>
                <p className="text-xs font-medium text-ink-muted">
                  {item.sportContext}
                </p>
                <span
                  aria-hidden="true"
                  className="mt-4 block font-display text-5xl leading-none text-turf/70"
                >
                  “
                </span>
                <blockquote className="-mt-1 text-base text-ink leading-relaxed">
                  “{item.quote}”
                </blockquote>
              </div>

              <footer className="mt-6 pt-4 border-t border-line">
                <p className="text-sm font-semibold text-ink">
                  {item.authorName}
                </p>
                <p className="text-xs text-ink-muted">{item.authorRole}</p>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
