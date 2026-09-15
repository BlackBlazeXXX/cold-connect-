// FILE: src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  envUrl &&
  envAnonKey &&
  !envUrl.includes('placeholder') &&
  !envAnonKey.includes('placeholder') &&
  envUrl.startsWith('https://')
);

// Fallback or actual Supabase client
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(envUrl, envAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient('https://mock.supabase.co', 'mock-anon-key-valid-jwt-format-for-init', {
      auth: {
        persistSession: true,
      },
    });

export default supabase;
