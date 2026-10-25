/**
 * ProjectCAPEX mark: four rounded tiles in a 2x2 grid, the last one a circle.
 * Copied from the product's own logo (CommandCC repo, packages/ui/src/Logo.tsx)
 * so the card shows the real mark. The fills are fixed brand art and stay the
 * same in light and dark themes. Decorative: the visible "ProjectCAPEX"
 * wordmark next to it names the product.
 */
export default function ProjectCapexMark({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 44 44"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="0" y="0" width="20" height="20" rx="6" fill="#6161FF" />
      <rect x="24" y="0" width="20" height="20" rx="6" fill="#FDAB3D" />
      <rect x="0" y="24" width="20" height="20" rx="6" fill="#FF158A" />
      <rect x="24" y="24" width="20" height="20" rx="10" fill="#00C875" />
    </svg>
  );
}
