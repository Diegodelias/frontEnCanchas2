import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { AuthMode, UserProfile, UserRole } from '../types/user';

interface AuthContextValue {
  /** 'registered' si hay una sesión abierta en el backend; 'guest' si no. Se deriva de `user`. */
  authMode: AuthMode;
  user: UserProfile | null;
  activeRole: UserRole | 'guest';
  /** true hasta que se sabe si hay una sesión en el backend. */
  isLoading: boolean;
  sendMagicLink: (email: string) => Promise<{ success: boolean; message: string }>;
  /** Ingreso real de admin; lanza `AuthError` con el mensaje a mostrar si falla. */
  loginAdmin: (email: string, password: string) => Promise<UserProfile>;
  /** Confirma el link de acceso del mail y abre la sesión real del jugador; lanza `AuthError` si el link no sirve. */
  confirmLink: (token: string) => Promise<UserProfile>;
  /** Acepta la invitación de un admin: elige su contraseña y queda con la sesión abierta; lanza `AuthError` si falla. */
  acceptInvite: (token: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * El usuario de la interfaz sale siempre de una sesión del backend: no hay perfiles de ejemplo ni
 * ingresos simulados. `authMode` y `activeRole` se derivan de `user`.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const authMode: AuthMode = user ? 'registered' : 'guest';
  const activeRole: UserRole | 'guest' = user ? user.role : 'guest';

  // Al montar: si el backend tiene una sesión (de admin o de jugador), se carga; si no, se arranca como invitado.
  useEffect(() => {
    let cancelled = false;
    authService
      .fetchSession()
      .catch(() => null)
      .then((profile) => {
        if (cancelled) return;
        if (profile) setUser(profile);
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sendMagicLink = async (email: string) => {
    return await authService.sendMagicLink(email);
  };

  const loginAdmin = async (email: string, password: string) => {
    const profile = await authService.loginAdmin(email, password);
    setUser(profile);
    return profile;
  };

  const confirmLink = async (token: string) => {
    const profile = await authService.confirmLink(token);
    setUser(profile);
    return profile;
  };

  const acceptInvite = async (token: string, password: string) => {
    const profile = await authService.acceptInvite(token, password);
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    if (user) {
      await authService.logout().catch(() => undefined);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        authMode,
        user,
        activeRole,
        isLoading,
        sendMagicLink,
        loginAdmin,
        confirmLink,
        acceptInvite,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
