/**
 * Paleta cerrada de colores del logo. Las claves son las que guarda el backend (`logoColor`); los colores en sí están
 * en `index.css` como `--c3-logo-<clave>` (y `--c3-logo-<clave>-on-dark` para fondos siempre oscuros, como el pie).
 */
export const LOGO_COLORS = ['verde', 'azul', 'rojo', 'naranja', 'violeta', 'tinta'] as const;
export type LogoColor = (typeof LOGO_COLORS)[number];

export const LOGO_COLOR_LABELS: Record<LogoColor, string> = {
  verde: 'Verde',
  azul: 'Azul',
  rojo: 'Rojo',
  naranja: 'Naranja',
  violeta: 'Violeta',
  tinta: 'Tinta',
};

export function isLogoColor(value: unknown): value is LogoColor {
  return typeof value === 'string' && (LOGO_COLORS as readonly string[]).includes(value);
}

/** El valor CSS del color de una clave; `onDark` pide la variante para fondos siempre oscuros. */
export function logoColorValue(color: LogoColor, onDark = false): string {
  return `var(--c3-logo-${color}${onDark ? '-on-dark' : ''})`;
}
