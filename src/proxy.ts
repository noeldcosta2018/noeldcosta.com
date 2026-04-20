import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALES } from "@/lib/locales";

const LOCALE_SET = new Set<string>(LOCALES);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through: root-level static assets and paths with file extensions
  if (
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Pass through: if the first path segment is already a known locale
  const firstSegment = pathname.split("/")[1];
  if (LOCALE_SET.has(firstSegment)) {
    return NextResponse.next();
  }

  // Rewrite everything else to the /en prefix (invisible to the user)
  const rewriteTarget = pathname === "/" ? "/en" : `/en${pathname}`;
  return NextResponse.rewrite(new URL(rewriteTarget, request.url));
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|fonts|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
