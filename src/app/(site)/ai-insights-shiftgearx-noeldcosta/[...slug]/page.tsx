import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ErpCostPage, {
  generateMetadata as erpCostMetadata,
} from "../../erp-implementation-cost-calculator/page";
import { nestedParams } from "@/lib/nested-routes";

// /ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/ is the
// canonical ERP calculator URL (246 Search Console clicks). It renders the
// working calculator, the same as the flat alias, whose canonical points here.
const PREFIX = "ai-insights-shiftgearx-noeldcosta";
const CALCULATOR = "erp-implementation-cost-calculator";

export const dynamicParams = false;

export function generateStaticParams() {
  return nestedParams(PREFIX);
}

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug.join("/") !== CALCULATOR) return {};
  return erpCostMetadata();
}

export default async function AiInsightsChild({ params }: Props) {
  const { slug } = await params;
  if (slug.join("/") !== CALCULATOR) notFound();
  return ErpCostPage();
}
