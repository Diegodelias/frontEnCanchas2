import { useCallback, useState } from 'react';
import { rememberedEmail } from '../services/rememberedEmail';

/**
 * El mail que el navegador recuerda del último ingreso de un jugador. `reload` lo vuelve a leer (al abrir un
 * formulario) y devuelve el valor; `forget` lo borra («No soy yo, usar otro mail»).
 */
export function useRememberedEmail() {
  const [remembered, setRemembered] = useState<string>(() => rememberedEmail.get());

  const reload = useCallback(() => {
    const value = rememberedEmail.get();
    setRemembered(value);
    return value;
  }, []);

  const forget = useCallback(() => {
    rememberedEmail.forget();
    setRemembered('');
  }, []);

  return { remembered, reload, forget };
}
