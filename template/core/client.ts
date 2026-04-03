// @ts-nocheck
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://egacxegykakymnomegac.backend.onspace.ai';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzUyNDMzMjEsImV4cCI6MjA5MDYwMzMyMSwiaXNzIjoib25zcGFjZSIsInJlZiI6ImVnYWN4ZWd5a2FreW1ub21lZ2FjIiwicm9sZSI6ImFub24ifQ.ruB4fAr77tdc7lyxrQ8zJ8GTm-Q5xionT4td7XIwokU';

let sharedClient: SupabaseClient | null = null;

export function getSharedSupabaseClient(): SupabaseClient {
  if (sharedClient) return sharedClient;

  const storage = Platform.OS === 'web'
    ? {
        getItem: (key: string) => Promise.resolve(typeof window !== 'undefined' ? window.localStorage.getItem(key) : null),
        setItem: (key: string, value: string) => { typeof window !== 'undefined' && window.localStorage.setItem(key, value); return Promise.resolve(); },
        removeItem: (key: string) => { typeof window !== 'undefined' && window.localStorage.removeItem(key); return Promise.resolve(); },
      }
    : AsyncStorage;

  sharedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
      flowType: 'pkce',
    },
  });

  return sharedClient;
}

export const safeSupabaseOperation = async <T>(
  operation: (client: SupabaseClient) => Promise<T>
): Promise<T> => {
  return await operation(getSharedSupabaseClient());
};
