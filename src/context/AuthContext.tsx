import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { AuthMode, UserProfile, UserRole } from '../types/user';

interface AuthContextValue {
  authMode: AuthMode;
  user: UserProfile | null;
  activeRole: UserRole | 'guest';
  /** true hasta que se sabe si hay una sesión de admin en el backend. */
  isLoading: boolean;
  setAuthMode: (mode: AuthMode) => void;
  /** Jugador demo o invitado. El admin solo entra con `loginAdmin`. */
  switchRole: (role: 'player' | 'guest') => Promise<void>;
  toggleDemoAuth: () => void;
  sendMagicLink: (email: string) => Promise<{ success: boolean; message: string }>;
  loginAsDemoUser: () => Promise<void>;
  /** Ingreso real de admin; lanza `AuthError` con el mensaje a mostrar si falla. */
  loginAdmin: (email: string, password: string) => Promise<UserProfile>;
  /** Confirma el link de acceso del mail y abre la sesión real del jugador; lanza `AuthError` si el link no sirve. */
  confirmLink: (token: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authMode, setAuthModeState] = useState<AuthMode>('guest');
  const [activeRole, setActiveRole] = useState<UserRole | 'guest'>('guest');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const applyUser = (profile: UserProfile | null) => {
    setUser(profile);
    setActiveRole(profile ? profile.role : 'guest');
    setAuthModeState(profile ? 'registered' : 'guest');
  };

  // Al montar: si el backend tiene una sesión (de admin o de jugador), se carga; si no, se arranca como invitado.
  useEffect(() => {
    let cancelled = false;
    authService
      .fetchSession()
      .catch(() => null)
      .then((profile) => {
        if (cancelled) return;
        if (profile) applyUser(profile);
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Cierra la sesión del backend si el usuario actual es una sesión real (admin o jugador). */
  const endRealSession = async () => {
    if (user?.isRealSession) {
      await authService.logout().catch(() => undefined);
    }
  };

  const switchRole = async (role: 'player' | 'guest') => {
    setIsLoading(true);
    try {
      await endRealSession();
      applyUser(await authService.switchRole(role));
    } finally {
      setIsLoading(false);
    }
  };

  const setAuthMode = (mode: AuthMode) => {
    if (mode === 'guest') {
      void switchRole('guest');
      return;
    }
    // Modo demo: el jugador simulado que ya tenga el servicio (p. ej. con el mail que ingresó).
    void (async () => {
      setIsLoading(true);
      try {
        await endRealSession();
        applyUser(await authService.getCurrentUser('registered'));
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const toggleDemoAuth = () => {
    setAuthMode(authMode === 'registered' ? 'guest' : 'registered');
  };

  const sendMagicLink = async (email: string) => {
    return await authService.sendMagicLink(email);
  };

  const loginAsDemoUser = async () => {
    await switchRole('player');
  };

  const loginAdmin = async (email: string, password: string) => {
    const profile = await authService.loginAdmin(email, password);
    applyUser(profile);
    return profile;
  };

  const confirmLink = async (token: string) => {
    const profile = await authService.confirmLink(token);
    applyUser(profile);
    return profile;
  };

  const logout = async () => {
    await endRealSession();
    applyUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        authMode,
        user,
        activeRole,
        isLoading,
        setAuthMode,
        switchRole,
        toggleDemoAuth,
        sendMagicLink,
        loginAsDemoUser,
        loginAdmin,
        confirmLink,
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
