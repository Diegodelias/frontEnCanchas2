export type UserRole = 'player' | 'club_admin' | 'superadmin';

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
}
