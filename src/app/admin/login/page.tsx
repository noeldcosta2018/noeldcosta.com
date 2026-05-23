"use client";

import { useState, type FormEvent } from "react";
import { createBrowserClient } from "@supabase/ssr";

/**
 * /admin/login — owner sign-in.
 *
 * Uses @supabase/ssr's createBrowserClient so the auth cookies are written
 * in a way that the server-side @supabase/ssr helper in src/lib/supabase/auth.ts
 * can read on subsequent requests. signInWithPassword issues both the
 * access + refresh cookies; the user lands at /admin/book-leads on success.
 */

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setError(
        "Supabase public env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }

    setLoading(true);
    try {
      const supabase = createBrowserClient(url, key);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      window.location.href = "/admin/book-leads";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <form
        onSubmit={onSubmit}
        noValidate
        className="bg-paper border border-corbeau/[0.08] rounded-2xl p-7 w-full max-w-sm shadow-[0_8px_24px_rgba(14,16,32,0.08)] flex flex-col gap-4"
      >
        <div>
          <p className="font-mono text-[0.7rem] tracking-[2px] uppercase text-eyebrow mb-1.5">
            Admin
          </p>
          <h1 className="font-display font-black tracking-[-0.02em] text-corbeau text-[1.5rem]">
            Sign in
          </h1>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[0.7rem] tracking-[1.5px] uppercase text-eyebrow">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="bg-paper border border-corbeau/[0.15] rounded-md px-3 py-3 text-[0.95rem] text-corbeau placeholder:text-silver focus:outline-none focus:border-papaya focus:shadow-[0_0_0_3px_rgba(252,152,90,0.10)] transition-all"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[0.7rem] tracking-[1.5px] uppercase text-eyebrow">
            Password
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="bg-paper border border-corbeau/[0.15] rounded-md px-3 py-3 text-[0.95rem] text-corbeau placeholder:text-silver focus:outline-none focus:border-papaya focus:shadow-[0_0_0_3px_rgba(252,152,90,0.10)] transition-all"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center bg-papaya text-corbeau font-bold text-[0.95rem] px-6 py-3 min-h-[44px] rounded-[10px] transition-all hover:bg-[#fb8843] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {error && (
          <p role="alert" className="text-canyon text-[0.85rem] leading-[1.5]">
            {error}
          </p>
        )}
      </form>
    </main>
  );
}
