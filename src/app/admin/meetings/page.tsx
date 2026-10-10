import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { CALENDLY_URL } from "@/data/site-menu";

/**
 * /admin/meetings: every meeting request sent through the site (the contact
 * page form and the chat), newest first, with what the person wrote.
 * Bookings made directly in Calendly live in Calendly, not here.
 * Guarded server-side like /admin/contacts.
 */

export const dynamic = "force-dynamic";

interface MeetingRequest {
  id: string;
  name: string;
  email: string;
  company: string | null;
  role: string | null;
  topic: string | null;
  details: string | null;
  preferred_time: string | null;
  source: string;
  status: string;
  created_at: string;
}

const SOURCE_LABEL: Record<string, string> = { contact: "Contact page", chatbot: "Chat" };
const th = "px-3 py-2.5 font-mono text-[0.7rem] tracking-[1.5px] uppercase text-eyebrow";
const td = "px-3 py-2.5 text-night text-[0.85rem]";

export default async function MeetingsPage() {
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

  let requests: MeetingRequest[] = [];
  let fetchError: string | null = null;
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("nd_meeting_requests")
      .select("id,name,email,company,role,topic,details,preferred_time,source,status,created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) fetchError = error.message;
    else requests = (data ?? []) as MeetingRequest[];
  } catch (e) {
    fetchError = e instanceof Error ? e.message : "Server error.";
  }

  return (
    <main className="px-6 py-10 md:px-10 md:py-14 max-w-[1280px] mx-auto">
      <header className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="font-mono text-[0.7rem] tracking-[2px] uppercase text-eyebrow mb-1.5">Admin</p>
          <h1 className="font-display font-black tracking-[-0.03em] text-corbeau text-[1.8rem] md:text-[2.2rem]">
            Meeting requests
          </h1>
          <p className="text-night text-[0.92rem] leading-[1.55] mt-1 max-w-[80ch]">
            Requests sent through the contact form and the chat. Calls booked directly on{" "}
            <a href={CALENDLY_URL} className="underline" target="_blank" rel="noopener noreferrer">
              Calendly
            </a>{" "}
            are in your Calendly account. Signed in as {guard.user?.email}
          </p>
        </div>
        <nav className="flex gap-4 text-[0.9rem]">
          <Link href="/admin/contacts" className="text-night underline">
            Contacts
          </Link>
          <span className="font-bold text-corbeau">Meetings</span>
          <Link href="/admin/book-leads" className="text-night underline">
            Book leads
          </Link>
        </nav>
      </header>

      {fetchError ? (
        <div className="bg-canyon/10 border border-canyon/30 rounded-xl p-4">
          <p className="text-corbeau text-[0.9rem] mb-1 font-semibold">Couldn&apos;t load meeting requests</p>
          <p className="text-night text-[0.85rem] font-mono">{fetchError}</p>
        </div>
      ) : (
        <>
          <p className="font-mono text-[0.75rem] text-night mb-3">{requests.length} requests</p>
          <div className="overflow-x-auto rounded-xl border border-corbeau/[0.08] bg-paper">
            <table className="w-full text-left">
              <thead className="bg-cream">
                <tr>
                  <th className={th}>Received</th>
                  <th className={th}>Name and email</th>
                  <th className={th}>Company and role</th>
                  <th className={th}>Topic</th>
                  <th className={th}>Details</th>
                  <th className={th}>Preferred time</th>
                  <th className={th}>From</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-night text-center">
                      No meeting requests yet.
                    </td>
                  </tr>
                ) : (
                  requests.map((m) => (
                    <tr key={m.id} className="border-t border-corbeau/[0.06] align-top">
                      <td className={`${td} font-mono text-[0.78rem] whitespace-nowrap`}>{m.created_at.slice(0, 16).replace("T", " ")}</td>
                      <td className={td}>
                        <span className="text-corbeau font-semibold">{m.name}</span>
                        <br />
                        <a href={`mailto:${m.email}`} className="font-mono text-[0.8rem] underline">
                          {m.email}
                        </a>
                      </td>
                      <td className={td}>{[m.company, m.role].filter(Boolean).join(", ")}</td>
                      <td className={td}>{m.topic}</td>
                      <td className={`${td} max-w-[40ch] whitespace-pre-line`}>{m.details}</td>
                      <td className={td}>{m.preferred_time}</td>
                      <td className={td}>{SOURCE_LABEL[m.source] ?? m.source}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
