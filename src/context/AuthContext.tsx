import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { AuthMode, UserProfile, UserRole } from '../types/user';

interface AuthContextValue {
  authMode: AuthMode;
  user: UserProfile | null;
  activeRole: UserRole | 'guest';
  isLoading: boolean;
  setAuthMode: (mode: AuthMode) => void;
  switchRole: (role: UserRole | 'guest') => Promise<void>;
  toggleDemoAuth: () => void;
  sendMagicLink: (email: string) => Promise<{ success: boolean; message: string }>;
  loginAsDemoUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authMode, setAuthModeState] = useState<AuthMode>('guest');
  const [activeRole, setActiveRole] = useState<UserRole | 'guest'>('guest');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUser = async (mode: AuthMode) => {
    setIsLoading(true);
    try {
      const profile = await authService.getCurrentUser(mode);
      setUser(profile);
      if (profile) {
        setActiveRole(profile.role);
      } else {
        setActiveRole('guest');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser(authMode);
  }, [authMode]);

  const setAuthMode = (mode: AuthMode) => {
    setAuthModeState(mode);
    if (mode === 'guest') {
      setActiveRole('guest');
      setUser(null);
    }
  };

  const switchRole = async (role: UserRole | 'guest') => {
    setIsLoading(true);
    try {
      if (role === 'guest') {
        setAuthModeState('guest');
        setActiveRole('guest');
        setUser(null);
      } else {
        setAuthModeState('registered');
        setActiveRole(role);
        const profile = await authService.switchRole(role);
        setUser(profile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDemoAuth = () => {
    const nextMode = authMode === 'registered' ? 'guest' : 'registered';
    setAuthMode(nextMode);
  };

  const sendMagicLink = async (email: string) => {
    return await authService.sendMagicLink(email);
  };

  const loginAsDemoUser = async () => {
    await switchRole('player');
  };

  const logout = () => {
    setAuthModeState('guest');
    setActiveRole('guest');
    setUser(null);
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
