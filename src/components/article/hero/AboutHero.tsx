import FadeUp from "@/components/article/FadeUp";

const CALENDLY = "https://calendly.com/noeldcosta/30min";

/**
 * Hero block for the About / story page. Sits below the page title and
 * excerpt: the two direct actions (book a call, email) and a portrait.
 * A real picture and a real booking link, nothing decorative.
 */
export default function AboutHero() {
  return (
    <FadeUp as="section" className="not-prose nd-about-hero">
      <div className="nd-actions">
        <a
          href={CALENDLY}
          target="_blank"
          rel="noopener noreferrer"
          className="nd-btn nd-btn-primary magnetic"
        >
          Book a 30-min call <span aria-hidden="true">→</span>
        </a>
        <a href="mailto:solutions@noeldcosta.com" className="nd-btn nd-btn-secondary">
          Email me directly
        </a>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/media/noel-headshot-320.webp"
        alt="Portrait of Noel D'Costa"
        width={148}
        height={148}
      />
    </FadeUp>
  );
}
