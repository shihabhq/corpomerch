"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

import { PLACEHOLDER_IMAGE } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { ProductImageDTO } from "@/types/catalog";

/**
 * Square gallery with thumbnails below and a click-to-open lightbox.
 *
 * `crossFade` comes from ProductDetailDTO.swapsOnAxis1 — it is false when
 * axis 1 has no per-value imagery (Custom Pen's "Regular", PVC Banner's
 * white/black swatches). Fading to an identical image reads as a broken
 * control, so we simply do not animate in those cases.
 */
export function ProductGallery({
  images,
  productName,
  crossFade = true,
}: {
  images: ProductImageDTO[];
  productName: string;
  crossFade?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  // The image set changes when an axis-1 value is selected; snap back to the
  // first shot rather than leaving the user on an index that no longer exists.
  const firstId = images[0]?.id;
  useEffect(() => {
    setIndex(0);
  }, [firstId]);

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

  return (
    <div>
      <div className="group relative aspect-square w-full overflow-hidden rounded-xl border border-line bg-white">
        <Image
          // Keying on the image id restarts the fade when the source changes.
          key={crossFade ? current?.id : "static"}
          src={current?.url ?? PLACEHOLDER_IMAGE}
          alt={current?.alt ?? productName}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          priority
          quality={90}
          placeholder={current?.blurDataUrl ? "blur" : "empty"}
          blurDataURL={current?.blurDataUrl ?? undefined}
          className={cn(
            "object-contain p-4 sm:p-6",
            crossFade && "animate-fade-in",
          )}
        />

        {images.length > 0 ? (
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="absolute right-3 top-3 rounded-lg bg-white/90 p-2 text-ink opacity-0 shadow-sm backdrop-blur-sm transition-opacity hover:bg-white focus-visible:opacity-100 group-hover:opacity-100"
            aria-label="Open full-size image"
          >
            <Expand className="size-4" />
          </button>
        ) : null}

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-ink opacity-0 shadow-sm backdrop-blur-sm transition-opacity hover:bg-white focus-visible:opacity-100 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-ink opacity-0 shadow-sm backdrop-blur-sm transition-opacity hover:bg-white focus-visible:opacity-100 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <ul className="mt-3 grid grid-cols-5 gap-2 sm:gap-3">
          {images.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={i === safeIndex}
                className={cn(
                  "relative aspect-square w-full overflow-hidden rounded-lg border-2 bg-white transition-all",
                  i === safeIndex
                    ? "border-brand"
                    : "border-line hover:border-line-strong",
                )}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-contain p-1"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {lightbox && current ? (
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
            <Image
              src={current.url}
              alt={current.alt}
              fill
              sizes="100vw"
              quality={90}
              className="object-contain p-4 sm:p-10"
            />
            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            ) : null}
          </div>

          {images.length > 1 ? (
            <ul className="flex justify-center gap-2 overflow-x-auto p-4 scrollbar-none">
              {images.map((img, i) => (
                <li key={img.id}>
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    className={cn(
                      "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white",
                      i === safeIndex ? "border-brand" : "border-transparent opacity-60",
                    )}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image src={img.url} alt="" fill sizes="64px" className="object-contain p-1" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
