import React from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import { NAV_LINKS } from '../../data/landingContent';
import { BrandWordmark } from '../ui/BrandWordmark';
import { Button } from '../ui/Button';

interface FinalCtaAndFooterProps {
  onFindCourtClick: () => void;
  onOwnerClick: () => void;
  onPlaceholderClick: (key: 'terminos' | 'privacidad' | 'contacto' | 'redes') => void;
}

export const FinalCtaAndFooter: React.FC<FinalCtaAndFooterProps> = ({
  onFindCourtClick,
  onOwnerClick,
  onPlaceholderClick,
}) => {
  const { name: siteName } = useSite();
  return (
    <>
      {/* Final Conversion CTA Band */}
      <section className="py-16 sm:py-20 bg-canvas">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-surface border border-line rounded-2xl p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-turf-ink">
                Armá el próximo partido
              </p>
              <h2 className="mt-2 font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-ink">
                Elegí horario y salí a jugar
              </h2>
              <p className="mt-3 text-sm sm:text-base text-ink-muted leading-relaxed">
                Consultá canchas libres en complejos cercanos o sumá tu club para
                recibir reservas ordenadas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center lg:items-stretch xl:items-center gap-3 shrink-0">
              <Button
                variant="volt"
                size="lg"
                className="w-full sm:w-auto lg:w-full xl:w-auto"
                onClick={onFindCourtClick}
              >
                Encontrá tu próxima cancha
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto lg:w-full xl:w-auto"
                onClick={onOwnerClick}
              >
                Soy dueño de un complejo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Footer (Strictly NO location selector) */}
      <footer className="bg-pitch text-pitch-ink dark-focus border-t border-pitch-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6 sm:gap-y-8 pb-8 sm:pb-10 border-b border-pitch-line">
            <div>
              <a href="#inicio" aria-label={`Volver arriba — ${siteName}`}>
                <BrandWordmark tone="dark" />
              </a>
              <p className="mt-3 text-sm text-pitch-muted leading-relaxed max-w-xs">
                Plataforma para descubrir complejos deportivos, consultar
                disponibilidad y reservar tu cancha de fútbol.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-pitch-muted">
                Explorar
              </h3>
              <ul className="mt-3 space-y-2.5 text-sm">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className="text-pitch-ink/90 hover:text-volt transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-pitch-ink/90 hover:text-volt transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
                <li>
                  <a
                    href="#preguntas-frecuentes"
                    className="text-pitch-ink/90 hover:text-volt transition-colors"
                  >
                    Preguntas frecuentes
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-pitch-muted">
                Contacto y comunidad
              </h3>
              <ul className="mt-3 space-y-2.5 text-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => onPlaceholderClick('contacto')}
                    className="text-pitch-ink/90 hover:text-volt transition-colors cursor-pointer"
                  >
                    Escribinos
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onPlaceholderClick('redes')}
                    className="text-pitch-ink/90 hover:text-volt transition-colors cursor-pointer"
                  >
                    Instagram
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onPlaceholderClick('redes')}
                    className="text-pitch-ink/90 hover:text-volt transition-colors cursor-pointer"
                  >
                    X / LinkedIn
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-pitch-muted">
                Legales
              </h3>
              <ul className="mt-3 space-y-2.5 text-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => onPlaceholderClick('terminos')}
                    className="text-pitch-ink/90 hover:text-volt transition-colors cursor-pointer"
                  >
                    Términos y condiciones
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onPlaceholderClick('privacidad')}
                    className="text-pitch-ink/90 hover:text-volt transition-colors cursor-pointer"
                  >
                    Política de privacidad
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-5 pt-1 text-center text-xs text-pitch-muted">
            <p>© 2026 {siteName}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  );
};
