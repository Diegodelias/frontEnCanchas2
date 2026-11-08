const STORAGE_KEY = 'canchas3-player-email';

/**
 * El último mail con el que un jugador ingresó, para que los formularios de ingreso vengan con el mail cargado.
 * Es solo el mail (no abre sesión). Todo acceso al almacenamiento va con try/catch: sin almacenamiento
 * (ventana privada, datos bloqueados) los formularios simplemente quedan vacíos.
 */
export const rememberedEmail = {
  get(): string {
    try {
      return window.localStorage.getItem(STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  },

  /** Se guarda recién después de un ingreso correcto, no al pedir el link, para no recordar un mail mal escrito. */
  save(email: string): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, email.trim());
    } catch {
      // Sin almacenamiento: no se recuerda y listo.
    }
  },

  forget(): void {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Sin almacenamiento: no hay nada que olvidar.
    }
  },
};
