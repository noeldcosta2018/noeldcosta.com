"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Ends the Supabase session (clears its cookies) and returns to sign-in. */
export default function SignOutButton({ url, anonKey }: { url: string | null; anonKey: string | null }) {
  async function signOut() {
    try {
      if (url && anonKey) await createBrowserClient(url, anonKey).auth.signOut();
    } finally {
      window.location.href = "/admin/login/";
    }
  }
  return (
    <button type="button" className="nd-btn nd-btn-secondary adm-btn-sm" onClick={signOut}>
      Sign out
    </button>
  );
}
