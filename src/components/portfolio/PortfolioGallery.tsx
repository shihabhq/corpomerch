"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

import { assetUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { PortfolioImage } from "@/lib/queries";

/**
 * Case-study photo gallery: a large lead image with a thumbnail strip, and a
 * lightbox for the full shot.
 *
 * Unlike the product gallery these are photographs, so they use `object-cover`
 * on a dark pad — letterboxing a photo onto white looks like a mistake, whereas
 * letterboxing a cut-out product shot is correct.
 */
export function PortfolioGallery({
  images,
  title,
}: {
  images: PortfolioImage[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const safeIndex = Math.min(index, Math.max(0, images.length - 1));
  const current = images[safeIndex];

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, prev, next]);

  if (images.length === 0 || !current) return null;

  const currentUrl = assetUrl(current.storagePath);

  return (
    <div>
      <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-line bg-ink sm:aspect-[16/9]">
        {currentUrl ? (
          <Image
            key={current.storagePath}
            src={currentUrl}
            alt={current.alt || title}
            fill
            sizes="(min-width: 1280px) 1280px, 100vw"
            priority
            quality={90}
            placeholder={current.blurDataUrl ? "blur" : "empty"}
            blurDataURL={current.blurDataUrl}
            className="animate-fade-in object-contain"
          />
        ) : null}

        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute right-3 top-3 rounded-lg bg-white/90 p-2 text-ink opacity-0 shadow-sm backdrop-blur-sm transition-opacity hover:bg-white focus-visible:opacity-100 group-hover:opacity-100"
          aria-label="View full size"
        >
          <Expand className="size-4" />
        </button>

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-ink opacity-0 shadow-sm backdrop-blur-sm transition-opacity hover:bg-white focus-visible:opacity-100 group-hover:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-ink opacity-0 shadow-sm backdrop-blur-sm transition-opacity hover:bg-white focus-visible:opacity-100 group-hover:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight className="size-4" />
            </button>

            <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium tabular-nums text-white backdrop-blur-sm">
              {safeIndex + 1} / {images.length}
            </div>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 sm:gap-3">
          {images.map((img, i) => {
            const url = assetUrl(img.storagePath);
            return (
              <li key={img.storagePath}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`View photo ${i + 1}`}
                  aria-current={i === safeIndex}
                  className={cn(
                    "relative aspect-square w-full overflow-hidden rounded-lg border-2 bg-surface transition-all",
                    i === safeIndex
                      ? "border-brand"
                      : "border-line hover:border-line-strong",
                  )}
                >
                  {url ? (
                    <Image
                      src={url}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {lightbox ? (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/92 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm tabular-nums">
              {safeIndex + 1} of {images.length}
            </span>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              className="rounded-lg p-2 transition-colors hover:bg-white/10"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="relative flex-1">
            {currentUrl ? (
              <Image
                src={currentUrl}
                alt={current.alt || title}
                fill
                sizes="100vw"
                quality={90}
                className="object-contain p-4 sm:p-10"
              />
            ) : null}

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                  aria-label="Next photo"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            ) : null}
          </div>

          {current.alt ? (
            <p className="px-6 pb-5 text-center text-xs text-white/70">
              {current.alt}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
