import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, LOCALES, type Locale } from "@/lib/content";
import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import ToolShell from "@/components/tools/ToolShell";
import ErpCostClient from "./ErpCostClient";

const SLUG = "erp-implementation-cost-calculator";
const LABEL = "ERP Implementation Cost Calculator";
const DESCRIPTION =
  "Vendor-agnostic cost and timeline estimate for an ERP implementation — software, SI fees, data migration, training, and contingency included.";

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

export default async function ErpCostPage(props: { params: Promise<{ lang: string }> }) {
  const { lang } = await props.params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  return (
    <ToolShell slug={SLUG} label={LABEL} description={DESCRIPTION}>
      <ErpCostClient />
    </ToolShell>
  );
}
