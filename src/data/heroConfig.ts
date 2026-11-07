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

export const HERO_VIDEO_SRC = '/assets/aistudio/ref_6fe9ff42.mp4';

export const HERO_VIDEO_PLAYBACK_RATE = 0.78;

export const HERO_COPY = {
  badge: 'Grabaciones HD · Canchas en vivo · Jugadas destacadas',
  headline: 'Tus partidos grabados. Tus mejores jugadas.',
  subtitle:
    'Elegí tu complejo deportivo, reviví cada partido en video HD, marcá tus mejores jugadas con un toque y compartilas con tu equipo.',
  primaryCta: 'Buscar mi partido grabado',
  secondaryCta: 'Mirar canchas en vivo',
  tertiaryCta: 'Reservar una cancha',
};

/**
 * Genera dinámicamente un póster SVG usando los tokens CSS activos del tema.
 */
export function buildHeroPosterDataUri(): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return '';
  }

  const styles = getComputedStyle(document.documentElement);
  const bg = styles.getPropertyValue('--c3-pitch').trim() || 'currentColor';
  const mid = styles.getPropertyValue('--c3-pitch-elevated').trim() || 'currentColor';
  const accent = styles.getPropertyValue('--c3-volt').trim() || 'currentColor';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" fill="none">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${bg}"/>
          <stop offset="55%" stop-color="${mid}"/>
          <stop offset="100%" stop-color="${bg}"/>
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#sky)"/>
      <g stroke="${accent}" stroke-opacity="0.16" stroke-width="2">
        <rect x="220" y="180" width="1160" height="580" rx="8"/>
        <line x1="800" y1="180" x2="800" y2="760"/>
        <circle cx="800" cy="470" r="110"/>
        <rect x="220" y="310" width="170" height="320"/>
        <rect x="1210" y="310" width="170" height="320"/>
      </g>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
