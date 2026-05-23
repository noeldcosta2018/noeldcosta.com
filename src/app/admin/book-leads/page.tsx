import BookLeadsTable from "@/components/admin/BookLeadsTable";
import { requireAdmin } from "@/lib/supabase/auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getAllBooks } from "@/lib/books";

/**
 * /admin/book-leads — protected list view of every captured /books lead.
 *
 * Guard is server-side. Anyone hitting this page without a valid Supabase
 * session whose email matches ADMIN_EMAIL gets the AccessDenied screen.
 * Initial leads + book filter options are fetched server-side so the
 * first paint is meaningful.
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

function AccessDenied({ reason }: { reason?: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="bg-paper border border-corbeau/[0.08] rounded-2xl p-7 max-w-md w-full text-center">
        <p className="font-mono text-[0.7rem] tracking-[2px] uppercase text-eyebrow mb-2">
          Admin
        </p>
        <h1 className="font-display font-black tracking-[-0.02em] text-corbeau text-[1.5rem] mb-3">
          Access denied
        </h1>
        <p className="text-night text-[0.92rem] leading-[1.55] mb-4">
          {reason === "not signed in"
            ? "You need to sign in to see this page."
            : "This account does not have access."}
        </p>
        <a
          href="/admin/login"
          className="inline-flex items-center justify-center bg-papaya text-corbeau font-bold text-[0.9rem] px-5 py-3 min-h-[44px] rounded-[10px] no-underline transition-all hover:bg-[#fb8843]"
        >
          Go to sign in
        </a>
      </div>
    </main>
  );
}

export default async function BookLeadsPage() {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return <AccessDenied reason={guard.reason} />;
  }

  // Pull books for the filter dropdown. Service role bypasses RLS.
  let initialLeads: Lead[] = [];
  let initialTotal = 0;
  let fetchError: string | null = null;
  try {
    const supabase = getSupabaseAdmin();
    const { data, count, error } = await supabase
      .from("book_leads")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(0, INITIAL_LIMIT - 1);
    if (error) {
      fetchError = error.message;
    } else {
      initialLeads = (data ?? []) as Lead[];
      initialTotal = count ?? 0;
    }
  } catch (e) {
    fetchError = e instanceof Error ? e.message : "Server error.";
  }

  const bookOptions = getAllBooks().map((b) => ({
    slug: b.frontmatter.slug,
    title: b.frontmatter.title,
  }));

  return (
    <main className="px-6 py-10 md:px-10 md:py-14 max-w-[1280px] mx-auto">
      <header className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="font-mono text-[0.7rem] tracking-[2px] uppercase text-eyebrow mb-1.5">
            Admin
          </p>
          <h1 className="font-display font-black tracking-[-0.03em] text-corbeau text-[1.8rem] md:text-[2.2rem]">
            Book leads
          </h1>
          <p className="text-night text-[0.92rem] leading-[1.55] mt-1">
            Signed in as {guard.user?.email}
          </p>
        </div>
      </header>

      {fetchError ? (
        <div className="bg-canyon/10 border border-canyon/30 rounded-xl p-4">
          <p className="text-corbeau text-[0.9rem] mb-1 font-semibold">
            Couldn&apos;t load leads
          </p>
          <p className="text-night text-[0.85rem] font-mono">{fetchError}</p>
        </div>
      ) : (
        <BookLeadsTable
          initialLeads={initialLeads}
          initialTotal={initialTotal}
          bookOptions={bookOptions}
          initialLimit={INITIAL_LIMIT}
        />
      )}
    </main>
  );
}
