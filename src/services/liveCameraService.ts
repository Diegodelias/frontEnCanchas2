import { MOCK_LIVE_CAMERAS } from '../data/mockLiveCameras';
import { LiveCamera } from '../types/liveCamera';

const SIMULATED_LATENCY_MS = 120;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const liveCameraService = {
  /**
   * Obtiene la lista completa de cámaras en vivo mockeadas.
   */
  async getLiveCameras(): Promise<LiveCamera[]> {
    await sleep(SIMULATED_LATENCY_MS);
    return [...MOCK_LIVE_CAMERAS];
  },

  /**
   * Obtiene una cámara específica por ID.
   */
  async getLiveCameraById(id: string): Promise<LiveCamera | null> {
    await sleep(SIMULATED_LATENCY_MS);
    const camera = MOCK_LIVE_CAMERAS.find((c) => c.id === id);
    return camera ? { ...camera } : null;
  },

  /**
   * Obtiene la cámara destacada para la landing page (estado 'live').
   */
  async getFeaturedLiveCamera(): Promise<LiveCamera | null> {
    await sleep(SIMULATED_LATENCY_MS);
    const camera = MOCK_LIVE_CAMERAS.find((c) => c.status === 'live') || MOCK_LIVE_CAMERAS[0];
    return camera ? { ...camera } : null;
  },
};
