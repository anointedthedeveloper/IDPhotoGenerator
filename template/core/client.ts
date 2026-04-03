// @ts-nocheck
import { createClient, SupabaseClient } from '@supabase/supabase-js';
<<<<<<< HEAD

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://egacxegykakymnomegac.backend.onspace.ai';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzUyNDMzMjEsImV4cCI6MjA5MDYwMzMyMSwiaXNzIjoib25zcGFjZSIsInJlZiI6ImVnYWN4ZWd5a2FreW1ub21lZ2FjIiwicm9sZSI6ImFub24ifQ.ruB4fAr77tdc7lyxrQ8zJ8GTm-Q5xionT4td7XIwokU';
=======
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import { SupabaseConfig } from './types';
>>>>>>> f45d2d73488b0f141577d610319ed541a22d1bb4

class SupabaseManager {
  private static instance: SupabaseClient | null = null;
  private static creating = false;
  private static creationCount = 0;

<<<<<<< HEAD
export function getSharedSupabaseClient(): SupabaseClient {
  if (sharedClient) return sharedClient;
  sharedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return sharedClient;
}

export async function safeSupabaseOperation<T>(
  operation: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
=======
  static getClient(): SupabaseClient {

    if (this.instance) {
      return this.instance;
    }

    if (this.creating) {
      throw new Error('[Template:Client] Client is being created, please wait');
    }

    this.creating = true;
    this.creationCount++;
    
    try {
      console.log(`[Template:Client] Creating Supabase client instance #${this.creationCount}`);
      
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        const errorMsg = '[Template:Client] Supabase environment variables missing\n' +
          'Please check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env file';
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      if (this.creationCount > 1) {
        console.warn(`[Template:Client] ⚠️ Multiple client creation detected! This is creation #${this.creationCount}`);
        console.warn('[Template:Client] This may indicate a development environment hot reload or architecture issue.');
      }
      
      this.instance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: this.createStorageAdapter(),
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: Platform.OS === 'web',
          flowType: 'pkce',
        },
      });
      
      console.log('[Template:Client] Supabase client created successfully');
      return this.instance;
      
    } finally {
      this.creating = false;
    }
  }

  private static createStorageAdapter = () => {
    if (Platform.OS === 'web') {
      return {
        getItem: (key: string) => {
          if (typeof window !== 'undefined' && window.localStorage) {
            return Promise.resolve(window.localStorage.getItem(key));
          }
          return Promise.resolve(null);
        },
        setItem: (key: string, value: string) => {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value);
            return Promise.resolve();
          }
          return Promise.resolve();
        },
        removeItem: (key: string) => {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
            return Promise.resolve();
          }
          return Promise.resolve();
        },
      };
    } else {
      return AsyncStorage;
    }
>>>>>>> f45d2d73488b0f141577d610319ed541a22d1bb4
  }
}

export const getSharedSupabaseClient = (): SupabaseClient => {
  return SupabaseManager.getClient();
};

export const safeSupabaseOperation = async <T>(
  operation: (client: SupabaseClient) => Promise<T>
): Promise<T> => {
  const client = getSharedSupabaseClient();
  return await operation(client);
};

