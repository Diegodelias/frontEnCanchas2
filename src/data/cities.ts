import { CityOption } from '../types/canchas';

/** Ciudades del sitio. La lista es del frontend; el backend tiene una copia (CITY_IDS) para validar `crear-club`. */
export const CITIES: CityOption[] = [
  {
    id: 'buenos-aires',
    name: 'Buenos Aires',
    region: 'CABA',
    hasActiveComplexes: true,
  },
  {
    id: 'rosario',
    name: 'Rosario',
    region: 'Santa Fe',
    hasActiveComplexes: false,
  },
  {
    id: 'cordoba',
    name: 'Córdoba',
    region: 'Córdoba',
    hasActiveComplexes: false,
  },
];
