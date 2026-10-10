"use client";

import { useState, type FormEvent } from "react";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Owner sign-in form. The Supabase URL and public (anon) key come from the
 * server's SUPABASE_URL / SUPABASE_ANON_KEY, the same project the admin pages
 * check, so the session cookie is always the one they read. (They used to
 * come from NEXT_PUBLIC_* variables, which pointed at a different project.)
 */
export default function LoginForm({ url, anonKey }: { url: string | null; anonKey: string | null }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    if (!url || !anonKey) {
      setError("The admin is not connected to the database yet (SUPABASE_URL and SUPABASE_ANON_KEY are missing).");
      return;
    }
    setLoading(true);
    try {
      const { error: signInError } = await createBrowserClient(url, anonKey).auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message === "Invalid login credentials" ? "That email and password do not match." : signInError.message);
        return;
      }
      window.location.href = "/admin/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="adm-panel">
      <div className="nd-eyebrow">Admin</div>
      <h1 className="nd-display adm-h1">Sign in</h1>
      <label className="adm-field">
        <span>Email</span>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </label>
      <label className="adm-field">
        <span>Password</span>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      </label>
      <button type="submit" disabled={loading} className="nd-btn nd-btn-primary">
        {loading ? "Signing in…" : "Sign in"}
      </button>
      {error && (
        <p role="alert" className="adm-error">
          {error}
        </p>
      )}
    </form>
  );
}
