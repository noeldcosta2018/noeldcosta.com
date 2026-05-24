import type { Metadata } from "next";
import { getPage } from "@/lib/content";
import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import ToolShell from "@/components/tools/ToolShell";
import ErpCostClient from "./ErpCostClient";

const SLUG = "erp-implementation-cost-calculator";
const LABEL = "ERP Implementation Cost Calculator";
const DESCRIPTION =
  "Vendor-agnostic cost and timeline estimate for an ERP implementation — software, SI fees, data migration, training, and contingency included.";

export async function generateMetadata(): Promise<Metadata> {
  const page = getPage(SLUG, "en");
  if (page) return buildPageMetadata(page);
  return {
    title: LABEL,
    description: DESCRIPTION,
    alternates: { canonical: `${SITE_URL}/${SLUG}` },
  };
}

export default async function ErpCostPage() {
  return (
    <ToolShell slug={SLUG} label={LABEL} description={DESCRIPTION}>
      <ErpCostClient />
    </ToolShell>
  );
}
