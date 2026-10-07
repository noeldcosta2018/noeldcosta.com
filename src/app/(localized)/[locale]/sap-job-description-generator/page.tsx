import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolShell, {
  localizedToolLocale,
  localizedToolParams,
  toolMetadata,
} from "@/components/tools/ToolShell";
import { toolCopy, translateFields } from "@/components/tools/tool-i18n";
import { translator } from "@/i18n";
import JdClient from "@/app/(site)/sap-job-description-generator/JdClient";
import { FIELDS, HEADING, SUBMIT, TOOL } from "@/app/(site)/sap-job-description-generator/tool";

// Translated sap-job-description-generator (/de/sap-job-description-generator/ ...),
// only for locales whose interface dictionary is ready. The form labels are
// translated on the server (from the route's tool.ts via the dictionary);
// field values and the generated result stay English (result lang="en").

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

export default async function LocalizedJd({ params }: Props) {
  const { locale } = await params;
  const content = localizedToolLocale(locale, TOOL.slug);
  if (!content) notFound();
  const tr = translator(content);
  return (
    <ToolShell
      slug={TOOL.slug}
      label={TOOL.label}
      description={TOOL.description}
      title={TOOL.title}
      highlight={TOOL.highlight}
      group={TOOL.group}
      locale={content}
    >
      <JdClient
        fields={translateFields(FIELDS, content)}
        heading={tr(HEADING)}
        submitLabel={tr(SUBMIT)}
        copy={toolCopy(content)}
      />
    </ToolShell>
  );
}
