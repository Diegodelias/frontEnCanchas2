import { MOCK_MATCHES } from '../data/mockMatches';
import { Match, MatchFilterParams } from '../types/match';

const SIMULATED_LATENCY_MS = 120;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const matchesService = {
  /**
   * Obtiene la lista de partidos con filtros opcionales.
   */
  async getMatches(params?: MatchFilterParams): Promise<Match[]> {
    await sleep(SIMULATED_LATENCY_MS);

    if (!params) return [...MOCK_MATCHES];

    return MOCK_MATCHES.filter((m) => {
      if (params.clubId && m.clubId !== params.clubId) return false;
      if (params.courtId && m.courtId !== params.courtId) return false;
      if (params.dayId && m.dayId !== params.dayId) return false;
      if (params.slotId && !params.slotId.includes(m.timeSlot.replace(':', '')) && m.timeSlot !== params.slotId) {
        return false;
      }
      return true;
    });
  },

  /**
   * Obtiene un partido por su ID.
   */
  async getMatchById(id: string): Promise<Match | null> {
    await sleep(SIMULATED_LATENCY_MS);
    const found = MOCK_MATCHES.find((m) => m.id === id);
    return found ? { ...found } : null;
  },

  /**
   * Busca el partido correspondiente a una selección de cascada.
   */
  async findMatchBySelection(
    clubId: string,
    courtId?: string,
    dayId?: string,
    timeSlot?: string
  ): Promise<Match | null> {
    await sleep(SIMULATED_LATENCY_MS);

    const matches = MOCK_MATCHES.filter((m) => m.clubId === clubId);
    if (matches.length === 0) return null;

    if (courtId) {
      const byCourt = matches.filter((m) => m.courtId === courtId);
      if (byCourt.length > 0) {
        if (dayId) {
          const byDay = byCourt.filter((m) => m.dayId === dayId);
          if (byDay.length > 0) {
            if (timeSlot) {
              const bySlot = byDay.find(
                (m) => m.timeSlot === timeSlot || timeSlot.includes(m.timeSlot.replace(':', ''))
              );
              if (bySlot) return { ...bySlot };
            }
            return { ...byDay[0] };
          }
        }
        return { ...byCourt[0] };
      }
    }

    return { ...matches[0] };
  },

  /**
   * Obtiene los partidos guardados según una lista de IDs.
   */
  async getSavedMatches(ids: string[]): Promise<Match[]> {
    await sleep(SIMULATED_LATENCY_MS);
    return MOCK_MATCHES.filter((m) => ids.includes(m.id));
  },
};
