// @ts-nocheck
import { useCallback } from 'react';
import { useMockAuthContext } from './context';
import { mockAuthService } from './service';

export function useMockAuth() {
  const ctx = useMockAuthContext();

  const sendOTP = useCallback(async (email: string) => {
    ctx.setOperationLoading(true);
    try {
      return await mockAuthService.sendOTP(email);
    } finally {
      ctx.setOperationLoading(false);
    }
  }, [ctx]);

  const verifyOTPAndLogin = useCallback(async (email: string, otp: string, options?: any) => {
    ctx.setOperationLoading(true);
    try {
      return await mockAuthService.verifyOTPAndLogin(email, otp, options);
    } finally {
      ctx.setOperationLoading(false);
    }
  }, [ctx]);

  const signUpWithPassword = useCallback(async (email: string, password: string, metadata?: any) => {
    ctx.setOperationLoading(true);
    try {
      return await mockAuthService.signUpWithPassword(email, password, metadata);
    } finally {
      ctx.setOperationLoading(false);
    }
  }, [ctx]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    ctx.setOperationLoading(true);
    try {
      return await mockAuthService.signInWithPassword(email, password);
    } finally {
      ctx.setOperationLoading(false);
    }
  }, [ctx]);

  const signInWithGoogle = useCallback(async () => {
    return { error: 'Google sign-in not supported in mock mode' };
  }, []);

  const logout = useCallback(async () => {
    ctx.setOperationLoading(true);
    try {
      return await mockAuthService.logout();
    } finally {
      ctx.setOperationLoading(false);
    }
  }, [ctx]);

  const refreshSession = useCallback(async () => {
    await mockAuthService.refreshSession();
  }, []);

  return {
    ...ctx,
    sendOTP,
    verifyOTPAndLogin,
    signUpWithPassword,
    signInWithPassword,
    signInWithGoogle,
    logout,
    refreshSession,
  };
}

export function useMockAuthDebug() {
  return {
    getMockDebugInfo: () => mockAuthService.getMockDebugInfo(),
    clearAllMockData: () => mockAuthService.clearAllMockData(),
  };
}
