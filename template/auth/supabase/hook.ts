// @ts-nocheck
import { useCallback } from 'react';
import { useAuthContext } from './context';
import { authService } from './service';

export function useAuth() {
  const ctx = useAuthContext();

  const sendOTP = useCallback(async (email: string) => {
    ctx.setOperationLoading(true);
    try { return await authService.sendOTP(email); }
    finally { ctx.setOperationLoading(false); }
  }, [ctx]);

  const verifyOTPAndLogin = useCallback(async (email: string, otp: string, options?: any) => {
    ctx.setOperationLoading(true);
    try { return await authService.verifyOTPAndLogin(email, otp, options); }
    finally { ctx.setOperationLoading(false); }
  }, [ctx]);

  const signUpWithPassword = useCallback(async (email: string, password: string, metadata?: any) => {
    ctx.setOperationLoading(true);
    try { return await authService.signUpWithPassword(email, password, metadata); }
    finally { ctx.setOperationLoading(false); }
  }, [ctx]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    ctx.setOperationLoading(true);
    try { return await authService.signInWithPassword(email, password); }
    finally { ctx.setOperationLoading(false); }
  }, [ctx]);

  const signInWithGoogle = useCallback(async () => {
    ctx.setOperationLoading(true);
    try { return await authService.signInWithGoogle(); }
    finally { ctx.setOperationLoading(false); }
  }, [ctx]);

  const logout = useCallback(async () => {
    ctx.setOperationLoading(true);
    try { return await authService.logout(); }
    finally { ctx.setOperationLoading(false); }
  }, [ctx]);

  const refreshSession = useCallback(async () => {
    await authService.refreshSession();
  }, []);

  return { ...ctx, sendOTP, verifyOTPAndLogin, signUpWithPassword, signInWithPassword, signInWithGoogle, logout, refreshSession };
}
