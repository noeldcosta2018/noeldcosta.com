import Link from "next/link";
import ContactsTable from "@/components/admin/ContactsTable";
import { requireAdmin } from "@/lib/supabase/auth";
import { SOURCE_LABELS, loadAudience } from "@/lib/audience";

/**
 * /admin/contacts: everyone who gave an email to noeldcosta.com (sign-ups,
 * meeting requests, book leads) or ERPCV (newsletter, customers, advisory
 * requests, first-version profiles and orders), one row per email, with the
 * newsletter status. Guarded server-side like /admin/book-leads.
 */

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-16">
        <div className="bg-paper border border-corbeau/[0.08] rounded-2xl p-7 max-w-md w-full text-center">
          <h1 className="font-display font-black text-corbeau text-[1.5rem] mb-3">Access denied</h1>
          <p className="text-night text-[0.92rem] mb-4">
            {guard.reason === "not signed in" ? "You need to sign in to see this page." : "This account does not have access."}
          </p>
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center bg-papaya text-corbeau font-bold text-[0.9rem] px-5 py-3 min-h-[44px] rounded-[10px] no-underline"
          >
            Go to sign in
          </Link>
        </div>
      </main>
    );
  }

  const { contacts, errors } = await loadAudience();

  return (
    <main className="px-6 py-10 md:px-10 md:py-14 max-w-[1280px] mx-auto">
      <header className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="font-mono text-[0.7rem] tracking-[2px] uppercase text-eyebrow mb-1.5">Admin</p>
          <h1 className="font-display font-black tracking-[-0.03em] text-corbeau text-[1.8rem] md:text-[2.2rem]">
            Contacts
          </h1>
          <p className="text-night text-[0.92rem] leading-[1.55] mt-1">
            noeldcosta.com and ERPCV in one list, one row per email. Signed in as {guard.user?.email}
          </p>
        </div>
        <nav className="flex gap-4 text-[0.9rem]">
          <span className="font-bold text-corbeau">Contacts</span>
          <Link href="/admin/book-leads" className="text-night underline">
            Book leads
          </Link>
        </nav>
      </header>

      {errors.length > 0 && (
        <div className="bg-canyon/10 border border-canyon/30 rounded-xl p-4 mb-6">
          <p className="text-corbeau text-[0.9rem] mb-1 font-semibold">Some sources could not be read</p>
          <p className="text-night text-[0.85rem] font-mono whitespace-pre-line">{errors.join("\n")}</p>
        </div>
      )}

      <ContactsTable contacts={contacts} sourceLabels={SOURCE_LABELS} />
    </main>
  );
}
