import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface ArticleCardProps {
  title: string;
  category: string;
  readingMinutes: number;
  url: string;
}

/**
 * 9:16 article promo card (1080×1920).
 * Uses the site's brand palette: corbeau bg, papaya accents, bone text.
 * Animates in three layers: background, category tag, then title.
 */
export const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  category,
  readingMinutes,
  url,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tagOpacity = spring({ frame, fps, from: 0, to: 1, delay: 10 });
  const tagY = interpolate(frame, [10, 30], [20, 0], { extrapolateRight: "clamp" });

  const titleOpacity = spring({ frame, fps, from: 0, to: 1, delay: 25 });
  const titleY = interpolate(frame, [25, 50], [30, 0], { extrapolateRight: "clamp" });

  const metaOpacity = spring({ frame, fps, from: 0, to: 1, delay: 45 });

  const urlOpacity = spring({ frame, fps, from: 0, to: 1, delay: 60 });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0e1020", // corbeau
        fontFamily: "'Inter', sans-serif",
        padding: "80px 72px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      {/* Subtle top-right glow */}
      <div
        style={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(252,152,90,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Papaya accent line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          backgroundColor: "#fc985a",
        }}
      />

      {/* Category tag */}
      <div
        style={{
          opacity: tagOpacity,
          transform: `translateY(${tagY}px)`,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: "#fc985a",
          }}
        />
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#fc985a",
          }}
        >
          {category}
        </span>
      </div>

      {/* Title */}
      <h1
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: "'Epilogue', sans-serif",
          fontSize: 72,
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          color: "#f4ede4", // bone
          margin: 0,
          marginBottom: 48,
        }}
      >
        {title}
      </h1>

      {/* Meta row */}
      <div
        style={{
          opacity: metaOpacity,
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginBottom: 60,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 26,
            color: "rgba(244,237,228,0.5)",
            letterSpacing: "0.06em",
          }}
        >
          {readingMinutes} MIN READ
        </span>
        <span style={{ color: "rgba(244,237,228,0.2)", fontSize: 26 }}>·</span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 26,
            color: "rgba(244,237,228,0.5)",
            letterSpacing: "0.06em",
          }}
        >
          NOEL D&apos;COSTA
        </span>
      </div>

      {/* URL */}
      <div
        style={{
          opacity: urlOpacity,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 28,
          color: "#fc985a",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {url}
      </div>
    </AbsoluteFill>
  );
};
