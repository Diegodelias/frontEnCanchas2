export type SportType = 'Fútbol 5' | 'Fútbol 7' | 'Fútbol 8' | 'Fútbol 11';

export type CourtVisualVariant =
  | 'soccer-turf'
  | 'indoor-pitch'
  | 'multi-pitch'
  | 'rooftop-pitch'
  | 'clubhouse-turf'
  | 'night-stadium';

export interface Court {
  id: string;
  name: string;
  sport: SportType;
  /** Precio por turno de la cancha, en pesos. */
  price: number;
}

export interface Complex {
  id: string;
  name: string;
  zone: string;
  city: string;
  address: string;
  /** Deportes de sus canchas activas. */
  sports: SportType[];
  /** Precio de su cancha activa más barata. */
  minPrice: number;
  /** «2 canchas · Fútbol 5 y Fútbol 7», calculado de sus canchas activas. */
  availabilitySummary: string;
  imageUrl?: string;
  visualVariant: CourtVisualVariant;
  courts: Court[];
}

export interface SearchSelection {
  complexId: string;
  courtId: string;
}

export interface CityOption {
  id: string;
  name: string;
  region: string;
  hasActiveComplexes: boolean;
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

export interface BenefitItem {
  id: string;
  title: string;
  description: string;
  iconName: 'calendar-check' | 'zap' | 'receipt' | 'map-pin' | 'check-circle';
}

export interface OwnerBenefitItem {
  id: string;
  title: string;
  description: string;
  iconName: 'trending-up' | 'layout-grid' | 'wallet' | 'bar-chart';
}

export interface TestimonialItem {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  sportContext: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface PlaceholderModalInfo {
  title: string;
  subtitle: string;
  description: string;
  actionLabel?: string;
}
