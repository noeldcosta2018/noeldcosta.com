import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, LOCALES, type Locale } from "@/lib/content";
import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import ToolShell from "@/components/tools/ToolShell";
import SapCostClient from "./SapCostClient";

const SLUG = "sap-implementation-cost-calculator";
const LABEL = "SAP Implementation Cost Calculator";
const DESCRIPTION =
  "SAP-specific cost, licence model, and timeline estimate — RISE, GROW, on-premise, or brownfield. Includes Fiori, ABAP, BTP, and migration costs.";

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

export default async function SapCostPage(props: { params: Promise<{ lang: string }> }) {
  const { lang } = await props.params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  return (
    <ToolShell slug={SLUG} label={LABEL} description={DESCRIPTION}>
      <SapCostClient />
    </ToolShell>
  );
}
