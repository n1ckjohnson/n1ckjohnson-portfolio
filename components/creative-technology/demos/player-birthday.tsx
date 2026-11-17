import type { BirthdayDemo } from "@/content/creative-technology/projects/player-birthday";
import type { DemoProps } from "@/components/creative-technology/demos/types";
import { Withheld, image } from "@/components/creative-technology/ui/media";
import { BirthdayScene, type BirthdayPlayer } from "@/components/creative-technology/demos/player-birthday.client";

/**
 * Player birthdays. One player's graphic is assembled from the layer
 * groups of its production PSD, becomes the delivered file, and joins the
 * rest of the batch. Any graphic in the batch opens large.
 */
export function PlayerBirthdayDemo({ project, media }: DemoProps<BirthdayDemo>) {
  const { players: list, build } = project.demo;
  const players: BirthdayPlayer[] = list.flatMap((player) => {
    const graphic = image(media, player.graphic);
    return graphic ? [{ key: player.key, name: player.name, position: player.position, number: player.number, graphic }] : [];
  });
  const focus = players.find((player) => player.key === build.player);
  const layers = build.layers.flatMap((layer) => {
    const shot = image(media, layer.asset);
    return shot ? [{ key: layer.key, media: shot }] : [];
  });

  if (!focus || layers.length !== build.layers.length) {
    return (
      <Withheld>
        The finished graphics carry player likenesses and signatures, so they are held back until they are cleared for publication.
      </Withheld>
    );
  }

  return (
    <div className="col">
      <BirthdayScene players={players} focus={focus} layers={layers} code={project.code.find((sample) => sample.key === "batch")} />
    </div>
  );
}
