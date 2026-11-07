import { CourtVisualVariant } from '../types/canchas';

/** Variante visual con la que se dibuja la tarjeta de un club que no tiene una asignada. */
export const DEFAULT_VISUAL_VARIANT: CourtVisualVariant = 'soccer-turf';

interface ComplexVisual {
  /** Imagen generada del complejo (archivo de `public/assets/complejos/`). */
  imageUrl: string;
  visualVariant: CourtVisualVariant;
}

/**
 * Imagen y tratamiento visual de cada club, asociados a su identificador.
 * La API no guarda imágenes: un club que no está acá (uno nuevo) se muestra con el placeholder por defecto.
 */
const COMPLEX_VISUALS: Record<string, ComplexVisual> = {
  'estacion-norte': { imageUrl: '/assets/complejos/estacion-norte.jpg', visualVariant: 'multi-pitch' },
  'la-cantera-crespo': { imageUrl: '/assets/complejos/la-cantera-villa-crespo.jpg', visualVariant: 'soccer-turf' },
  'polideportivo-belgrano': { imageUrl: '/assets/complejos/polideportivo-belgrano.jpg', visualVariant: 'indoor-pitch' },
  'parque-sur-caballito': { imageUrl: '/assets/complejos/complejo-parque-sur.jpg', visualVariant: 'clubhouse-turf' },
  'arena-nunez': { imageUrl: '/assets/complejos/arena-nunez.jpg', visualVariant: 'night-stadium' },
  'terraza-colegiales': { imageUrl: '/assets/complejos/terraza-colegiales.jpg', visualVariant: 'rooftop-pitch' },
};

export function visualsForClub(clubId: string): { imageUrl?: string; visualVariant: CourtVisualVariant } {
  return COMPLEX_VISUALS[clubId] ?? { visualVariant: DEFAULT_VISUAL_VARIANT };
}
