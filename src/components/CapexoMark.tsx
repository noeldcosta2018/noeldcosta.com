/**
 * Capexo mark: three rounded squares and a circle in a 2x2 grid, in one
 * colour (Capexo orange, #D44400). Matches the product's own logo at
 * https://capexo.co. The fill is fixed brand art and stays the same in light
 * and dark themes. Decorative: the visible "Capexo" wordmark next to it
 * names the product.
 */
export default function CapexoMark({
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
      <g fill="#D44400">
        <rect x="0" y="0" width="20" height="20" rx="6" />
        <rect x="24" y="0" width="20" height="20" rx="6" />
        <rect x="0" y="24" width="20" height="20" rx="6" />
        <rect x="24" y="24" width="20" height="20" rx="10" />
      </g>
    </svg>
  );
}
