import FadeUp from "@/components/article/FadeUp";

/**
 * "I safeguard your investment" statement band (nd-band) used as a
 * chapter break on the story page. A quote, not a call to action: no
 * buttons and no hover state.
 */
export default function SafeguardBand() {
  return (
    <FadeUp as="section" className="not-prose nd-block">
      <div className="nd-band">
        <span className="star" aria-hidden="true">
          ★
        </span>
        <div>
          <span
            className="nd-label"
            style={{ display: "block", color: "var(--accent)", marginBottom: 8 }}
          >
            My commitment
          </span>
          <p>
            &ldquo;I safeguard your investment from the predictable mistakes
            that turn ERP programmes into business disasters.&rdquo;
          </p>
        </div>
      </div>
    </FadeUp>
  );
}
