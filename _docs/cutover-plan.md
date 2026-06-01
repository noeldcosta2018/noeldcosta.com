# DNS cutover plan — noeldcosta.com → Vercel

The execution playbook for taking the `staging-gtranslate-test` branch
to production. Block 8 verified the branch is functionally ready; this
doc captures the operational steps to flip DNS and the rollback path
if something breaks.

**Last reviewed:** 2026-06-01
**Branch:** `staging-gtranslate-test`
**Head commit at writing:** `8e98048`

---

## 1. DNS change plan

### Current state (verified 2026-06-01 via `nslookup noeldcosta.com`)

```
noeldcosta.com  A   77.37.66.211
noeldcosta.com  A   191.101.228.68
noeldcosta.com  AAAA 2a02:4780:15:48ff:1a0b:8f67:1f2f:da38
noeldcosta.com  AAAA 2a02:4780:39:5fcf:fd4d:1dc6:1d4:cb82
```

These point at the current shared host (likely Hostinger based on the
4780/15:: prefix). Two A records and two AAAA records means the DNS
provider is round-robining or providing failover; both pairs need to
be reverted together if a rollback is needed.

### Target state

Vercel provides the destination records when the custom domain is
added. The shape depends on whether the apex (`noeldcosta.com`) or a
subdomain is being pointed:

- **Apex `noeldcosta.com`** — typically a single A record
  to `76.76.21.21` (Vercel's anycast IP). Some registrars require an
  ALIAS/ANAME record instead of CNAME on the apex; the registrar's UI
  will allow only what they support.
- **`www.noeldcosta.com`** — CNAME to `cname.vercel-dns.com`.

Confirm the exact records Vercel shows on the **Project Settings →
Domains → Add `noeldcosta.com`** screen before changing DNS — Vercel
sometimes provisions per-account IPs that differ from the published
`76.76.21.21`.

### Pre-cutover steps (no public impact yet)

1. In Vercel: **Project Settings → Domains → Add Domain** →
   `noeldcosta.com`. Vercel shows the required DNS records and starts
   a Let's Encrypt cert provision in parallel (1-2 minutes once DNS
   resolves).
2. Note the exact records Vercel provides — they go in the DNS
   change.
3. Add `www.noeldcosta.com` as a second domain on the same Vercel
   project so the redirect works either way visitors arrive.
4. Verify HTTPS auto-renews and that no SSL cert error shows in
   Vercel's domain status panel.

### DNS change at the registrar

Lower the TTL on the existing A/AAAA records to **300 seconds (5
minutes)** at least 24 hours before the change. This caps propagation
delay during the cutover so a rollback can land fast if needed.

At cutover:

1. Update the A records for `noeldcosta.com` to the Vercel-provided
   IP (likely `76.76.21.21`).
