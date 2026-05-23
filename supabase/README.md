# Supabase setup

The /books page captures leads into a private Supabase Postgres table and
serves book PDFs from a private Supabase Storage bucket via short-lived
signed URLs. Nothing here is committed in code — these are the manual
steps the project owner runs once.

## 1. Create the project

1. Go to https://supabase.com and create a new project. Free tier is fine.
2. Pick a region close to most readers.
3. Save the database password to your password manager.

## 2. Run the SQL migration

1. Open the SQL editor in the Supabase dashboard.
2. Paste the contents of `supabase/migrations/0001_book_leads.sql`.
3. Run.

This creates `public.book_leads` with RLS enabled and no client-side
policies. Reads happen only via the service-role key from the server.

## 3. Create the private storage bucket

1. Storage → New bucket.
2. Name: `book-files`.
3. PUBLIC toggle: OFF. The bucket must be private.
4. File size limit: 50 MB (or higher if needed).
5. Allowed MIME types: `application/pdf`.

## 4. Upload the book PDFs

Upload these three files into the `book-files` bucket. Names must match
the `storagePath` field in each MDX file exactly:

- `sap-careers-200k-ai-era.pdf`
- `enterprise-ai-what-works.pdf`
- `autonomous-agents-enterprise.pdf`

The paid book (`sap-career-playbook-ai-era.pdf`) can be uploaded once it
exists. The free-book download flow does not depend on it.

## 5. Create the admin user

1. Authentication → Users → Add user → "Create new user".
2. Email: `noeldcosta2018@gmail.com` (this is the email the admin guard
   checks against — change it in `src/lib/supabase/auth.ts` if you want a
   different admin).
3. Choose a strong password. Save it to your password manager.
4. Toggle "Auto Confirm User" so the user is active immediately.

The admin guard at `src/lib/supabase/auth.ts` rejects anyone whose
authenticated email does not match `ADMIN_EMAIL`. Other Supabase users
can exist; they just cannot see the admin pages.

## 6. Copy the API credentials

Project Settings → API. Copy these three values:

- Project URL → `SUPABASE_URL`
- `anon` public key → `SUPABASE_ANON_KEY`
- `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

The `service_role` key bypasses RLS. Treat it like a database password.
NEVER expose it client-side. The code uses it only inside route handlers
(`src/app/api/.../route.ts`).

## 7. Wire env vars

Local (`.env.local`):

```
# Server-only (route handlers, server components)
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Browser-exposed (admin login form uses signInWithPassword in the browser)
# Same URL + anon key, just with the NEXT_PUBLIC_ prefix so they ship to the bundle.
# The service-role key MUST NOT be prefixed with NEXT_PUBLIC_ — keep it server-only.
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Vercel: Project → Settings → Environment Variables. Add the same five
keys for Production, Preview, and Development environments. Redeploy.

## 8. Smoke test

Local:

```
npm run dev
```

Then:

1. Open http://localhost:3000/books
2. Click "Get the book" on any free book
3. Submit the form with your real email
4. Check Supabase → Table editor → `book_leads` for the new row
5. If the storage bucket has the matching PDF, the modal should also
   render a "Download now" button with a 10-minute signed URL

Admin:

1. Open http://localhost:3000/admin/login
2. Sign in with `noeldcosta2018@gmail.com` and the password from step 5
3. You should land on `/admin/book-leads` with the table visible
4. Anyone signing in with a different email gets "Access denied"

## What this setup does NOT include

- Email delivery of the download link. That requires an ESP (ConvertKit,
  Postmark, Resend, etc.) and a Supabase Edge Function or a separate
  worker. The signed URL returned by `/api/books/leads` is enough for
  the inline modal flow today.
- Stripe checkout for paid books. The leads API returns a graceful
  fallback for paid books until Stripe is wired.
- A Supabase migration runner. The single SQL file above is run manually
  in the dashboard. Add the Supabase CLI later if migration count grows.
