import { NextResponse, type NextRequest } from "next/server";
import {
  RTL_LOCALES,
  isTargetLanguage,
  type Locale,
} from "@/lib/locales";

// Locale detection runs in the proxy (Next.js 16's renamed middleware) so the
// root layout can read it from request headers and emit the correct
// <html lang dir> on the SSR'd response. The proxy sees the request's original
// pathname (before the /:lang(...)/* → /intl/:lang/* rewrite in next.config.ts
// is applied), so `/ja/sap-implementation/` and direct hits to
// `/intl/ja/sap-implementation/` both resolve to `ja`. Everything else falls
// back to English.
//
// Imports only from @/lib/locales (deliberately standalone, no /content/
// scan) to keep this proxy's bundle within Vercel's 1 MB cap — same
// constraint noted on locales.ts itself.

function localeFromPathname(pathname: string): Locale {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "en";
  let first = segments[0];
  // Direct hits to the internal route (e.g. /intl/ja/...) — strip the
  // "intl" prefix so the second segment is read as the locale.
  if (first === "intl" && segments.length > 1) first = segments[1];
  return isTargetLanguage(first) ? first : "en";
}

export function proxy(request: NextRequest) {
  const locale = localeFromPathname(request.nextUrl.pathname);
  const dir = (RTL_LOCALES as readonly string[]).includes(locale) ? "rtl" : "ltr";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);
  requestHeaders.set("x-dir", dir);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Skip _next internals, the favicon, and any path that looks like a static
  // file (has a `.` in the last segment). Pages, RSC payloads, and dynamic
  // routes all run through the locale check.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
