import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, LOCALES, type Locale } from "@/lib/content";
import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import ToolShell from "@/components/tools/ToolShell";
import SolutionClient from "./SolutionClient";

const SLUG = "sap-solution-builder";
const LABEL = "SAP Solution Builder";
const DESCRIPTION =
  "Translate a business problem into a phased SAP solution outline — modules, integration architecture, roadmap, and budget envelope. No consultant required.";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await props.params;
  if (!LOCALES.includes(lang as Locale)) return {};
  const locale = lang as Locale;
  const page = getPage(SLUG, locale);
  if (page) return buildPageMetadata(page);
  return {
    title: LABEL,
    description: DESCRIPTION,
    alternates: { canonical: `${SITE_URL}/${SLUG}` },
  };
}

export default async function SolutionPage(props: { params: Promise<{ lang: string }> }) {
  const { lang } = await props.params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  return (
    <ToolShell slug={SLUG} label={LABEL} description={DESCRIPTION}>
      <SolutionClient />
    </ToolShell>
  );
}
