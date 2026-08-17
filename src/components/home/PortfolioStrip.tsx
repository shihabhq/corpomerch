import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";

import { assetUrl } from "@/lib/storage";
import type { getPortfolioItems } from "@/lib/queries";

type PortfolioListItem = Awaited<ReturnType<typeof getPortfolioItems>>[number];

/**
 * Home-page teaser for the portfolio. Wide 16:10 crops rather than the square
 * product treatment — these are photographs of finished jobs, not cut-outs.
 */
export function PortfolioStrip({ items }: { items: PortfolioListItem[] }) {
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {items.map((item) => {
        const cover = assetUrl(item.coverPath);
        return (
          <li key={item.id}>
            <Link
              href={`/portfolio/${item.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lg active:scale-[0.99]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink">
                {cover ? (
                  <Image
                    src={cover}
                    alt={item.gallery[0]?.alt ?? item.title}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    placeholder={item.gallery[0]?.blurDataUrl ? "blur" : "empty"}
                    blurDataURL={item.gallery[0]?.blurDataUrl}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-white/30">
                    <ImageIcon className="size-8" aria-hidden />
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-12">
                  {item.eventType ? (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/80">
                      {item.eventType}
                    </p>
                  ) : null}
                  <h3 className="mt-1 text-base font-semibold leading-snug text-white sm:text-lg">
                    {item.title}
                  </h3>
                  {item.client ? (
                    <p className="mt-0.5 text-xs text-white/70">{item.client}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                {item.summary ? (
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted">
                    {item.summary}
                  </p>
                ) : null}
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-semibold text-brand">
                  Read the case study
                  <ArrowRight
                    className="size-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
