import { bookingsApi, ScheduleDay } from '../../services/bookingsApi';
import { ApiCourt, clubsApi, CourtInput } from '../../services/clubsApi';
import { platformApi } from '../../services/platformApi';

/**
 * Lo que `CourtsManager` necesita para escribir canchas. Hay dos puertas con las mismas reglas: el admin de club
 * (siempre sobre su club) y el superadmin (sobre el club que elige). La pantalla es la misma para las dos.
 */
export interface CourtsApi {
  create: (input: CourtInput) => Promise<ApiCourt>;
  update: (id: string, patch: Partial<CourtInput> & { active?: boolean }) => Promise<ApiCourt>;
  remove: (id: string) => Promise<void>;
  /** Horario semanal de una cancha: se lee y se reemplaza completo. */
  loadSchedule: (courtId: string) => Promise<ScheduleDay[]>;
  saveSchedule: (courtId: string, days: ScheduleDay[]) => Promise<ScheduleDay[]>;
}

/** Las canchas del club del admin con sesión (`/api/club/courts`). */
export const ownClubCourtsApi: CourtsApi = {
  create: (input) => clubsApi.createCourt(input),
  update: (id, patch) => clubsApi.updateCourt(id, patch),
  remove: (id) => clubsApi.deleteCourt(id),
  loadSchedule: (courtId) => bookingsApi.fetchOwnSchedule(courtId),
  saveSchedule: (courtId, days) => bookingsApi.saveOwnSchedule(courtId, days),
};

/** Las canchas de un club elegido por el superadmin (`/api/platform/clubs/:clubId/courts`). */
export const platformCourtsApi = (clubId: string): CourtsApi => ({
  create: (input) => platformApi.createCourt(clubId, input),
  update: (id, patch) => platformApi.updateCourt(clubId, id, patch),
  remove: (id) => platformApi.deleteCourt(clubId, id),
  loadSchedule: (courtId) => bookingsApi.fetchPlatformSchedule(clubId, courtId),
  saveSchedule: (courtId, days) => bookingsApi.savePlatformSchedule(clubId, courtId, days),
});
