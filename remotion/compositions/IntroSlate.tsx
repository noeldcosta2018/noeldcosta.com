import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface IntroSlateProps {
  headline: string;
  subline: string;
  author: string;
}

/**
 * 16:9 intro slate (1920×1080).
 * YouTube video intro or LinkedIn banner animation.
 * Brand: corbeau background, papaya accent, bone headline.
 */
export const IntroSlate: React.FC<IntroSlateProps> = ({
  headline,
  subline,
  author,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineScale = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const headlineOpacity = spring({ frame, fps, from: 0, to: 1, delay: 15 });
  const headlineX = interpolate(frame, [15, 40], [-60, 0], {
    extrapolateRight: "clamp",
  });

  const sublineOpacity = spring({ frame, fps, from: 0, to: 1, delay: 30 });
  const sublineX = interpolate(frame, [30, 55], [-40, 0], {
    extrapolateRight: "clamp",
  });

  const authorOpacity = spring({ frame, fps, from: 0, to: 1, delay: 50 });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0e1020",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        alignItems: "center",
        padding: "0 160px",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          right: -100,
          top: "50%",
          transform: "translateY(-50%)",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(252,152,90,0.12) 0%, transparent 65%)",
        }}
      />

      {/* Left papaya bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 8,
          backgroundColor: "#fc985a",
          transformOrigin: "top",
          transform: `scaleY(${lineScale})`,
        }}
      />

      <div style={{ position: "relative", maxWidth: 1100 }}>
        {/* Headline */}
        <h1
          style={{
            opacity: headlineOpacity,
            transform: `translateX(${headlineX}px)`,
            fontFamily: "'Epilogue', sans-serif",
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: "#f4ede4",
            margin: 0,
            marginBottom: 28,
          }}
        >
          {headline}
        </h1>

        {/* Subline */}
        <p
          style={{
            opacity: sublineOpacity,
            transform: `translateX(${sublineX}px)`,
            fontSize: 44,
            fontWeight: 400,
            color: "rgba(244,237,228,0.65)",
            margin: 0,
            marginBottom: 56,
            lineHeight: 1.3,
          }}
        >
          {subline}
        </p>

        {/* Author tag */}
        <div
          style={{
            opacity: authorOpacity,
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#fc985a",
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 28,
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#fc985a",
            }}
          >
            {author}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
