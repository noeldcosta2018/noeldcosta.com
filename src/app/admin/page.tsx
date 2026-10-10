import OverviewView from "@/components/admin/OverviewView";
import { AdminDenied, adminGuard } from "@/components/admin/guard";
import { loadOverview } from "@/lib/admin-metrics";

/**
 * /admin/: key numbers for noeldcosta.com, ERPCV and SAPopedia in one place,
 * plus the latest activity across them. Everything comes from the one
 * Supabase project (ERPCV3). Lists with names and emails live on the People,
 * Meetings and Book leads pages.
 */

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const guard = await adminGuard();
  if (!guard.ok) return <AdminDenied reason={guard.reason} />;
  return <OverviewView data={await loadOverview()} email={guard.user?.email} />;
}
