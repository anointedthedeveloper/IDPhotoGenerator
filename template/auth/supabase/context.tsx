// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types';
import { authService } from './service';

interface AuthContextState {
  user: AuthUser | null;
  loading: boolean;
  operationLoading: boolean;
  initialized: boolean;
  setOperationLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<AuthContextState, 'setOperationLoading'>>({
    user: null,
    loading: true,
    operationLoading: false,
    initialized: false,
  });

  const setOperationLoading = (operationLoading: boolean) =>
    setState(s => ({ ...s, operationLoading }));

  useEffect(() => {
    let mounted = true;
    let sub: any;

    authService.getCurrentUser().then(user => {
      if (mounted) setState(s => ({ ...s, user, loading: false, initialized: true }));
    }).catch(() => {
      if (mounted) setState(s => ({ ...s, loading: false, initialized: true }));
    });

    sub = authService.onAuthStateChange(user => {
      if (mounted) setState(s => ({ ...s, user }));
    });

    return () => {
      mounted = false;
      sub?.unsubscribe?.();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, setOperationLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
