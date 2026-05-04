import Image from "next/image";
import { cn } from "@/lib/cn";

type ImageSlotProps = {
  src?: string;
  alt?: string;
  aspect?: string;
  sizes?: string;
  contain?: boolean;
  containPadding?: string;
  bg?: string;
  className?: string;
};

export function ImageSlot({
  src,
  alt,
  aspect = "aspect-[16/9]",
  sizes = "100vw",
  contain = false,
  containPadding = "p-10 sm:p-14",
  bg,
  className
}: ImageSlotProps) {
  return (
    <div className={cn("relative w-full overflow-hidden", bg ?? "bg-[#EEECE8]", aspect, className)}>
      {src ? (
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          sizes={sizes}
          className={contain ? cn("object-contain", containPadding) : "object-cover"}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-brand text-[10px] uppercase tracking-[0.2em] text-[#B0ADA8]">
            [ Image ]
          </p>
        </div>
      )}
    </div>
  );
}
