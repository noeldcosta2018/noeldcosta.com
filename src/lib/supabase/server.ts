import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase access for the site. One database for every site's sign-ups:
 * ERPCV3 (Noel, 10 October 2026). Its settings are ERPCV_SUPABASE_URL,
 * ERPCV_SUPABASE_ANON_KEY and ERPCV_SUPABASE_SERVICE_ROLE_KEY; the site uses
 * them as soon as all three exist, and until then the older SUPABASE_* set
 * (which pointed at a separate Vercel-created project). Switching all three
 * together keeps sign-in, sign-ups and the admin on the same project.
 *
 * The admin client uses the service-role key, so bypasses RLS. NEVER expose
 * this client or the key to client-side code. The client is lazy: settings
 * are read at request time, so `next build` works without them.
 */

function supabaseEnv(): { url?: string; anonKey?: string; serviceKey?: string } {
  const erpcv = {
    url: process.env.ERPCV_SUPABASE_URL,
    anonKey: process.env.ERPCV_SUPABASE_ANON_KEY,
    serviceKey: process.env.ERPCV_SUPABASE_SERVICE_ROLE_KEY,
  };
  if (erpcv.url && erpcv.anonKey && erpcv.serviceKey) return erpcv;
  return {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const { url, serviceKey } = supabaseEnv();
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client missing env vars. Set ERPCV_SUPABASE_URL, ERPCV_SUPABASE_ANON_KEY and ERPCV_SUPABASE_SERVICE_ROLE_KEY in Vercel.",
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
 * Public URL and anon key of the same project, for Supabase Auth (the admin
 * sign-in form and the server-side session check in auth.ts).
 */
export function getSupabasePublicConfig() {
  const { url, anonKey } = supabaseEnv();
  if (!url || !anonKey) {
    throw new Error(
      "Supabase public config missing env vars. Set ERPCV_SUPABASE_URL and ERPCV_SUPABASE_ANON_KEY.",
    );
  }
  return { url, anonKey };
}
