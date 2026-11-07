import { CityOption, Complex } from '../types/canchas';

export const MOCK_CITIES: CityOption[] = [
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

export const MOCK_COMPLEXES: Complex[] = [
  {
    id: 'estacion-norte',
    name: 'Estación Norte Club',
    zone: 'Palermo',
    city: 'buenos-aires',
    address: 'Av. Dorrego 1840, Palermo',
    sports: ['Fútbol 5', 'Fútbol 7'],
    rating: 4.9,
    minPrice: 28000,
    availabilitySummary: 'Turnos hoy desde las 18:00 hs',
    visualVariant: 'multi-pitch',
    courts: [
      {
        id: 'en-f5-1',
        name: 'Cancha 1 · Fútbol 5',
        sport: 'Fútbol 5',
        surface: 'Césped sintético profesional',
        availabilityByDay: [
          {
            id: 'hoy',
            label: 'Hoy · Viernes',
            slots: [
              { id: 'en-f5-1-1800', time: '18:00', price: 28000 },
              { id: 'en-f5-1-1900', time: '19:00', price: 32000 },
              { id: 'en-f5-1-2100', time: '21:00', price: 34000 },
              { id: 'en-f5-1-2200', time: '22:00', price: 32000 },
            ],
          },
          {
            id: 'manana',
            label: 'Mañana · Sábado',
            slots: [
              { id: 'en-f5-1-sab-1000', time: '10:00', price: 28000 },
              { id: 'en-f5-1-sab-1700', time: '17:00', price: 32000 },
              { id: 'en-f5-1-sab-1900', time: '19:00', price: 34000 },
            ],
          },
          {
            id: 'domingo',
            label: 'Domingo',
            slots: [],
          },
        ],
      },
      {
        id: 'en-f7-1',
        name: 'Cancha Central · Fútbol 7',
        sport: 'Fútbol 7',
        surface: 'Césped sintético · Iluminación LED',
        availabilityByDay: [
          {
            id: 'hoy',
            label: 'Hoy · Viernes',
            slots: [
              { id: 'en-f7-1830', time: '18:30', price: 38000 },
              { id: 'en-f7-2000', time: '20:00', price: 42000 },
              { id: 'en-f7-2130', time: '21:30', price: 42000 },
            ],
          },
          {
            id: 'manana',
            label: 'Mañana · Sábado',
            slots: [
              { id: 'en-f7-sab-1100', time: '11:00', price: 36000 },
              { id: 'en-f7-sab-1800', time: '18:00', price: 42000 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'la-cantera-crespo',
    name: 'La Cantera Villa Crespo',
    zone: 'Villa Crespo',
    city: 'buenos-aires',
    address: 'Camargo 620, Villa Crespo',
    sports: ['Fútbol 5', 'Fútbol 7'],
    rating: 4.8,
    minPrice: 26000,
    availabilitySummary: 'Turnos hoy desde las 19:00 hs',
    visualVariant: 'soccer-turf',
    courts: [
      {
        id: 'lc-f5-a',
        name: 'Cancha A · Fútbol 5 Techada',
        sport: 'Fútbol 5',
        surface: 'Sintético con caucho · Techada',
        availabilityByDay: [
          {
            id: 'hoy',
            label: 'Hoy · Viernes',
            slots: [
              { id: 'lc-f5-1900', time: '19:00', price: 26000 },
              { id: 'lc-f5-2000', time: '20:00', price: 29000 },
              { id: 'lc-f5-2200', time: '22:00', price: 29000 },
            ],
          },
          {
            id: 'manana',
            label: 'Mañana · Sábado',
            slots: [
              { id: 'lc-f5-sab-1600', time: '16:00', price: 26000 },
              { id: 'lc-f5-sab-1800', time: '18:00', price: 29000 },
            ],
          },
        ],
      },
      {
        id: 'lc-f7-b',
        name: 'Cancha B · Fútbol 7 Descubierta',
        sport: 'Fútbol 7',
        surface: 'Césped sintético · Iluminación LED',
        availabilityByDay: [
          {
            id: 'hoy',
            label: 'Hoy · Viernes',
            slots: [],
          },
          {
            id: 'manana',
            label: 'Mañana · Sábado',
            slots: [
              { id: 'lc-f7-sab-1730', time: '17:30', price: 38000 },
              { id: 'lc-f7-sab-1930', time: '19:30', price: 42000 },
              { id: 'lc-f7-sab-2100', time: '21:00', price: 42000 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'polideportivo-belgrano',
    name: 'Polideportivo Belgrano',
    zone: 'Belgrano',
    city: 'buenos-aires',
    address: 'Juramento 2910, Belgrano',
    sports: ['Fútbol 5', 'Fútbol 8'],
    rating: 4.9,
    minPrice: 31000,
    availabilitySummary: 'Turnos hoy desde las 17:30 hs',
    visualVariant: 'indoor-pitch',
    courts: [
      {
        id: 'pb-f5-1',
        name: 'Cancha 1 · Fútbol 5 Cubierta',
        sport: 'Fútbol 5',
        surface: 'Césped monofilamento · Techada',
        availabilityByDay: [
          {
            id: 'hoy',
            label: 'Hoy · Viernes',
            slots: [
              { id: 'pb-f5-1730', time: '17:30', price: 31000 },
              { id: 'pb-f5-1900', time: '19:00', price: 35000 },
              { id: 'pb-f5-2030', time: '20:30', price: 35000 },
            ],
          },
          {
            id: 'manana',
            label: 'Mañana · Sábado',
            slots: [
              { id: 'pb-f5-sab-0930', time: '09:30', price: 31000 },
              { id: 'pb-f5-sab-1100', time: '11:00', price: 31000 },
              { id: 'pb-f5-sab-1830', time: '18:30', price: 35000 },
            ],
          },
        ],
      },
      {
        id: 'pb-f8-2',
        name: 'Cancha 2 · Fútbol 8',
        sport: 'Fútbol 8',
        surface: 'Sintético FIFA Quality · Abierta',
        availabilityByDay: [
          {
            id: 'hoy',
            label: 'Hoy · Viernes',
            slots: [
              { id: 'pb-f8-1800', time: '18:00', price: 44000 },
              { id: 'pb-f8-2100', time: '21:00', price: 48000 },
            ],
          },
          {
            id: 'manana',
            label: 'Mañana · Sábado',
            slots: [],
          },
        ],
      },
    ],
  },
  {
    id: 'parque-sur-caballito',
    name: 'Complejo Parque Sur',
    zone: 'Caballito',
    city: 'buenos-aires',
    address: 'Av. Pedro Goyena 1420, Caballito',
    sports: ['Fútbol 5', 'Fútbol 7'],
    rating: 4.7,
    minPrice: 27000,
    availabilitySummary: 'Turnos hoy desde las 18:00 hs',
    visualVariant: 'clubhouse-turf',
    courts: [
      {
        id: 'ps-f5-1',
        name: 'Cancha 1 · Fútbol 5',
        sport: 'Fútbol 5',
        surface: 'Césped sintético · Vestuarios',
        availabilityByDay: [
          {
            id: 'hoy',
            label: 'Hoy · Viernes',
            slots: [
              { id: 'ps-f5-1800', time: '18:00', price: 27000 },
              { id: 'ps-f5-2000', time: '20:00', price: 30000 },
              { id: 'ps-f5-2100', time: '21:00', price: 30000 },
            ],
          },
          {
            id: 'manana',
            label: 'Mañana · Sábado',
            slots: [
              { id: 'ps-f5-sab-1500', time: '15:00', price: 27000 },
              { id: 'ps-f5-sab-1900', time: '19:00', price: 30000 },
            ],
          },
        ],
      },
      {
        id: 'ps-f7-1',
        name: 'Cancha 2 · Fútbol 7',
        sport: 'Fútbol 7',
        surface: 'Sintético profesional · Iluminación LED',
        availabilityByDay: [
          {
            id: 'hoy',
            label: 'Hoy · Viernes',
            slots: [
              { id: 'ps-f7-1930', time: '19:30', price: 37000 },
              { id: 'ps-f7-2100', time: '21:00', price: 39000 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'arena-nunez',
    name: 'Arena Núñez Deportivo',
    zone: 'Núñez',
    city: 'buenos-aires',
    address: 'Campos Salles 2150, Núñez',
    sports: ['Fútbol 5', 'Fútbol 8', 'Fútbol 11'],
    rating: 4.8,
    minPrice: 30000,
    availabilitySummary: 'Turnos hoy desde las 19:00 hs',
    visualVariant: 'night-stadium',
    courts: [
      {
        id: 'an-f5',
        name: 'Cancha 1 · Fútbol 5',
        sport: 'Fútbol 5',
        surface: 'Césped monofilamento',
        availabilityByDay: [
          {
            id: 'hoy',
            label: 'Hoy · Viernes',
            slots: [
              { id: 'an-f5-1900', time: '19:00', price: 30000 },
              { id: 'an-f5-2000', time: '20:00', price: 33000 },
              { id: 'an-f5-2200', time: '22:00', price: 33000 },
            ],
          },
          {
            id: 'manana',
            label: 'Mañana · Sábado',
            slots: [
              { id: 'an-f5-sab-1700', time: '17:00', price: 30000 },
              { id: 'an-f5-sab-2000', time: '20:00', price: 33000 },
            ],
          },
        ],
      },
      {
        id: 'an-f8',
        name: 'Cancha 2 · Fútbol 8',
        sport: 'Fútbol 8',
        surface: 'Sintético FIFA Quality',
        availabilityByDay: [
          {
            id: 'hoy',
            label: 'Hoy · Viernes',
            slots: [
              { id: 'an-f8-2000', time: '20:00', price: 46000 },
              { id: 'an-f8-2130', time: '21:30', price: 48000 },
            ],
          },
        ],
      },
      {
        id: 'an-f11',
        name: 'Estadio Principal · Fútbol 11',
        sport: 'Fútbol 11',
        surface: 'Césped sintético reglamentario',
        availabilityByDay: [
          {
            id: 'manana',
            label: 'Mañana · Sábado',
            slots: [
              { id: 'an-f11-sab-1600', time: '16:00', price: 68000 },
              { id: 'an-f11-sab-1900', time: '19:00', price: 74000 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'terraza-colegiales',
    name: 'Terraza Fútbol Colegiales',
    zone: 'Colegiales',
    city: 'buenos-aires',
    address: 'Conde 1180, Colegiales',
    sports: ['Fútbol 5'],
    rating: 4.9,
    minPrice: 29000,
    availabilitySummary: 'Turnos hoy desde las 18:00 hs',
    visualVariant: 'rooftop-pitch',
    courts: [
      {
        id: 'tc-f5-1',
        name: 'Cancha 1 · Fútbol 5 Terraza',
        sport: 'Fútbol 5',
        surface: 'Césped sintético · Vista abierta',
        availabilityByDay: [
          {
            id: 'hoy',
            label: 'Hoy · Viernes',
            slots: [
              { id: 'tc-f5-1800', time: '18:00', price: 29000 },
              { id: 'tc-f5-1930', time: '19:30', price: 33000 },
              { id: 'tc-f5-2100', time: '21:00', price: 33000 },
            ],
          },
          {
            id: 'manana',
            label: 'Mañana · Sábado',
            slots: [
              { id: 'tc-f5-sab-1030', time: '10:30', price: 29000 },
              { id: 'tc-f5-sab-1730', time: '17:30', price: 33000 },
            ],
          },
        ],
      },
    ],
  },
];
