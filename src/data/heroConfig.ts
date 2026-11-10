/**
 * Configuración del Hero de Canchas3 (Alineado con el MVP MGV)
 *
 * Prioriza la propuesta de valor:
 * 1. Encontrar un partido grabado.
 * 2. Acceder al video HD.
 * 3. Guardar jugadas con un toque.
 * 4. Compartir con el equipo.
 * 5. Consultar y revivir desde el perfil.
 */

export const HERO_VIDEO_SRC = '/assets/home-bg.mp4';

/** Primer cuadro del video: se ve de fondo hasta que el video entra, y se precarga desde index.html. */
export const HERO_POSTER_SRC = '/assets/hero-poster.jpg';

export const HERO_VIDEO_PLAYBACK_RATE = 0.78;

export const HERO_COPY = {
  badge: 'Grabaciones HD · Canchas en vivo · Jugadas destacadas',
  headline: 'Encontrá la grabación de tu partido.',
  subtitle:
    'Elegí tu cancha y horario, mirá el partido en HD y guardá tus mejores jugadas para compartirlas.',
  primaryCta: 'Buscar mi partido grabado',
  secondaryCta: 'Mirar canchas en vivo',
  tertiaryCta: 'Reservar una cancha',
};
