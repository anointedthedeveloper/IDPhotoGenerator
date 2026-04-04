// @ts-nocheck
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

class SupabaseManager {
  private static instance: SupabaseClient | null = null;
  private static creating = false;
  private static creationCount = 0;

  static getClient(): SupabaseClient {
    if (this.instance) return this.instance;
    if (this.creating) throw new Error('[Template:Client] Client is being created, please wait');

    this.creating = true;
    this.creationCount++;

    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://gwhgvthyecozgscigwhg.backend.onspace.ai';
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzUzNDEwNTgsImV4cCI6MjA5MDcwMTA1OCwiaXNzIjoib25zcGFjZSIsInJlZiI6Imd3aGd2dGh5ZWNvemdzY2lnd2hnIiwicm9sZSI6ImFub24ifQ.20NmanWjY11BKwo4ILR-eDSGBzCUeBvHpcoSn8Bm0S0';

      this.instance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: this.createStorageAdapter(),
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: Platform.OS === 'web',
          flowType: 'pkce',
        },
      });

      return this.instance;
    } finally {
      this.creating = false;
    }
  }

  private static createStorageAdapter = () => {
    if (Platform.OS === 'web') {
      return {
        getItem: (key: string) => Promise.resolve(typeof window !== 'undefined' ? window.localStorage.getItem(key) : null),
        setItem: (key: string, value: string) => { typeof window !== 'undefined' && window.localStorage.setItem(key, value); return Promise.resolve(); },
        removeItem: (key: string) => { typeof window !== 'undefined' && window.localStorage.removeItem(key); return Promise.resolve(); },
      };
    }
    return AsyncStorage;
  };
}

export const getSharedSupabaseClient = (): SupabaseClient => SupabaseManager.getClient();

export const safeSupabaseOperation = async <T>(
  operation: (client: SupabaseClient) => Promise<T>
): Promise<T> => await operation(getSharedSupabaseClient());
