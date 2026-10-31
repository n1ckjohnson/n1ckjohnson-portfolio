"use client";

import Link from "next/link";
import { useState } from "react";
import type { MediaItem } from "@/lib/media";
import { RevealImage } from "@/components/media/reveal-image";
import { IndexArrow, indexNumber } from "@/components/index/section-heading";
import { cn } from "@/lib/cn";

export type CreativeIndexItem = {
  slug: string;
  href: string;
  title: string;
  label: string;
  thumb: MediaItem | null;
};

/**
 * Editorial index with a preview that follows attention.
 *
 * ≥1024px: a sticky frame beside the list crossfades to whichever row is
 * hovered or focused (the last one stays until another is chosen).
 * <1024px (touch): each row carries its own thumbnail instead — nothing
 * is hidden behind hover.
 */
export function CreativeIndex({ items }: { items: CreativeIndexItem[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-x-6">
      <ol className="index lg:col-span-7">
        {items.map((item, i) => (
          <li key={item.slug}>
            <Link
              href={item.href}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className="index-row group grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-x-4 border-b border-line py-3 outline-offset-[-2px] sm:grid-cols-[8rem_minmax(0,1fr)_12rem_1rem] sm:gap-x-6 lg:grid-cols-[2.5rem_minmax(0,1fr)_11rem_1rem] lg:py-[1.125rem]"
            >
              <span className="relative aspect-video overflow-hidden rounded-[3px] bg-surface lg:hidden">
                {item.thumb ? (
                  <RevealImage src={item.thumb.src} alt="" fill sizes="(min-width: 640px) 128px, 88px" className="object-cover" />
                ) : null}
              </span>
              <span className="hidden text-small tabular-nums text-ink-3 lg:block">{indexNumber(i)}</span>
              <span className="min-w-0">
                <span className="block text-body font-medium text-ink">{item.title}</span>
                <span className="mt-0.5 block text-small text-ink-2 sm:hidden">{item.label}</span>
              </span>
              <span className="hidden text-small text-ink-2 sm:block">{item.label}</span>
              <IndexArrow className="index-arrow hidden text-ink opacity-30 sm:block" />
            </Link>
          </li>
        ))}
      </ol>

      <div className="hidden lg:col-span-5 lg:block" aria-hidden="true">
        <div className="sticky top-8 pt-4">
          <div className="relative aspect-video overflow-hidden rounded-[4px] bg-surface">
            {items.map((item, i) =>
              item.thumb ? (
                <div
                  key={item.slug}
                  className={cn(
                    "absolute inset-0 transition-[opacity,transform] ease-out",
                    i === active ? "scale-100 opacity-100 duration-base" : "scale-[1.025] opacity-0 duration-slow"
                  )}
                >
                  <RevealImage src={item.thumb.src} alt="" fill sizes="(min-width: 1216px) 470px, 40vw" className="object-cover" />
                </div>
              ) : null
            )}
          </div>
          <p className="mt-3 flex justify-between text-small">
            <span className="text-ink">{items[active]?.title}</span>
            <span className="tabular-nums text-ink-3">{indexNumber(active)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
