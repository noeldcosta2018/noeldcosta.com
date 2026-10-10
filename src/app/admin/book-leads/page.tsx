import BookLeadsTable from "@/components/admin/BookLeadsTable";
import AdminShell, { AdminErrors } from "@/components/admin/AdminShell";
import { AdminDenied, adminGuard } from "@/components/admin/guard";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getAllBooks } from "@/lib/books";

/**
 * /admin/book-leads: every captured /books lead. Initial leads and the book
 * filter options are fetched server-side so the first paint is meaningful.
 */

export const dynamic = "force-dynamic";

const INITIAL_LIMIT = 50;

interface Lead {
  id: string;
  name: string;
  email: string;
  book_title: string;
  book_slug: string;
  book_type: "free" | "paid";
  source_page: string;
  created_at: string;
  consent_accepted: boolean;
}

export default async function BookLeadsPage() {
  const guard = await adminGuard();
  if (!guard.ok) return <AdminDenied reason={guard.reason} />;

  let initialLeads: Lead[] = [];
  let initialTotal = 0;
  let fetchError: string | null = null;
  try {
    const { data, count, error } = await getSupabaseAdmin()
      .from("book_leads")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(0, INITIAL_LIMIT - 1);
    if (error) fetchError = error.message;
    else {
      initialLeads = (data ?? []) as Lead[];
      initialTotal = count ?? 0;
    }
  } catch (e) {
    fetchError = e instanceof Error ? e.message : "Server error.";
  }

  const bookOptions = getAllBooks().map((b) => ({ slug: b.frontmatter.slug, title: b.frontmatter.title }));

  return (
    <AdminShell active="books" title="Book leads" email={guard.user?.email} intro="People who asked for a book on noeldcosta.com/books.">
      <AdminErrors title="Couldn't load leads" errors={fetchError ? [fetchError] : []} />
      {!fetchError && (
        <BookLeadsTable initialLeads={initialLeads} initialTotal={initialTotal} bookOptions={bookOptions} initialLimit={INITIAL_LIMIT} />
      )}
    </AdminShell>
  );
}
