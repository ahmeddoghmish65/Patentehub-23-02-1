import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Log the error but don't throw at module level — a module-level throw
  // crashes the entire import chain (router → store → app) before React
  // can even render, resulting in a completely blank white page with no
  // error message.  Instead we surface the problem via console and let
  // the auth store's checkAuth() handle the graceful fallback.
  console.error(
    '[Patente Hub] Missing Supabase env vars: VITE_SUPABASE_URL and/or ' +
    'VITE_SUPABASE_ANON_KEY are not defined. ' +
    'Make sure your .env file (or deployment env settings) is configured correctly.'
  );
}

export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
