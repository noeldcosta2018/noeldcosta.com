import type { Metadata } from "next";
import AuthorArchive, { authorMetadata } from "./AuthorArchive";

// Live WordPress author archive, kept at the same URL. The page itself lives
// in AuthorArchive so the translated route renders the same template.

export function generateMetadata(): Metadata {
  return authorMetadata("en");
}

export default function AuthorPage() {
  return <AuthorArchive />;
}
