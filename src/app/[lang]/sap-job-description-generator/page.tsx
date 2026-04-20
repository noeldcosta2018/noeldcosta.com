import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, LOCALES, type Locale } from "@/lib/content";
import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import ToolShell from "@/components/tools/ToolShell";
import JdClient from "./JdClient";

const SLUG = "sap-job-description-generator";
const LABEL = "SAP Job Description Generator";
const DESCRIPTION =
  "Role-accurate SAP job descriptions with real compensation bands and interview focus areas — calibrated to seniority, region, and the specific SAP role family.";

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

export default async function JdPage(props: { params: Promise<{ lang: string }> }) {
  const { lang } = await props.params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  return (
    <ToolShell slug={SLUG} label={LABEL} description={DESCRIPTION}>
      <JdClient />
    </ToolShell>
  );
}
