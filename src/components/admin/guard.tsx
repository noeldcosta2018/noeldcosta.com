import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin, type AdminGuardResult } from "@/lib/supabase/auth";

/**
 * Admin page guard. Signed-out visitors go straight to the sign-in page; a
 * signed-in account that is not the owner, or a server set-up problem, gets
 * <AdminDenied /> with the reason.
 */
export async function adminGuard(): Promise<AdminGuardResult> {
  const guard = await requireAdmin();
  if (guard.ok) return guard;
  const setupProblem = /env vars|config/i.test(guard.reason ?? "");
  if (!guard.user && !setupProblem) redirect("/admin/login/");
  return guard;
}

export function AdminDenied({ reason }: { reason?: string }) {
  const notOwner = reason === "not authorised";
  return (
    <main className="adm-center">
      <div className="adm-panel">
        <div className="nd-eyebrow">Admin</div>
        <h1 className="nd-display adm-h1">{notOwner ? "No access" : "Admin unavailable"}</h1>
        <p className="adm-muted">
          {notOwner
            ? "This account is not the site owner. Sign in with the owner account."
            : `The admin cannot reach the database: ${(reason ?? "unknown error").replace(/\.+$/, "")}.`}
        </p>
        <Link className="nd-btn nd-btn-primary" href="/admin/login/">
          Go to sign in
        </Link>
      </div>
    </main>
  );
}
