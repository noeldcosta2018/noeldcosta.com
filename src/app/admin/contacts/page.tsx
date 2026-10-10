import ContactsTable from "@/components/admin/ContactsTable";
import AdminShell, { AdminErrors } from "@/components/admin/AdminShell";
import { AdminDenied, adminGuard } from "@/components/admin/guard";
import { SOURCE_LABELS, loadAudience } from "@/lib/audience";

/**
 * /admin/contacts (People): everyone who gave an email to noeldcosta.com
 * (sign-ups, meeting requests, book leads) or ERPCV (newsletter, customers,
 * advisory requests, first-version profiles and orders), one row per email,
 * with the newsletter status and CSV exports.
 */

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const guard = await adminGuard();
  if (!guard.ok) return <AdminDenied reason={guard.reason} />;

  const { contacts, errors } = await loadAudience();

  return (
    <AdminShell
      active="people"
      title="People"
      email={guard.user?.email}
      intro="noeldcosta.com and ERPCV in one list, one row per email. Only people marked Subscribed should get the newsletter."
    >
      <AdminErrors title="Some sources could not be read" errors={errors} />
      <ContactsTable contacts={contacts} sourceLabels={SOURCE_LABELS} />
    </AdminShell>
  );
}
