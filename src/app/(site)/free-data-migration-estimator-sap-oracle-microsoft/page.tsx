import type { Metadata } from "next";
import { getPage } from "@/lib/content";
import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import ToolShell from "@/components/tools/ToolShell";
import MigrationClient from "./MigrationClient";

const SLUG = "free-data-migration-estimator-sap-oracle-microsoft";
const LABEL = "Data Migration Estimator";
const DESCRIPTION =
  "Effort, tooling, and risk estimate for ERP data migration programmes — SAP, Oracle, and Microsoft. Covers master data, transactional history, custom objects, and cutover strategy.";

export async function generateMetadata(): Promise<Metadata> {
  const page = getPage(SLUG, "en");
  if (page) return buildPageMetadata(page);
  return {
    title: LABEL,
    description: DESCRIPTION,
    alternates: { canonical: `${SITE_URL}/${SLUG}/` },
  };
}

export default async function MigrationPage() {
  return (
    <ToolShell slug={SLUG} label={LABEL} description={DESCRIPTION}>
      <MigrationClient />
    </ToolShell>
  );
}