2. Update the AAAA records to whatever Vercel provides (or remove if
   Vercel doesn't supply IPv6 for the account tier).
3. Set CNAME `www` → `cname.vercel-dns.com`.
4. Save.

### Propagation timing

With TTL pre-lowered to 300 s, most resolvers see the new records
within 5-15 minutes. Some ISP-side resolvers cache longer; full global
propagation typically 1-2 hours, occasionally up to 24 hours. Vercel
will issue and install the Let's Encrypt cert automatically once DNS
resolves — usually within minutes of propagation.

### Recommended cutover window

- **Best:** a weekend morning UTC+4 (Dubai) — captures GCC trough plus
  EU/US dawn for the bulk of the target audience.
- **Avoid:** any time within 24 hours of a known content push,
  Search Console submission, or an outbound email/LinkedIn
  announcement that drives a traffic spike.

---

## 2. Environment variables — pre-cutover requirement

Production Vercel **must have** these env vars configured under
**Project Settings → Environment Variables → Production scope**
before DNS cuts over. Block 8 Pass 8-4 verified the API endpoints
return clear "missing env vars" errors when these are absent — the
fix is configuration, not code.

| Variable | Used by | Scope | Source |
|---|---|---|---|
| `SUPABASE_URL` | `/api/books/leads`, `/api/admin/leads` | Server | Supabase project settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `/api/books/leads` (lead inserts + signed URL generation) | Server | Supabase project settings → API → service_role key |
| `SUPABASE_ANON_KEY` | `/api/admin/leads` (RLS-gated reads) | Client | Supabase project settings → API → anon key |
| `OPENAI_API_KEY` | `/api/tools/[tool]` (calculator AI summaries via the Anthropic SDK) | Server | OpenAI dashboard (note: name is historic; the SDK is Anthropic) |
| `NEXT_PUBLIC_SITE_URL` | SEO canonicals, JSON-LD | Both | `https://noeldcosta.com` |

Plus any other variables referenced in the codebase that aren't in
`.env.example` (which doesn't exist yet — see backlog item). Spot-check
with `grep -rE 'process\.env\.[A-Z_]+' src/` if in doubt.

**Verification before cutover:** with the env vars in place, hit the
production deployment's `/api/books/leads` (POST with a valid book
slug) — it should return a signed download URL, not the "missing env
vars" 500.

---

## 3. GTranslate cancellation

### Where it lives

GTranslate sits on the WordPress origin at the current 77.37.66.211 /
191.101.228.68 IP. Account access is in the WordPress site admin (the
plugin authenticates against GTranslate's account on plugin install).

### Subscription status

Check before cutover at: <https://dashboard.gtranslate.io/> →
Subscriptions tab. Confirm the current billing cycle and any auto-
renew settings. Take a screenshot for the cutover log.

### Cancellation timing — AFTER DNS cuts and stabilises

Cancel **only after** the new site has been live and stable for at
least 24 hours, ideally 7 days. The reasoning:

- If DNS is rolled back to the WordPress origin (Section 4), GTranslate
  on the WordPress side needs to still be working — translated URLs
  must keep serving for the 64.5% of organic traffic that comes from
  them.
- Cancelling GTranslate pre-cutover or during the cutover window means
  a rollback returns traffic to a site that no longer translates.
  Recovery would require a fresh GTranslate provisioning + DNS
  propagation wait, during which translated-URL traffic 404s or
  serves English to non-English visitors.

### Data archival before cancellation

GTranslate caches translation memory (TM) per language. If the cache
has meaningful corrections beyond machine translation, export it via:

- Dashboard → URL Translation Editor → Export → CSV per language.

The 10 routed locales' translations are now self-hosted in Next.js
MDX (via `scripts/translate-content.mjs` + per-locale `messages.<lang>.ts`
files), so the GTranslate cache is unlikely to contain anything
unique. Worth a 5-minute scan before clicking Cancel to be sure.

### Confirmation

Capture the cancellation confirmation email + final invoice in
`_docs/launch/` so there's a paper trail.

---

## 4. Rollback procedure

### When to roll back vs fix forward

| Symptom | Action |
|---|---|
| Cosmetic glitch on one page (Block 6c-style noTranslate leak, RTL accent on wrong side) | Fix forward — patch + re-deploy via Vercel preview, then promote |
| `<1%` of traffic affected (e.g. one less-trafficked locale broken) | Fix forward |
| Critical functionality broken (lead capture, calculators, payments) for English users | Roll back |
| `>10%` of traffic affected | Roll back |
| Cannot diagnose root cause within 30 minutes of detection | Roll back regardless — diagnose in calmer conditions |

### Vercel deployment rollback (fast — minutes)

If the issue is on the Next.js side and DNS is correct, roll back the
Next.js deployment without touching DNS:

1. Vercel → Project → Deployments
2. Find the last known-good deployment (the one before the bad merge to
   `master` / the one before the broken Block deploy)
3. ⋯ menu → **Promote to Production**
4. Vercel re-points the production alias at that deployment within ~30
   seconds. Edge cache invalidates automatically.

This is **effective immediately**. No DNS wait. Use this path 95% of the
time.

### DNS rollback (slow — TTL-bound)

If the Vercel deployment can't be salvaged or Vercel itself is
unreachable:

1. At the registrar: revert A records to `77.37.66.211`,
   `191.101.228.68` and AAAA records to
   `2a02:4780:15:48ff:1a0b:8f67:1f2f:da38`,
   `2a02:4780:39:5fcf:fd4d:1dc6:1d4:cb82`.
2. Revert CNAME `www` to whatever it was before (capture this before
   the change — `dig www.noeldcosta.com` results pre-cutover).
3. Wait for TTL expiration. With the 300 s TTL set pre-cutover, most
   resolvers refresh within 15 minutes. Globally, allow up to 24 hours.

### GTranslate restoration (only if cancelled prematurely)

If GTranslate was cancelled before the rollback decision:

1. Re-subscribe at <https://dashboard.gtranslate.io/>.
2. Re-import the CSV exports captured in Section 3 (if any
   corrections were custom).
3. Verify translated URLs return content (not 404 or English) on
   the WordPress origin before pointing DNS back.

This is a **slow** path (potentially hours including subscription
re-provisioning + plugin sync). Avoiding it is why Section 3
recommends cancelling only after 24 h stability.

### Communication plan

- **First 30 minutes of an issue:** internal triage only. No public
  announcement. The site appearing broken to a small set of
  resolver-cached users is not a crisis if it resolves in minutes.
- **30 minutes to 2 hours:** if rolling back, post to LinkedIn / X
  with a brief "site maintenance" note (template below). Do not
  detail the failure cause until the post-mortem.
- **Post-rollback:** LinkedIn / X announcement template:
  > "Brief site maintenance window — noeldcosta.com is back up.
  > Apologies for the interruption. If you tried to reach me in the
  > last hour and couldn't, please retry now or DM."

LinkedIn migration announcement (which is the big launch signal) holds
until cutover is verified stable at the 24-hour mark.

---

## 5. Pre-cutover checklist

### Block 8 verification

- [x] **Pass 8-1**: 60/60 substantive routes verified (homepage,
  article, category, tag, about × 10 locales + EN). 10 `/[lang]/books/`
  documented as English-only-by-design.
- [x] **Pass 8-1.5**: sitemap fix verified live — `/books/` once,
  calculator routes × 11 locales.
- [x] **Pass 8-2**: SEO outputs verified — sitemap hreflang
  reciprocal, page-level hreflang via Next.js Metadata API (12 per
  page), robots.ts production behaviour confirmed by code review,
  canonical + og:locale per-locale.
- [x] **Pass 8-3**: Lighthouse baseline captured at
  `_docs/lighthouse-baseline.md`. SEO=69 / Perf 47-73 expected to
  auto-improve at cutover (robots unlocks, edge cache warms).
- [x] **Pass 8-4**: Functional verification — API surface and SSR
  markup verified via curl. Interactive flows documented as needing
  manual smoke test (Section 6).
- [x] **Pass 8-4.5**: `/api/books/leads` runtime fix landed via
  `src/lib/books-registry.ts`.
- [x] **Pass 8-5**: native-speaker review batch prepared at
  `_docs/native-review-batch-1.md` for ja + ar.
- [x] **Pass 8-6**: this document.

### User pre-cutover tasks

- [ ] Native review of batch-1 completed (Japanese + Arabic
  spot-check). 13 strings each. Mark OK / minor / major / wrong.
- [ ] Critical issues from native review (any "major" or "wrong")
  fixed via `--keys` re-translation. Cost ~$0.01-0.05 per fix.
- [ ] **Manual 10-minute browser smoke test** completed:
  1. `/` → LanguageSwitcher → ja → expect `/ja/`. Repeat
     `/ja/` → ar → `/ar/`. Repeat `/ar/` → en → `/`.
  2. `/books/` → click any free book → modal opens → fill name +
     email (throwaway) → submit. Expect success with download URL
     (assuming Supabase env vars configured) OR documented 500 if
     not.
  3. `/sap-implementation-cost-calculator/` → fill Step 1 → Continue
     → Step 2 renders.
  4. `/sap-solution-builder/` → Step 1 → Step 2.
  5. `/contact-noel-erp-support/` → "Book a 30-min call" link →
     opens calendly.com in new tab.
- [ ] Vercel production env vars configured (Section 2 table). Spot-
  test `/api/books/leads` on production deployment.
- [ ] DNS TTL pre-lowered to 300 s at least 24 h before cutover.
- [ ] DNS change scheduled with a tracking ticket (date / time /
  reverter named).
- [ ] Rollback plan (Section 4) re-read by the person executing the
  cutover. Old A/AAAA values memorised or written down.
- [ ] **Decision**: proceed with cutover (this checklist signed off).

### Post-cutover verification — within first hour

- [ ] Production noeldcosta.com returns 200 for `/`, `/ja/`, `/ar/`,
  `/de/`, `/es/`, `/fr/`, `/it/`, `/nl/`, `/pt/`, `/ru/`, `/el/`.
- [ ] `/sitemap.xml` accessible and renders correctly.
- [ ] `/robots.txt` switched to **production mode** (allows crawling
  by default, has the AI crawler allowlist, disallows `/intl/`).
  Confirms `VERCEL_ENV === "production"` is taking effect.
- [ ] `/api/books/leads` returns success on a test submission (with
  Supabase configured).
- [ ] `/api/tools/sap-implementation-cost-calculator` returns the AI
  streaming response on a well-formed POST.
- [ ] LanguageSwitcher routes correctly on the live origin (repeat
  the smoke test on `noeldcosta.com/`).
- [ ] No JavaScript errors in browser console on `/`, `/ja/`, `/ar/`,
  `/sap-implementation/`.
- [ ] No 5xx errors in Vercel function logs (Project → Logs).
- [ ] Vercel edge cache shows `X-Vercel-Cache: HIT` on second
  request for the top-trafficked URLs.

### Post-cutover verification — within 24 hours

- [ ] Google Search Console: re-add `noeldcosta.com` as a property
  (Vercel may need DNS verification), submit `/sitemap.xml`.
- [ ] Re-run Lighthouse on the 6 baseline URLs from Pass 8-3
  (`/`, `/ja/`, `/ar/`, `/sap-implementation/`, `/ja/sap-implementation/`,
  `/ar/sap-implementation/`). Document the new numbers in
  `_docs/lighthouse-baseline.md` under a "Post-cutover" section.
  Expected: SEO 69 → **100**, Perf **+10-20** points.
- [ ] Edge cache HIT rate from Vercel analytics > 90%.
- [ ] No spike in 404s in Vercel analytics — every WordPress URL
  still maps 1:1 (per the migration contract).
- [ ] GTranslate cancellation **initiated** (Section 3).
- [ ] LinkedIn migration announcement posted (if separate from any
  rollback comms in Section 4).

---

## 6. Manual browser smoke test (deferred from Pass 8-4)

Three interactive flows that Pass 8-4 documented as needing a real
browser (Chrome MCP was unresponsive on the preview domain during the
agent session). All three are pre-cutover gates in Section 5.

1. **LanguageSwitcher click → route resolution**: the floating widget
   on every page. Pass 8-1 verified the 60 destination URLs return
   200 with correct lang/dir; Pass 8-4 left the actual click handler
   path unverified.
2. **Lead capture modal end-to-end**: `/books/` → modal → submit.
   Pass 8-4.5 verified the API endpoint resolves slugs correctly via
   the inline registry; Pass 8-4 left the modal → fetch → response-
   handling UI path unverified.
3. **Calculator Step 1 → Step 2 transitions**: all 5 calculators.
   Pass 8-1 confirmed Step 1 forms render in SSR HTML; the
   client-state machine that advances to Step 2 needs a browser.

If any of these fails in the smoke test, treat as a **cutover
blocker** — investigate and fix before DNS change.

---

## 7. Backup considerations

### WordPress origin snapshot

Before DNS change, take a snapshot of the current WordPress site state
in case a full restore is needed weeks later (e.g. if an issue surfaces
that requires comparing old vs new behaviour):

1. Hostinger (or current host) → File Manager → archive the WordPress
   directory.
2. Database dump via phpMyAdmin or the host's backup tool.
3. Store both archives somewhere durable (S3, Google Drive, local NAS).
   Tag with the cutover date.

### Supabase database

Supabase Pro/Team plans include automatic daily backups with 7-day
retention by default. Verify before cutover:

1. Supabase dashboard → Project → Database → Backups.
2. Confirm at least one backup exists from within the last 24 hours.
3. If on the Free tier, manually trigger a backup via the dashboard or
   `pg_dump` against the connection string.

The relevant table at cutover is `public.book_leads` (lead capture
submissions). Currently expected to be empty or near-empty since the
endpoint has been broken — verify post-cutover that new submissions
land.

### Vercel project configuration

Vercel project settings (env vars, domain config, deploy hooks) can be
exported via the dashboard for disaster recovery. Optional but cheap
insurance:

1. Vercel → Project Settings → Environment Variables → screenshot
   the list (values redacted).
2. Vercel → Project Settings → Domains → screenshot the records.

### Branch state

The `staging-gtranslate-test` branch IS the cutover artifact. Once
merged to `master` and tagged at cutover (e.g. `v1.0-cutover-2026-MM-DD`),
the tag is the durable reference. Don't rebase or force-push the
branch after merge.

---

## What "Block 8 done" means

This document plus `_docs/block-8-summary.md` plus `_docs/native-review-batch-1.md`
plus `_docs/lighthouse-baseline.md` together capture every verification
gate from Phase 4 Block 8. Once the **user pre-cutover tasks** above
are signed off, the branch is ready to merge to `master` and Phase 5
(the cutover itself) can begin.
