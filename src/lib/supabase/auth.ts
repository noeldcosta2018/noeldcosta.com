import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "./server";

/**
 * Supabase Auth helpers — server-side only.
 *
 * The browser uses @supabase/supabase-js directly for sign-in/sign-out and
 * the session is persisted in cookies. These helpers read those cookies via
 * @supabase/ssr so server components and route handlers can check who is
 * logged in.
 */

export const ADMIN_EMAIL = "noeldcosta2018@gmail.com";

async function makeSsrClient() {
  const { url, anonKey } = getSupabasePublicConfig();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Route handlers and server components in Next 16 can call
        // cookieStore.set without throwing. Wrapped in try/catch for the
        // pure-server-component case where Next will throw a "cookies
        // were modified outside" warning — that path is non-fatal here.
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // No-op when called from a pure server component.
        }
      },
    },
  });
}

export interface CurrentUser {
  id: string;
  email: string | null;
}

export async function getCurrentUser(): Promise<
  { user: CurrentUser | null; error: string | null }
> {
  try {
    const supabase = await makeSsrClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: null };
    return {
      user: { id: data.user.id, email: data.user.email ?? null },
      error: null,
    };
  } catch (e) {
    return {
      user: null,
      error: e instanceof Error ? e.message : "unknown auth error",
    };
  }
}

export interface AdminGuardResult {
  ok: boolean;
  user: CurrentUser | null;
  reason?: string;
}

export async function requireAdmin(): Promise<AdminGuardResult> {
  const { user, error } = await getCurrentUser();
  if (error) return { ok: false, user: null, reason: error };
  if (!user) return { ok: false, user: null, reason: "not signed in" };
  if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return { ok: false, user, reason: "not authorised" };
  }
  return { ok: true, user };
}
