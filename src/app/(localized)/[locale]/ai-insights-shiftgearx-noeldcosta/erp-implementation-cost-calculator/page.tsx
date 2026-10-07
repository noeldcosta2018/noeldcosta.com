import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolShell, {
  localizedToolLocale,
  localizedToolParams,
  toolMetadata,
} from "@/components/tools/ToolShell";
import ErpCostClient from "@/app/(site)/erp-implementation-cost-calculator/ErpCostClient";
import { TOOL } from "@/app/(site)/erp-implementation-cost-calculator/tool";

// Translated erp-implementation-cost-calculator (/de/ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/ ...),
// only for locales whose interface dictionary is ready. The page around the
// tool is translated; the tool widget itself is English only and marked
// lang="en" (toolInEnglish).

export const dynamicParams = false;

export function generateStaticParams() {
  return localizedToolParams(TOOL.slug);
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const content = localizedToolLocale(locale, TOOL.slug);
  return content ? toolMetadata(TOOL, content) : {};
}

export default async function LocalizedErpCost({ params }: Props) {
  const { locale } = await params;
  const content = localizedToolLocale(locale, TOOL.slug);
  if (!content) notFound();
  return (
    <ToolShell
      slug={TOOL.slug}
      label={TOOL.label}
      description={TOOL.description}
      title={TOOL.title}
      highlight={TOOL.highlight}
      group={TOOL.group}
      locale={content}
      toolInEnglish
    >
      <ErpCostClient />
    </ToolShell>
  );
}
