import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client. Uses the service-role key, so bypasses RLS.
 * NEVER expose this client or the key to client-side code. Service role
 * grants full read/write on every table and bucket in the project.
 *
 * The client is lazy — env vars do not need to be set at build time, only
 * at request time. This keeps `next build` working before the owner has
 * pasted credentials.
 */

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client missing env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local and Vercel.",
    );
  }

  cached = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return cached;
}

/**
 * Public anon-key Supabase client. Used for Supabase Auth (sign-in / sign-out)
 * from server components that need to read the current session cookie.
 *
 * For cookie-aware SSR, prefer createServerClient from @supabase/ssr — see
 * src/lib/supabase/auth.ts.
 */
export function getSupabasePublicConfig() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase public config missing env vars. Set SUPABASE_URL and SUPABASE_ANON_KEY.",
    );
  }
  return { url, anonKey };
}
