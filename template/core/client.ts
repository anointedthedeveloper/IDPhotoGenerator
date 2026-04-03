// @ts-nocheck
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://egacxegykakymnomegac.backend.onspace.ai';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzUyNDMzMjEsImV4cCI6MjA5MDYwMzMyMSwiaXNzIjoib25zcGFjZSIsInJlZiI6ImVnYWN4ZWd5a2FreW1ub21lZ2FjIiwicm9sZSI6ImFub24ifQ.ruB4fAr77tdc7lyxrQ8zJ8GTm-Q5xionT4td7XIwokU';

let sharedClient: SupabaseClient | null = null;

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
  }
}
