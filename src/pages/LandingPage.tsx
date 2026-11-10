import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BookingModal } from '../components/modals/BookingModal';
import { ClubCourtsModal } from '../components/modals/ClubCourtsModal';
import { OwnerInquiryModal } from '../components/modals/OwnerInquiryModal';
import { PlaceholderInfoModal } from '../components/modals/PlaceholderInfoModal';
import { ComplexOwnersSection } from '../components/sections/ComplexOwnersSection';
import { FaqSection } from '../components/sections/FaqSection';
import {
  FeaturedComplexesSection,
  SportFilterOption,
} from '../components/sections/FeaturedComplexesSection';
import { FinalCtaAndFooter } from '../components/sections/FinalCtaAndFooter';
import { AppHeader } from '../components/layout/AppHeader';
import { HeroSearchSection } from '../components/sections/HeroSearchSection';
import { HowItWorksSection } from '../components/sections/HowItWorksSection';
import { PlayerBenefitsSection } from '../components/sections/PlayerBenefitsSection';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { PLACEHOLDER_MODALS } from '../data/landingContent';
import { CITIES } from '../data/cities';
import { useClubsPage } from '../hooks/useClubsPage';
import { Complex, PlaceholderModalInfo, SearchSelection, SportType } from '../types/canchas';

export const LandingPage: React.FC = () => {
  const location = useLocation();
  const [selectedCityId, setSelectedCityId] = useState<string>(
    CITIES[0]?.id ?? 'buenos-aires'
  );
  const [sportFilter, setSportFilter] = useState<SportFilterOption>('Todos');
  const [activeSearch, setActiveSearch] = useState<SearchSelection | null>(null);
  const [page, setPage] = useState<number>(1);

  // Los clubes llegan ya filtrados por ciudad y deporte y paginados desde el backend.
  const { complexes, totalPages, status, reload } = useClubsPage({
    page,
    city: selectedCityId,
    sport: sportFilter === 'Todos' ? undefined : (sportFilter as SportType),
  });

  const [courtsComplex, setCourtsComplex] = useState<Complex | null>(null);
  const [bookingComplex, setBookingComplex] = useState<Complex | null>(null);
  const [bookingCourtId, setBookingCourtId] = useState<string | null>(null);
  const [ownerModalOpen, setOwnerModalOpen] = useState<boolean>(false);
  const [placeholderModal, setPlaceholderModal] =
    useState<PlaceholderModalInfo | null>(null);

  const activeCity = useMemo(
    () => CITIES.find((c) => c.id === selectedCityId) ?? CITIES[0],
    [selectedCityId]
  );

  const visibleComplexes = useMemo(
    () => (activeSearch ? complexes.filter((c) => c.id === activeSearch.complexId) : complexes),
    [complexes, activeSearch]
  );

  // Si la página pedida quedó fuera de rango (por ejemplo, porque se borraron canchas), se vuelve a la última.
  useEffect(() => {
    if (status === 'ready' && complexes.length === 0 && totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [status, complexes.length, totalPages, page]);

  // Selección con la que abre el modal de reserva: la cancha elegida en «Ver canchas» o la del buscador.
  // Se memoiza porque el modal reinicia su formulario cada vez que cambia esta referencia.
  const bookingInitialSelection = useMemo<Partial<SearchSelection> | undefined>(() => {
    if (bookingCourtId) return { courtId: bookingCourtId };
    if (activeSearch && bookingComplex?.id === activeSearch.complexId) return activeSearch;
    return undefined;
  }, [bookingCourtId, activeSearch, bookingComplex]);

  const scrollToElement = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      el.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  };

  // If arriving at /#complejos or other hash, scroll smoothly to it
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        scrollToElement(id);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  const handleCityChange = (nextCityId: string) => {
    setSelectedCityId(nextCityId);
    setActiveSearch(null);
    setSportFilter('Todos');
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      {/* 1. Header */}
      <AppHeader
        cities={CITIES}
        selectedCityId={selectedCityId}
        onSelectCity={handleCityChange}
        sectionLinks={[
          { label: 'Complejos', href: '#complejos' },
          { label: 'Para complejos', href: '#para-complejos' },
        ]}
        cta={{
          label: 'Ver mi partido',
          compactLabel: 'Ver partido',
          onClick: () => scrollToElement('buscador'),
        }}
      />

      <main className="flex-1">
        {/* 2. Hero + Buscador en cascada integrado */}
        <HeroSearchSection
          activeCityName={activeCity?.name ?? 'Buenos Aires'}
        />

        {/* 3. Complejos destacados */}
        <FeaturedComplexesSection
          complexes={visibleComplexes}
          activeCityName={activeCity?.name ?? 'Buenos Aires'}
          sportFilter={sportFilter}
          onSportFilterChange={(tab) => {
            setSportFilter(tab);
            setPage(1);
          }}
          activeSearch={activeSearch}
          onClearSearch={() => setActiveSearch(null)}
          onResetToDefaultCity={() => {
            setSelectedCityId('buenos-aires');
            setActiveSearch(null);
            setSportFilter('Todos');
            setPage(1);
          }}
          onOpenOwnerModal={() => setOwnerModalOpen(true)}
          onOpenBooking={(complex) => {
            setBookingCourtId(null);
            setBookingComplex(complex);
          }}
          onOpenCourts={(complex) => setCourtsComplex(complex)}
          page={page}
          totalPages={totalPages}
          onPageChange={(next) => {
            setPage(next);
            scrollToElement('complejos');
          }}
          isLoading={status === 'loading'}
          loadError={status === 'error'}
          onRetry={reload}
        />

        {/* 4. Cómo funciona */}
        <HowItWorksSection onPrimaryCta={() => scrollToElement('complejos')} />

        {/* 5. Beneficios para jugadores */}
        <PlayerBenefitsSection onPrimaryCta={() => scrollToElement('complejos')} />

        {/* 6. Para complejos deportivos */}
        <ComplexOwnersSection onOpenOwnerModal={() => setOwnerModalOpen(true)} />

        {/* 7. Testimonios */}
        <TestimonialsSection />

        {/* 8. FAQ */}
        <FaqSection />
      </main>

      {/* 9. Final CTA y Footer */}
      <FinalCtaAndFooter
        onFindCourtClick={() => scrollToElement('complejos')}
        onOwnerClick={() => setOwnerModalOpen(true)}
        onPlaceholderClick={(key) =>
          setPlaceholderModal(PLACEHOLDER_MODALS[key])
        }
      />

      {/* Modales */}
      <ClubCourtsModal
        complex={courtsComplex}
        onClose={() => setCourtsComplex(null)}
        onViewSchedule={(complex, courtId) => {
          setCourtsComplex(null);
          setBookingCourtId(courtId);
          setBookingComplex(complex);
        }}
      />

      <BookingModal
        complex={bookingComplex}
        initialSelection={bookingInitialSelection}
        onClose={() => {
          setBookingComplex(null);
          setBookingCourtId(null);
        }}
      />

      <OwnerInquiryModal
        isOpen={ownerModalOpen}
        onClose={() => setOwnerModalOpen(false)}
      />

      <PlaceholderInfoModal
        info={placeholderModal}
        onClose={() => setPlaceholderModal(null)}
      />
    </div>
  );
};
