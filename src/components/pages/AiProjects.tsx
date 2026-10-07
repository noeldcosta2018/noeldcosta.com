import { translator } from "@/i18n";
import type { Locale } from "@/lib/locales";

// Anonymised AI project outlines (working plan section 4.3a). Noel approved
// publishing them on 7 October 2026. Sector only, no client names, no numbers.
export const AI_PROJECTS = [
  {
    sector: "Public sector",
    title: "A private assistant for policy and procurement rules",
    text: "A government entity wanted staff to ask questions of its policies, circulars and procurement rules without sending documents to a public AI service. I helped pick the first use cases, set up the deployment so data stayed inside their environment, define who could see what, and build a test set of real questions to check answers before rollout.",
  },
  {
    sector: "Aviation",
    title: "AI on finance exceptions",
    text: "An airline's finance team spent days each month clearing invoice and payment exceptions. I helped design an AI step that reads each exception, suggests the likely cause and routes it to the right person, with a human approving every posting.",
  },
  {
    sector: "Defence",
    title: "AI on a network with no internet access",
    text: "A defence manufacturer needed engineers to search technical documents and change records inside a restricted network. I helped choose a model that runs on their own infrastructure, set access by clearance, and decide what the assistant must never answer.",
  },
  {
    sector: "Retail",
    title: "Answers for store teams",
    text: "A retailer's store teams asked the same product, stock and policy questions every day. I helped scope an assistant over approved product and policy content, reading stock from the ERP, with clear limits on what it could change.",
  },
  {
    sector: "SAP Joule",
    title: "Joule readiness",
    text: "An SAP customer wanted to know what Joule would do for them. I worked out what their licence included, what had to be set up, and which processes were standard enough to benefit.",
  },
];

/**
 * The AI projects as a table, in the same style as the programmes table on
 * the homepage. Used under Client work on the homepage (h3) and on
 * /case-studies/ (h2).
 */
export default function AiProjects({ locale, level = 3 }: { locale?: Locale; level?: 2 | 3 }) {
  const tr = translator(locale);
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <div className="nd-ai-projects">
      <Heading id="ai-projects" className={level === 2 ? undefined : "nd-display nd-ai-projects-title"}>
        {tr("AI projects")}
      </Heading>
      <p className="nd-lede">
        {tr("Most of my AI work is for public sector, aviation, defence and retail organisations. Client names stay private.")}
      </p>
      <div className="nd-table-wrap" tabIndex={0} role="region" aria-label={tr("AI projects table")}>
        <table>
          <caption className="sr-only">{tr("AI projects by sector and what I did")}</caption>
          <thead>
            <tr>
              <th scope="col">{tr("Sector")}</th>
              <th scope="col">{tr("Project")}</th>
              <th scope="col">{tr("What I did")}</th>
            </tr>
          </thead>
          <tbody>
            {AI_PROJECTS.map((p) => (
              <tr key={p.title}>
                <td>{tr(p.sector)}</td>
                <th scope="row">{tr(p.title)}</th>
                <td>{tr(p.text)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
