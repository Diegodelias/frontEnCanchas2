export type UserRole = 'player' | 'club_admin';

export type AuthMode = 'registered' | 'guest';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  roleLabel?: string;
  clubId?: string;
  clubName?: string;
  joinedAt: string;
  savedMatchIds: string[];
  /** true si viene de una sesión del backend; el jugador de ejemplo (modo demo) no lo lleva. */
  isRealSession?: boolean;
}
