# Batch review: phase 2 SAP Universal ID page (13 October 2026)

Scope: English only, one file: `content/posts/create-and-manage-sap-universal-id-link-s-user-and-p-user-ids/en.mdx`. No URL, slug or `date` change. `updated` set to 2026-10-13. `lastReviewed`, `hero`, `heroAlt` unchanged (no body images existed or were added). `experienceSource` rewritten. No build or git run (per instruction). Translations not touched.

Search goal: the page still ranks about 6th for SAP Universal ID / S-User / SAP ID searches, but clicks fell from 1,234 to 257 a quarter because Google's AI answers take the click. Aim: be the page AI answers quote (direct definition, exact step lists, comparison table) and give a reason to click (consultant depth, super administrator, 2FA, S-User lifetime, joining and leaving checklist).

## Title, meta and H1

| Field | Old | New | Reason |
|---|---|---|---|
| title / H1 | Create and manage SAP Universal ID: link S-User and P-User | SAP Universal ID: how to link S-User and P-User IDs | Puts "SAP Universal ID" first as instructed; keeps the slug's "link S-User and P-User IDs"; "how to" matches task queries (51 chars) |
| metaTitle | SAP Universal ID 2026: How to Link S-User and P-User | SAP Universal ID 2026: Link S-User, P-User and Log In | Adds "log in" for the "sap universal id login" query (53 chars) |
| metaDescription | SAP Universal ID changed in 2026. How to link S-User and P-User accounts by email, sign in after the login change, and fix the common access errors. | What SAP Universal ID is, how to link an S-User or P-User by email since July 2026, how to log in after the January change, reset passwords and fix errors. | Adds the definition query and password reset; dated changes signal freshness (155 chars) |

## What changed

