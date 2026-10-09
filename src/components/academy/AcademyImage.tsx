import { existsSync } from "node:fs";
import { join } from "node:path";

/** Folder for the AI Academy images (public/media/academy/). */
export const ACADEMY_MEDIA = "/media/academy";

/** True once the file has been added to public/media/academy/. */
export function academyImageExists(file: string): boolean {
  return existsSync(join(process.cwd(), "public", "media", "academy", file));
}

/**
 * An AI Academy image, or, until the file is supplied, a neutral block at the
 * same ratio labelled with the expected file name. Width and height are always
 * set, so nothing shifts when the real image arrives.
 */
export default function AcademyImage({
  file,
  alt,
  width,
  height,
  className,
}: {
  file: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  if (academyImageExists(file)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={className}
        src={`${ACADEMY_MEDIA}/${file}`}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
      />
    );
  }
  return (
    <div className={`ar-placeholder${className ? ` ${className}` : ""}`} style={{ aspectRatio: `${width} / ${height}` }} role="img" aria-label={alt}>
      <span>{file}</span>
      <span className="size">
        {width} x {height}
      </span>
    </div>
  );
}
