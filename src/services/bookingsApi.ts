import { request } from './clubsApi';

/** Un turno: `startsAt` es el instante de inicio (es lo que se manda para reservar) y `time` la hora en Argentina. */
export interface ApiSlot {
  startsAt: string;
  time: string;
}

export interface ApiSlotsResponse {
  court: { id: string; name: string; price: number };
  date: string;
  /** Turnos libres. */
  slots: ApiSlot[];
  /** Turnos que se ofrecerían pero ya están reservados: solo el horario, sin datos de quien reservó. */
  booked: ApiSlot[];
}

/** Datos para reservar. Con sesión de jugador alcanza el turno; un invitado manda nombre y mail (teléfono opcional). */
export interface BookingInput {
  startsAt: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface ApiBooking {
  id: string;
  club: { id: string; name: string };
  court: { id: string; name: string };
  startsAt: string;
  date: string;
  time: string;
  price: number;
  name: string;
  email: string;
}

export interface CreatedBooking {
  booking: ApiBooking;
  /** false si el mail de confirmación no se pudo enviar: la reserva quedó guardada igual. */
  emailSent: boolean;
}

/** Un día del horario semanal de una cancha: `weekday` de 1 (lunes) a 7 (domingo), horas enteras de 0 a 24. */
export interface ScheduleDay {
  weekday: number;
  startHour: number;
  endHour: number;
}

/** Una reserva en la lista del club. */
export interface ApiBookingListItem {
  id: string;
  startsAt: string;
  date: string;
  time: string;
  court: { id: string; name: string };
  name: string;
  email: string;
  phone: string | null;
  price: number;
  fromPlayer: boolean;
}

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });
const enc = encodeURIComponent;

/** Turnos libres y reservas (público) y horarios y lista de reservas (panel del club y de la plataforma). */
export const bookingsApi = {
  /** Turnos libres de una cancha en un día (`AAAA-MM-DD`, hora de Argentina). Público. */
  async fetchSlots(courtId: string, date: string): Promise<ApiSlotsResponse> {
    const res = await request(`/api/courts/${enc(courtId)}/slots?date=${enc(date)}`);
    return (await res.json()) as ApiSlotsResponse;
  },

  /** Reserva un turno. Falla con `slot_taken` (409) si otra persona lo tomó antes. */
  async createBooking(courtId: string, input: BookingInput): Promise<CreatedBooking> {
    const res = await request(`/api/courts/${enc(courtId)}/bookings`, { method: 'POST', ...json(input) });
    return (await res.json()) as CreatedBooking;
  },

  async fetchOwnSchedule(courtId: string): Promise<ScheduleDay[]> {
    const res = await request(`/api/club/courts/${enc(courtId)}/schedule`);
    return ((await res.json()) as { days: ScheduleDay[] }).days;
  },

  async saveOwnSchedule(courtId: string, days: ScheduleDay[]): Promise<ScheduleDay[]> {
    const res = await request(`/api/club/courts/${enc(courtId)}/schedule`, { method: 'PUT', ...json({ days }) });
    return ((await res.json()) as { days: ScheduleDay[] }).days;
  },

  async fetchOwnBookings(): Promise<ApiBookingListItem[]> {
    const res = await request('/api/club/bookings');
    return ((await res.json()) as { bookings: ApiBookingListItem[] }).bookings;
  },

  async fetchPlatformSchedule(clubId: string, courtId: string): Promise<ScheduleDay[]> {
    const res = await request(`/api/platform/clubs/${enc(clubId)}/courts/${enc(courtId)}/schedule`);
    return ((await res.json()) as { days: ScheduleDay[] }).days;
  },

  async savePlatformSchedule(clubId: string, courtId: string, days: ScheduleDay[]): Promise<ScheduleDay[]> {
    const res = await request(`/api/platform/clubs/${enc(clubId)}/courts/${enc(courtId)}/schedule`, {
      method: 'PUT',
      ...json({ days }),
    });
    return ((await res.json()) as { days: ScheduleDay[] }).days;
  },

  async fetchPlatformBookings(clubId: string): Promise<ApiBookingListItem[]> {
    const res = await request(`/api/platform/clubs/${enc(clubId)}/bookings`);
    return ((await res.json()) as { bookings: ApiBookingListItem[] }).bookings;
  },

  /** Elimina de forma definitiva una reserva del propio club (admin de club): el turno queda libre al instante. */
  async deleteOwnBooking(bookingId: string): Promise<void> {
    await request(`/api/club/bookings/${enc(bookingId)}`, { method: 'DELETE' });
  },

  /** Elimina de forma definitiva una reserva de un club (superadmin): el turno queda libre al instante. */
  async deletePlatformBooking(clubId: string, bookingId: string): Promise<void> {
    await request(`/api/platform/clubs/${enc(clubId)}/bookings/${enc(bookingId)}`, { method: 'DELETE' });
  },
};