1. Opening: a two-sentence definition of SAP Universal ID, then a quotable "Short answer" block (P-User, S-User, Universal ID in three sentences). Noel's newcomer and weekly reset email lines kept in published wording; the "password spreadsheets / nightmare" phrasing dropped (not in the confirmed list).
2. Comparison table rebuilt as P-User vs S-User vs Universal ID across six rows (owner, creator, use, can you log in, expiry, when you leave). Noel's 16 years / six S-Users / one list lines kept verbatim.
3. 2026 changes: timeline component kept; list now also states the Linked status column removal and that no accounts were deleted. The "consultants step back" paragraph moved to the consultants section.
4. New H2 with seven exact step lists: create a Universal ID, link an S-User, add a P-User, reset password, remove a user, change email, turn on two-factor authentication. New paragraph separating account.sap.com (Account Manager) from accounts.sap.com (per-user profile).
5. Error table extended from 7 to 10 rows, all verified: added 24-hour reset limit, missing reset email (sso@sap.com), browser/third-party cookies, expiry with 90-day reactivation window. Removed the "Wait" advice for lockouts (no SAP source for a duration).
6. New H2 "If you hold several S-Users": per-user passwords, limits, S-User lifetime (24 months, 90-day expiring phase, emails at 30/14/2 days, self-service extension), H3 "How to find your S-User ID", H3 "How to find your company's super administrator" (Important contacts in SAP for Me, `XX-SER-FORME` when the super administrator has left, administrators cannot see Universal ID association).
7. Checklist kept (7 steps), with 2FA added to step 4 and the one-customer-number rule after it.
8. Removed: the "Getting an S-User or P-User" H2 (folded into the table and steps), the four-item S-User authorisation list, "Finance almost always has S-User access for licence reasons" (unsourced), RISE/GROW paragraph and mentions (not needed for the queries), "Your new P-User is listed on the Accounts tab" (replaced with the registration page's own wording).
9. FAQ: 7 `<details>`, phrased as the requested searches. Old FAQ items on email choice, job change, account limits and permissions folded into body sections.
10. Counts: about 2,450 words (body incl. tables and FAQ), 7 H2s, 9 H3s, 2 tables, 1 existing diagram, 0 em or en dashes, no paragraph over three sentences, no sentence over 30 words outside numbered steps. Internal links (2): BTP Cockpit guide, BTP Cockpit issues. External links: sap.com Universal ID page, account.sap.com, accounts.sap.com.

## Sources (all checked 13 October 2026)

1. SAP, "SAP Universal ID: your personal identity across SAP services" and FAQ, https://www.sap.com/account/universal-id.html (page © 2026; describes the July 2026 change as current). Used for: definition, free, personal, no longer an IdP from January 2026, SAP IAS, 13 July 2026 email association, link/unlink and Linked column removed, no accounts deleted, Accounts tab > Add accounts > passcode, Personal Info tab for primary email, KBA 2882908, 15-minute verification code, 10 emails / 100 users, one Universal ID per user, log out to switch, Account Selector sort by Login Date, delete S/P-users via company administrator, delete Universal ID via CIC, email change behaviour, leaving a company, certificate transfer by support ticket, administrators cannot see association, browsers and third-party cookies, help via support ticket or CIC.
2. SAP live registration page, https://account.sap.com/registration/ (viewed 13 October 2026, no data entered): heading "Register your SAP ID", username rules (max 30 chars, Latin letters, numbers, dashes, underscores; auto-filled if empty), "With this step you register your SAP Universal ID and a user identity that is linked to it", Terms of Use, captcha, Register button.
3. SAP Support, "SAP ID: How to change or reset your P- or S-user password" (PDF, © 2026), https://support.sap.com/content/dam/support/en_us/library/ssp/my-support/users/p-s-user_reset_password.pdf: accounts.sap.com, Forgot password?, user ID recommended, Send, "Click here to reset your password", link expires within 2 hours, 8 characters and 3 of 4 character types, Save, once every 24 hours, sso@sap.com.
4. SAP Support, "How to enable Multi-Factor Authentication (MFA)", https://support.sap.com/en/my-support/mfa.html (undated, current): TOTP Two-Factor Authentication, Activate, MS or Google Authenticator, QR code, confirmation text, Deactivate before changing device, super administrator can enforce MFA.
5. SAP Support, "S-user lifetime process", https://support.sap.com/en/my-support/users/s-user-lifetime.html (undated, current): 24-month default, 90-day expiring phase, emails at 30/14/2 days, self-service extension, 90 days disabled then deleted, cannot be restored.
6. SAP Support, "Users" page, https://support.sap.com/en/my-support/users.html: Important contacts (Super Administrator, Cloud Administrator, Security Contact) at me.sap.com/userscontacts/impcont; My authorizations & functions; `XX-SER-FORME` for user data issues.
7. SAP for Me help, User Management, https://support.sap.com/content/s4m/help/users/admin.html: Request User, activation link valid 10 days, Delete in Actions column, special-function users cannot be deleted, Deleted Users kept 12 months and cannot be reactivated, S-User cannot move to another customer number, administrators edit S-User email.
8. SAP for Me help, "User, authorization and administrator concept", https://support.sap.com/content/s4m/help/access/user-admin-concept.html: SAP creates the first S-User as super administrator, recommends at least two more, `XX-SER-FORME` case when the super administrator has left.
9. Carried from register-a (checked 7 October 2026): 20 January 2026 sunset date and August 2025 to January 2026 password window from the SAP Community blog by SAP ("Dive into the future of SAP Universal ID", ba-p/14187845); `XX-SER-UID` component from SAP KBAs. The blog returned HTTP 403 today and was not re-read.

## Unverified, corrected or for Noel

1. The exact date "20 January 2026" now appears only in the timeline component (carried from register-a). SAP's FAQ today says only "from January 2026", so body text says "January 2026".
2. Registration: the live form's input fields did not render without accepting cookies (I declined). Steps 2 and 5 (name, email, verification code) rest on SAP's FAQ and the old article, not on a field-by-field view.
3. SAP's FAQ names the button "Add accounts" in two answers and "Add Identity" in one. The article uses "Add accounts".
4. Special-function transfer: the User Management help says component `XX-SER-SAPSMP-USR`, the admin concept page says `XX-SER-FORME`. The article avoids naming a component for that step.
5. Two-factor authentication is set on each user's profile at accounts.sap.com. That you should set it on each S-User and P-User you use is my inference, so the article does not state it as SAP guidance.
6. "Treat each S-User as the client's asset, not yours" and the password manager advice are general guidance, not a Noel story.
7. "21 SAP programmes I have led or rescued" was not used: every sentence I could attach it to added an unconfirmed practice or story. Noel can supply one line if he wants it in the consultants section.
8. Lockout duration, Finance-team advice and the "Your new P-User is listed on the Accounts tab" step were cut (no current SAP source).
9. `mentions` dropped RISE with SAP and GROW with SAP (no longer in the body) and added SAP Cloud Identity Services.
10. Screen names keep SAP's US spelling ("My authorizations & functions"); prose uses British spelling.
11. Not run: build, MDX render, browser check of the explainer-timeline and blockquote. Body image rule (one inline image over 1,500 words) not met; brief said keep images as they are.
