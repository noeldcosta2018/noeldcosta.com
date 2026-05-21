/**
 * Brand wordmark — "noeldcosta" with two papaya sparkles above the "l".
 *
 * Inlined SVG (not <img src="/brand/...">) on purpose. When an SVG is
 * loaded via <img>, the browser renders it in an isolated context and
 * @import inside <style> is ignored — so the Outfit Black font would
 * silently fall back to system-ui. Inlining keeps the wordmark in the
 * page's font-loading context so the actual Outfit weight gets applied.
 *
 * The asset files at /public/brand/noeldcosta-on-{light,dark}.svg are
 * the same artwork, kept for downloads, OG images, and social share.
 *
 * Variant: "on-light" = corbeau ink for cream/bone surfaces (nav).
 *          "on-dark"  = bone ink for corbeau surfaces (footer).
 */
type Props = {
  variant: "on-light" | "on-dark";
  /** Rendered height in px. Width is derived from the 600x130 viewBox. */
  height?: number;
  className?: string;
};

export default function BrandWordmark({
  variant,
  height = 28,
  className,
}: Props) {
  const ink = variant === "on-light" ? "#0e1020" : "#fffdf9";
  const width = Math.round((600 / 130) * height);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 130"
      width={width}
      height={height}
      role="img"
      aria-label="noeldcosta"
      className={className}
    >
      <defs>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@900&display=swap');
          .nd-wordmark-${variant} {
            font-family: 'Outfit', system-ui, -apple-system, sans-serif;
            font-weight: 900;
            font-size: 92px;
            letter-spacing: -0.04em;
            fill: ${ink};
          }
          .nd-sparkle-${variant} { fill: #fc985a; }
        `}</style>
      </defs>

      <text x="18" y="98" className={`nd-wordmark-${variant}`}>
        noeldcosta
      </text>

      <g transform="translate(174, 8)" className={`nd-sparkle-${variant}`}>
        <path d="M 14 0 C 14 8, 8 14, 0 14 C 8 14, 14 20, 14 28 C 14 20, 20 14, 28 14 C 20 14, 14 8, 14 0 Z" />
      </g>

      <g transform="translate(206, 22)" className={`nd-sparkle-${variant}`}>
        <path d="M 8 0 C 8 4.5, 4.5 8, 0 8 C 4.5 8, 8 11.5, 8 16 C 8 11.5, 11.5 8, 16 8 C 11.5 8, 8 4.5, 8 0 Z" />
      </g>
    </svg>
  );
}
