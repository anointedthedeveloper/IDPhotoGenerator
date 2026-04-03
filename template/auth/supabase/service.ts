// @ts-nocheck
import { getSharedSupabaseClient } from '../../core/client';
import { AuthUser, SendOTPOptions } from '../types';

class SupabaseAuthService {
  private get client() {
    return getSharedSupabaseClient();
  }

  async sendOTP(email: string, options: SendOTPOptions = {}) {
    const { error } = await this.client.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: options.shouldCreateUser ?? true,
        emailRedirectTo: options.emailRedirectTo,
      },
    });
    return error ? { error: error.message } : {};
  }

  async verifyOTPAndLogin(email: string, otp: string, options?: { password?: string }) {
    const { data, error } = await this.client.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });
    if (error) return { user: null, error: error.message };
    return { user: this.mapUser(data.user), error: null };
  }

  async signUpWithPassword(email: string, password: string, metadata: Record<string, any> = {}) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) return { user: null, error: error.message };
    return {
      user: this.mapUser(data.user),
      needsEmailConfirmation: !data.session,
    };
  }

  async signInWithPassword(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error: error.message };
    return { user: this.mapUser(data.user) };
  }

  async signInWithGoogle() {
    const { error } = await this.client.auth.signInWithOAuth({ provider: 'google' });
    return { error: error?.message ?? null };
  }

  async logout() {
    const { error } = await this.client.auth.signOut();
    return error ? { error: error.message } : {};
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data } = await this.client.auth.getUser();
    return this.mapUser(data?.user);
  }

  async refreshSession() {
    await this.client.auth.refreshSession();
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const { data } = this.client.auth.onAuthStateChange((_event, session) => {
      callback(this.mapUser(session?.user));
    });
    return { unsubscribe: () => data.subscription.unsubscribe() };
  }

  private mapUser(user: any): AuthUser | null {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email ?? '',
      username: user.user_metadata?.username,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}

export const authService = new SupabaseAuthService();
