import { useCallback } from 'react';
import { usePlays } from '../context/PlaysContext';
import { useToast } from '../context/ToastContext';

/**
 * Lo que sigue después de que un jugador ingresa, sea con el link del mail o con el código: guarda en su cuenta
 * la jugada que dejó pendiente como invitado (si hay) y avisa el resultado con un aviso en pantalla.
 */
export function useAfterPlayerLogin(): () => Promise<void> {
  const { resumePendingPlay } = usePlays();
  const { showToast } = useToast();

  return useCallback(async () => {
    const resumed = await resumePendingPlay();
    if (resumed.status === 'saved') {
      showToast({
        type: 'success',
        title: 'Jugada guardada',
        message: `Guardamos «${resumed.title}» en tu perfil.`,
        durationMs: 4500,
      });
    } else if (resumed.status === 'limit' || resumed.status === 'error') {
      showToast({
        type: 'error',
        title: 'No pudimos guardar la jugada',
        message: resumed.message,
        durationMs: 5500,
      });
    } else {
      showToast({
        type: 'success',
        title: 'Sesión iniciada',
        message: 'Ya podés ver y guardar tus jugadas.',
        durationMs: 3500,
      });
    }
  }, [resumePendingPlay, showToast]);
}
