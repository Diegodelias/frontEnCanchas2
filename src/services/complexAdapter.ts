import { visualsForClub } from '../data/complexVisuals';
import { Complex, Court, SportType } from '../types/canchas';
import { ApiClub, ApiCourt } from './clubsApi';

/** Orden en que se listan los deportes de un club. */
const SPORT_ORDER: SportType[] = ['Fútbol 5', 'Fútbol 7', 'Fútbol 8', 'Fútbol 11'];

/** «2 canchas · Fútbol 5 y Fútbol 7» (con una sola cancha, «1 cancha · Fútbol 5»). */
export function summarizeCourts(courts: ApiCourt[], sports: SportType[]): string {
  const count = courts.length;
  const list = new Intl.ListFormat('es', { style: 'long', type: 'conjunction' }).format(sports);
  return `${count} ${count === 1 ? 'cancha' : 'canchas'} · ${list}`;
}

/** Arma el complejo que muestra la landing a partir de un club del listado público. */
export function toComplex(club: ApiClub): Complex {
  const sports = SPORT_ORDER.filter((sport) => club.courts.some((court) => court.sport === sport));
  const courts: Court[] = club.courts.map((court) => ({
    id: court.id,
    name: court.name,
    sport: court.sport,
    price: court.price,
  }));
  const visuals = visualsForClub(club.id);
  // La imagen propia del club, si la trae, va antes que la de siempre; sin ninguna, la tarjeta usa el placeholder.
  const imageUrl = club.imageUrl ?? visuals.imageUrl;
  const { visualVariant } = visuals;

  return {
    id: club.id,
    name: club.name,
    zone: club.zone,
    city: club.city,
    address: club.address,
    sports,
    minPrice: Math.min(...club.courts.map((court) => court.price)),
    availabilitySummary: summarizeCourts(club.courts, sports),
    imageUrl,
    visualVariant,
    courts,
  };
}
