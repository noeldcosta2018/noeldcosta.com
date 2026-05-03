import { Composition } from "remotion";
import { ArticleCard, type ArticleCardProps } from "./compositions/ArticleCard";
import { IntroSlate, type IntroSlateProps } from "./compositions/IntroSlate";

/**
 * Remotion root — registers all video compositions.
 * Launch the studio with: npm run remotion
 * Render a video with: npm run remotion:render
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 9:16 short-form card — share an article on LinkedIn / Instagram Stories */}
      <Composition
        id="ArticleCard"
        component={ArticleCard}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={
          {
            title: "SAP Performance Testing: What IT Leaders Must Know",
            category: "ERP Strategy",
            readingMinutes: 12,
            url: "noeldcosta.com",
          } satisfies ArticleCardProps
        }
      />

      {/* 16:9 intro slate — YouTube video intro / LinkedIn banner */}
      <Composition
        id="IntroSlate"
        component={IntroSlate}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={
          {
            headline: "SAP Performance Testing",
            subline: "What IT Leaders Must Know in 2025",
            author: "Noel D'Costa",
          } satisfies IntroSlateProps
        }
      />
    </>
  );
};
