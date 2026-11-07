import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookingModal } from '../components/modals/BookingModal';
import { OwnerInquiryModal } from '../components/modals/OwnerInquiryModal';
import { PlaceholderInfoModal } from '../components/modals/PlaceholderInfoModal';
import { ComplexOwnersSection } from '../components/sections/ComplexOwnersSection';
import { FaqSection } from '../components/sections/FaqSection';
import {
  FeaturedComplexesSection,
  SportFilterOption,
} from '../components/sections/FeaturedComplexesSection';
import { FinalCtaAndFooter } from '../components/sections/FinalCtaAndFooter';
import { Header } from '../components/sections/Header';
import { HeroSearchSection } from '../components/sections/HeroSearchSection';
import { HowItWorksSection } from '../components/sections/HowItWorksSection';
import { PlayerBenefitsSection } from '../components/sections/PlayerBenefitsSection';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { PLACEHOLDER_MODALS } from '../data/landingContent';
import { MOCK_CITIES } from '../data/mockComplexes';
import { useComplexes } from '../context/ComplexesContext';
import { ROUTES } from '../routes/paths';
import { Complex, PlaceholderModalInfo, SearchSelection } from '../types/canchas';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { complexes } = useComplexes();

  const [selectedCityId, setSelectedCityId] = useState<string>(
    MOCK_CITIES[0]?.id ?? 'buenos-aires'
  );
  const [sportFilter, setSportFilter] = useState<SportFilterOption>('Todos');
  const [activeSearch, setActiveSearch] = useState<SearchSelection | null>(null);
  const [isLoadingComplexes, setIsLoadingComplexes] = useState<boolean>(false);

  const [bookingComplex, setBookingComplex] = useState<Complex | null>(null);
  const [ownerModalOpen, setOwnerModalOpen] = useState<boolean>(false);
  const [placeholderModal, setPlaceholderModal] =
    useState<PlaceholderModalInfo | null>(null);

  const activeCity = useMemo(
    () => MOCK_CITIES.find((c) => c.id === selectedCityId) ?? MOCK_CITIES[0],
    [selectedCityId]
  );

  const cityComplexes = useMemo(
    () => complexes.filter((c) => c.city === selectedCityId),
    [complexes, selectedCityId]
  );

  const visibleComplexes = useMemo(() => {
    if (activeSearch) {
      return cityComplexes.filter((c) => c.id === activeSearch.complexId);
    }
    if (sportFilter === 'Todos') {
      return cityComplexes;
    }
    return cityComplexes.filter((c) => c.sports.includes(sportFilter));
  }, [cityComplexes, activeSearch, sportFilter]);

  const scrollToElement = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      {/* 1. Header */}
      <Header
        cities={MOCK_CITIES}
        selectedCityId={selectedCityId}
        onSelectCity={handleCityChange}
        onReserveNowClick={() => scrollToElement('complejos')}
      />

      <main className="flex-1">
        {/* 2. Hero + Buscador en cascada integrado */}
        <HeroSearchSection
          activeCityName={activeCity?.name ?? 'Buenos Aires'}
          onPrimaryCta={() => navigate(ROUTES.SEARCH)}
          onLiveCta={() => navigate(ROUTES.LIVE)}
          onReserveCta={() => scrollToElement('complejos')}
          onOwnerCta={() => setOwnerModalOpen(true)}
        />

        {/* 3. Complejos destacados */}
        <FeaturedComplexesSection
          complexes={visibleComplexes}
          activeCityName={activeCity?.name ?? 'Buenos Aires'}
          sportFilter={sportFilter}
          onSportFilterChange={(tab) => setSportFilter(tab)}
          activeSearch={activeSearch}
          onClearSearch={() => setActiveSearch(null)}
          onResetToDefaultCity={() => {
            setSelectedCityId('buenos-aires');
            setActiveSearch(null);
            setSportFilter('Todos');
          }}
          onOpenOwnerModal={() => setOwnerModalOpen(true)}
          onOpenBooking={(complex) => setBookingComplex(complex)}
          isLoading={isLoadingComplexes}
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
      <BookingModal
        complex={bookingComplex}
        initialSelection={
          activeSearch && bookingComplex?.id === activeSearch.complexId
            ? activeSearch
            : undefined
        }
        onClose={() => setBookingComplex(null)}
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
