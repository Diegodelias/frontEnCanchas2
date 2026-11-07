import { visualsForClub } from '../data/complexVisuals';
import { Complex, Court, DayAvailability, SportType } from '../types/canchas';
import { ApiClub, ApiCourt } from './clubsApi';

/** Orden en que se listan los deportes de un club. */
const SPORT_ORDER: SportType[] = ['Fútbol 5', 'Fútbol 7', 'Fútbol 8', 'Fútbol 11'];

/** Turnos que ofrece el modal de reserva: de 18:00 a 23:00, uno por hora. */
const FIRST_HOUR = 18;
const LAST_HOUR = 23;

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function dayLabel(prefix: string, date: Date): string {
  const weekday = date.toLocaleDateString('es-AR', { weekday: 'long' });
  return `${prefix} · ${capitalize(weekday)}`;
}

/**
 * Grilla fija de turnos de una cancha: hoy y mañana, de 18:00 a 23:00 cada hora, al precio de la cancha.
 * Es una simulación hasta que existan los horarios y las reservas reales: el precio es real, los horarios no.
 */
export function buildTurnGrid(courtId: string, price: number, now: Date = new Date()): DayAvailability[] {
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const days: { id: string; label: string }[] = [
    { id: 'hoy', label: dayLabel('Hoy', now) },
    { id: 'manana', label: dayLabel('Mañana', tomorrow) },
  ];
  return days.map((day) => ({
    id: day.id,
    label: day.label,
    slots: Array.from({ length: LAST_HOUR - FIRST_HOUR + 1 }, (_, i) => {
      const hour = String(FIRST_HOUR + i).padStart(2, '0');
      return { id: `${courtId}-${day.id}-${hour}00`, time: `${hour}:00`, price };
    }),
  }));
}

/** «2 canchas · Fútbol 5 y Fútbol 7» (con una sola cancha, «1 cancha · Fútbol 5»). */
export function summarizeCourts(courts: ApiCourt[], sports: SportType[]): string {
  const count = courts.length;
  const list = new Intl.ListFormat('es', { style: 'long', type: 'conjunction' }).format(sports);
  return `${count} ${count === 1 ? 'cancha' : 'canchas'} · ${list}`;
}

/** Arma el complejo que muestra la landing a partir de un club del listado público. */
export function toComplex(club: ApiClub, now: Date = new Date()): Complex {
  const sports = SPORT_ORDER.filter((sport) => club.courts.some((court) => court.sport === sport));
  const courts: Court[] = club.courts.map((court) => ({
    id: court.id,
    name: court.name,
    sport: court.sport,
    availabilityByDay: buildTurnGrid(court.id, court.price, now),
  }));
  const { imageUrl, visualVariant } = visualsForClub(club.id);

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
