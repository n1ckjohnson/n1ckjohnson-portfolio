import type { SplashDemo } from "@/content/creative-technology/projects/splash-screens";
import type { DemoProps } from "@/components/creative-technology/demos/types";
import { Withheld } from "@/components/creative-technology/ui/media";
import { SplashBouquet, type SplashCard } from "@/components/creative-technology/demos/splash-screens.client";

const weekName = (week: string) => (week.startsWith("PW") ? `Preseason Week ${week.slice(2)}` : `Week ${week.slice(1)}`);

/**
 * Game Week splash screens. One delivered animation opens into every
 * matchup version of itself. Each screen is the real Lottie file over its
 * real phone background; nothing is redrawn for the page.
 */
export function SplashScreensDemo({ project, media }: DemoProps<SplashDemo>) {
  const { games, backgrounds, spec } = project.demo;

  const cards = games.flatMap((game): SplashCard[] => {
    const lottie = media[game.lottie];
    if (!lottie || lottie.kind !== "lottie") return [];
    const poster = media[game.poster];
    return [
      {
        key: game.key,
        name: `${weekName(game.week)} ${game.site === "home" ? "vs" : "at"} ${game.opponent}${game.edition ? `, ${game.edition}` : ""}`,
        lottie: lottie.src,
        poster: poster && poster.kind === "image" ? poster : null,
        background: media[backgrounds[game.background]]?.src ?? null,
      },
    ];
  });

  if (!cards.length) return <Withheld />;

  return (
    <figure className="wide">
      <SplashBouquet cards={cards} ratio={spec.width / spec.height} />
    </figure>
  );
}
