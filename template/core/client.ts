// @ts-nocheck
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { configManager } from './config';

let sharedClient: SupabaseClient | null = null;

export function getSharedSupabaseClient(): SupabaseClient {
  if (sharedClient) return sharedClient;

  const config = configManager.getSupabaseConfig();
  const url = config?.url || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = config?.anonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('[Template:Client] Supabase URL and anon key are required');
  }

  sharedClient = createClient(url, key);
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
  }
}
