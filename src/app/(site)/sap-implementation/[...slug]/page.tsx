import type { Metadata } from "next";
import CatchAllPage, { generateMetadata as catchAllMetadata } from "../../[...slug]/page";
import { nestedParams } from "@/lib/nested-routes";

// /sap-implementation/<child>/ pages. Rendering and metadata are the catch-all's,
// called with the full path; this folder only claims the URL ahead of the
// localized /[locale]/[...slug] route.
const PREFIX = "sap-implementation";

export const dynamicParams = false;

export function generateStaticParams() {
  return nestedParams(PREFIX);
}

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return catchAllMetadata({ params: Promise.resolve({ slug: [PREFIX, ...slug] }) });
}

export default async function SapImplementationChild({ params }: Props) {
  const { slug } = await params;
  return CatchAllPage({ params: Promise.resolve({ slug: [PREFIX, ...slug] }) });
}
