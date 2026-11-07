import { UserProfile } from '../types/user';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-matias-01',
    name: 'Matías Rossi',
    email: 'matias.rossi@canchas3.com.ar',
    avatar: 'MR',
    role: 'player',
    roleLabel: 'Jugador',
    joinedAt: 'Marzo 2026',
    savedMatchIds: ['match-en-f5-1900', 'match-lc-f5-1900'],
  },
  {
    id: 'admin-estacion-norte',
    name: 'Gonzalo Fernández',
    email: 'gonzalo@estacionnorte.com.ar',
    avatar: 'GF',
    role: 'club_admin',
    roleLabel: 'Administrador',
    clubId: 'estacion-norte',
    clubName: 'Estación Norte Fútbol',
    joinedAt: 'Enero 2026',
    savedMatchIds: ['match-en-f5-1900'],
  },
  {
    id: 'user-lucia-02',
    name: 'Lucía Ferreyra',
    email: 'lucia.f@gmail.com',
    avatar: 'LF',
    role: 'player',
    roleLabel: 'Jugadora',
    joinedAt: 'Abril 2026',
    savedMatchIds: ['match-en-f5-1900'],
  },
];

export const DEMO_REGISTERED_USER = MOCK_USERS[0];
export const DEMO_CLUB_ADMIN = MOCK_USERS[1];
