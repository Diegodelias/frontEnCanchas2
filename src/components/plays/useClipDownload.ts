import { useCallback, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { playsApi } from '../../services/playsApi';
import { SavedPlay } from '../../types/play';

/**
 * Por qué una jugada no se puede descargar, o null si se puede: una jugada en vivo no tiene grabación y una
 * jugada cuya grabación ya no existe (o todavía no tiene video) no tiene de dónde cortar el fragmento.
 */
export function playDownloadBlock(play: SavedPlay): string | null {
  if (play.isLiveMoment) return 'Las jugadas en vivo no se pueden descargar: no hay una grabación.';
  if (play.recordingUnavailable) return 'La grabación de esta jugada no está disponible.';
  return null;
}

/**
 * Descarga del fragmento de una jugada: el servidor corta el video (puede tardar unos segundos), así que se avisa
 * que está preparando y, si falla (servidor ocupado, corte demasiado largo), se muestra su mensaje y se puede reintentar.
 */
export function useClipDownload() {
  const { showToast } = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const download = useCallback(
    async (play: SavedPlay) => {
      if (downloadingId) return;
      const blocked = playDownloadBlock(play);
      if (blocked) {
        showToast({ type: 'info', title: 'No se puede descargar', message: blocked, durationMs: 4000 });
        return;
      }
      setDownloadingId(play.id);
      showToast({
        type: 'info',
        title: 'Preparando el fragmento',
        message: `Estamos cortando "${play.title}". Puede tardar unos segundos.`,
        durationMs: 3500,
      });
      try {
        const fileName = await playsApi.downloadClip(play.id);
        showToast({ type: 'success', title: 'Descarga lista', message: fileName, durationMs: 3500 });
      } catch (err) {
        showToast({
          type: 'error',
          title: 'No pudimos descargar el fragmento',
          message: err instanceof Error ? err.message : 'Probá de nuevo en un momento.',
          durationMs: 5000,
        });
      } finally {
        setDownloadingId(null);
      }
    },
    [downloadingId, showToast]
  );

  return { downloadingId, download };
}
