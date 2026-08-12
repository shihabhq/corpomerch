import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";

import { ButtonLink } from "@/components/ui";
import { CONTACT, TRUST_STATS } from "@/data/site";
import { PLACEHOLDER_IMAGE } from "@/lib/storage";
import { cn, CONTAINER } from "@/lib/utils";
import type { ProductCardDTO } from "@/types/catalog";

/**
 * Typographic hero with a square-image collage.
 *
 * Deliberately not a banner slider: every supplied asset is a square 1000×1000
 * product shot, which crops badly into a wide hero slide. This layout uses the
 * squares as squares. Once real banner artwork exists in `homepage_banners`,
 * swap in a slider — the data is already wired.
 */
/**
 * Picks up to `count` products for the collage, favouring one per category so
 * the tiles read as "everything we supply" rather than four near-duplicate
 * shots from whichever category happens to sort first.
 */
function pickDiverseTiles(products: ProductCardDTO[], count: number) {
  const seenCategories = new Set<string>();
  const picked: ProductCardDTO[] = [];
  const leftover: ProductCardDTO[] = [];

  for (const product of products) {
    const categoryKey = product.primaryCategory?.slug ?? product.id;
    if (picked.length < count && !seenCategories.has(categoryKey)) {
      seenCategories.add(categoryKey);
      picked.push(product);
    } else {
      leftover.push(product);
    }
  }

  // Not enough distinct categories in the featured set — pad with whatever
  // is left rather than showing fewer than `count` tiles.
  for (const product of leftover) {
    if (picked.length >= count) break;
    picked.push(product);
  }

  return picked;
}

export function Hero({ products }: { products: ProductCardDTO[] }) {
  const tiles = pickDiverseTiles(products, 4);

  return (
    <section className="relative overflow-hidden border-b border-line bg-white">
      {/* Soft brand wash behind the copy */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-tint via-white to-white"
        aria-hidden
      />

      <div className={cn(CONTAINER, "relative py-12 md:py-16 lg:py-20")}>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand shadow-sm">
              <ShieldCheck className="size-3.5" aria-hidden />
              Event supply, end to end
            </p>

            <h1 className="mt-5 text-3xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-4xl lg:text-[3.25rem]">
              Everything your brand
              <br className="hidden sm:block" /> hands out,{" "}
              <span className="text-brand">made to order</span>.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-body">
              ID cards, lanyards, drinkware, pens, bags, certificates, banners
              and full delegate kits: sourced, branded and delivered anywhere in
              Bangladesh. Bulk pricing shown up front, quotes confirmed on
              WhatsApp.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/products" size="lg">
                Browse the catalogue
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2.5 rounded-lg border border-line-strong bg-white px-6 text-base font-medium text-ink transition-all hover:border-ink hover:bg-surface active:scale-[0.98]"
              >
                <MessageCircle className="size-5 text-[#25D366]" aria-hidden />
                Get a quote
              </a>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              {TRUST_STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block text-xl font-semibold tabular-nums text-ink sm:text-2xl">
                      {stat.value}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-tight text-muted">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Square collage */}
          {tiles.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {tiles.map((product, i) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className={cn(
                    "group relative aspect-square overflow-hidden rounded-xl border border-line bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg",
                    // Stagger the middle pair so the block does not read as a
                    // plain 2×2 grid.
                    i === 1 && "sm:translate-y-6",
                    i === 3 && "sm:translate-y-6",
                  )}
                >
                  <Image
                    src={product.image?.url ?? PLACEHOLDER_IMAGE}
                    alt={product.image?.alt ?? product.name}
                    fill
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    priority={i < 2}
                    placeholder={product.image?.blurDataUrl ? "blur" : "empty"}
                    blurDataURL={product.image?.blurDataUrl ?? undefined}
                    className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/90 to-transparent px-3 pb-2.5 pt-8">
                    <p className="truncate text-xs font-semibold text-ink">
                      {product.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
