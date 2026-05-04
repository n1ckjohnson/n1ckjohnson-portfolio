import Image from "next/image";

type MediaAssetProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
};

function getExtension(src: string): string {
  return src.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
}

export function MediaAsset({
  src,
  alt,
  width,
  height,
  className = "w-full h-auto",
  priority = false,
}: MediaAssetProps) {
  const ext = getExtension(src);

  if (ext === "mp4" || ext === "webm") {
    return (
      <video
        src={src}
        width={width}
        height={height}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className={className}
      />
    );
  }

  // gif and auto-detected images without known dimensions → native img
  if (ext === "gif" || !width || !height) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        width={width}
        height={height}
        alt={alt}
        className={className}
      />
    );
  }

  // jpg, jpeg, png, webp with known dimensions → Next.js Image
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes="100vw"
      priority={priority}
      unoptimized={src.includes("?v=")}
    />
  );
}
