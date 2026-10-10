import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { requireAdmin } from "@/lib/supabase/auth";
import { getSupabasePublicConfig } from "@/lib/supabase/server";

/**
 * /admin/login: owner sign-in. Already signed in as the owner: straight to the
 * overview. The form signs in against the same Supabase project the admin
 * pages read (server SUPABASE_URL / SUPABASE_ANON_KEY, passed down here).
 */

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const guard = await requireAdmin();
  if (guard.ok) redirect("/admin/");

  let url: string | null = null;
  let anonKey: string | null = null;
  try {
    ({ url, anonKey } = getSupabasePublicConfig());
  } catch {
    // The form explains the missing settings.
  }

  return (
    <main className="adm-center">
      <LoginForm url={url} anonKey={anonKey} />
    </main>
  );
}
