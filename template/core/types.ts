// @ts-nocheck
export interface OnSpaceConfig {
  supabase?: {
    url: string;
    anonKey: string;
  };
  auth?: {
    enabled?: boolean;
    profileTableName?: string;
  } | false;
  payments?: boolean;
  storage?: boolean;
}
