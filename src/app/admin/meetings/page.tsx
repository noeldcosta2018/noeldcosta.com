import AdminShell, { AdminErrors } from "@/components/admin/AdminShell";
import { AdminDenied, adminGuard } from "@/components/admin/guard";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { CALENDLY_URL } from "@/data/site-menu";

/**
 * /admin/meetings: every meeting request sent through the site (the contact
 * page form and the chat), newest first, with what the person wrote.
 * Bookings made directly in Calendly live in Calendly, not here.
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
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai" });

export default async function MeetingsPage() {
  const guard = await adminGuard();
  if (!guard.ok) return <AdminDenied reason={guard.reason} />;

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
    <AdminShell
      active="meetings"
      title="Meeting requests"
      email={guard.user?.email}
      intro={
        <>
          Sent through the contact form and the chat, newest first. Calls booked directly on{" "}
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
            Calendly
          </a>{" "}
          are in your Calendly account. Times are UAE time.
        </>
      }
    >
      <AdminErrors title="Couldn't load meeting requests" errors={fetchError ? [fetchError] : []} />
      {!fetchError &&
        (requests.length === 0 ? (
          <div className="adm-empty">No meeting requests yet.</div>
        ) : (
          <div className="adm-table">
            <table>
              <thead>
                <tr>
                  <th>Received</th>
                  <th>Name and email</th>
                  <th>Company and role</th>
                  <th>Topic</th>
                  <th>Details</th>
                  <th>Preferred time</th>
                  <th>From</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((m) => (
                  <tr key={m.id}>
                    <td className="mono">{when(m.created_at)}</td>
                    <td>
                      <b style={{ color: "var(--ink)" }}>{m.name}</b>
                      <br />
                      <a href={`mailto:${m.email}`}>{m.email}</a>
                    </td>
                    <td>{[m.company, m.role].filter(Boolean).join(", ")}</td>
                    <td>{m.topic}</td>
                    <td style={{ maxWidth: "40ch", whiteSpace: "pre-line" }}>{m.details}</td>
                    <td>{m.preferred_time}</td>
                    <td>{SOURCE_LABEL[m.source] ?? m.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </AdminShell>
  );
}
