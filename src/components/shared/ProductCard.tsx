import Image from "next/image";
import Link from "next/link";
import { Layers } from "lucide-react";

import { Badge } from "@/components/ui";
import { PLACEHOLDER_IMAGE } from "@/lib/storage";
import { cn, formatBDT, formatQty, unitLabel } from "@/lib/utils";
import type { ProductCardDTO } from "@/types/catalog";

/**
 * The one product card. There is no "featured" or "compact" variant class —
 * if you need a difference, add a prop. (The reference project ended up with
 * four near-identical cards and they drifted apart within a month.)
 */
export function ProductCard({
  product,
  priority = false,
  sizes = "(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
}: {
  product: ProductCardDTO;
  priority?: boolean;
  sizes?: string;
}) {
  const {
    slug,
    name,
    shortDescription,
    image,
    minUnitPrice,
    effectiveMoq,
    pricingMode,
    badgeText,
    unit,
    unitLabel: unitOverride,
    variantCount,
  } = product;

  const onRequest = pricingMode === "ON_REQUEST" || minUnitPrice === null;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white",
        "shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lg",
        "active:scale-[0.98]",
      )}
    >
      {/* Square image pad. Every source asset is 1000x1000 and already shot on
          white, so the pad is true white — never bg-surface — or the seam
          between the photo's background and the card shows. */}
      <div className="relative aspect-square w-full overflow-hidden bg-white">
        <Image
          src={image?.url ?? PLACEHOLDER_IMAGE}
          alt={image?.alt ?? name}
          fill
          sizes={sizes}
          priority={priority}
          placeholder={image?.blurDataUrl ? "blur" : "empty"}
          blurDataURL={image?.blurDataUrl ?? undefined}
          className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.04] sm:p-3"
        />

        {badgeText ? (
          <div className="absolute left-3 top-3">
            <Badge>{badgeText}</Badge>
          </div>
        ) : null}

        {variantCount > 1 ? (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium text-body shadow-sm backdrop-blur-sm">
            <Layers className="size-3" aria-hidden />
            {variantCount} options
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col border-t border-line p-3.5 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-brand sm:text-base">
          <Link href={`/products/${slug}`} className="before:absolute before:inset-0">
            {name}
          </Link>
        </h3>

        {shortDescription ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
            {shortDescription}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0">
            {onRequest ? (
              <p className="text-sm font-semibold text-ink">Price on request</p>
            ) : (
              <>
                <p className="flex items-baseline gap-1">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-faint">
                    From
                  </span>
                  <span className="text-lg font-semibold tabular-nums text-brand sm:text-xl">
                    {formatBDT(minUnitPrice)}
                  </span>
                </p>
                <p className="text-[11px] text-muted">
                  / {unitLabel(unit, 1, unitOverride)}
                </p>
              </>
            )}
          </div>

          {effectiveMoq ? (
            <span className="shrink-0 rounded-full bg-surface px-2 py-1 text-[10px] font-medium leading-none text-muted">
              MOQ {formatQty(effectiveMoq, unit, unitOverride)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="aspect-square w-full animate-pulse bg-surface-alt" />
      <div className="space-y-2 border-t border-line p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-alt" />
        <div className="h-3 w-full animate-pulse rounded bg-surface-alt" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-surface-alt" />
      </div>
    </div>
  );
}

export function ProductGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {children}
    </div>
  );
}
